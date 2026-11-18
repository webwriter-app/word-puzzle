import { generateCrosswordFromList, type WordClue } from "./crossword-gen";
import { wordGraphemes } from "./graphemes";

/** Why a word list could not be read. The widget turns the code into a localized message. */
export class WordListError extends Error {
    constructor(readonly code: "empty" | "json" | "shape" | "layout") {
        super(code);
    }
}

export type PuzzleType = "crossword" | "find-the-words";

export interface ParsedPuzzle {
    /** Set when the file names a puzzle type. */
    type?: PuzzleType;
    wordsClues: WordClue[];
    /** The words come with a layout (coordinates), so the puzzle is not generated again. */
    placed: boolean;
}

const BOM = "﻿";
const HEADER_CLUES = new Set(["clue", "clues", "hint", "hints"]);

/** Collapses whitespace so that a word or clue fits one table cell. */
const tidy = (text: string) => text.replace(/\s+/g, " ").trim();

/** One entry per distinct word (ignoring case), words without a letter are dropped. The first clue wins. */
function entries(rows: [string, string][]): WordClue[] {
    const seen = new Map<string, WordClue>();
    for (const [rawWord, rawClue] of rows) {
        const word = tidy(rawWord);
        if (!wordGraphemes(word).length) continue;
        const key = word.normalize("NFC").toLowerCase();
        const clue = tidy(rawClue);
        const known = seen.get(key);
        if (known) {
            if (!known.clueText && clue) known.clueText = clue;
            continue;
        }
        seen.set(key, { word, clueText: clue || null });
    }
    return [...seen.values()];
}

/** The delimiter that splits the first line most often (comma, semicolon or tab), ignoring quoted text. */
function delimiterOf(text: string): string {
    // Count the delimiters of the first lines outside quotes. A delimiter that occurs equally often in every line is
    // a column separator; of several such, the rarest one is taken because clue text often holds commas or semicolons.
    const marks = [",", ";", "\t"];
    const lines: number[][] = [[0, 0, 0]];
    let quoted = false;
    for (const char of text) {
        if (char === '"') quoted = !quoted;
        else if (!quoted && (char === "\n" || char === "\r")) {
            if (lines[lines.length - 1].some(Boolean)) {
                if (lines.length >= 5) break;
                lines.push([0, 0, 0]);
            }
        }
        else if (!quoted && marks.includes(char)) lines[lines.length - 1][marks.indexOf(char)]++;
    }
    const filled = lines.filter((line) => line.some(Boolean));
    const consistent = marks.map((_, i) => i).filter((i) => filled.length > 0 && filled[0][i] > 0 && filled.every((line) => line[i] === filled[0][i]));
    if (consistent.length) return marks[consistent.reduce((best, i) => (filled[0][i] < filled[0][best] ? i : best))];
    const first = lines[0];
    return marks[first.reduce((best, count, i) => (count > first[best] ? i : best), 0)];
}

/** Splits delimited text into rows of fields (RFC 4180 quoting). */
export function parseDelimited(text: string): string[][] {
    const source = text.startsWith(BOM) ? text.slice(1) : text;
    const delimiter = delimiterOf(source);
    const rows: string[][] = [];
    let row: string[] = [];
    let field = "";
    let quoted = false;
    for (let i = 0; i < source.length; i++) {
        const char = source[i];
        if (quoted) {
            if (char !== '"') field += char;
            else if (source[i + 1] === '"') { field += '"'; i++; }
            else quoted = false;
        }
        else if (char === '"' && !field) quoted = true;
        else if (char === delimiter) { row.push(field); field = ""; }
        else if (char === "\n" || char === "\r") {
            if (char === "\r" && source[i + 1] === "\n") i++;
            row.push(field);
            rows.push(row);
            row = [];
            field = "";
        }
        else field += char;
    }
    if (field || row.length) { row.push(field); rows.push(row); }
    return rows;
}

/** Word and clue pairs from any source, without duplicates. */
export function parseWordRows(rows: [string, string][]): ParsedPuzzle {
    const wordsClues = entries(rows);
    if (!wordsClues.length) throw new WordListError("empty");
    return { wordsClues, placed: false };
}

/** Words in the first column, clues in the second. A first row "word, clue" is a header. */
export function parseWordCsv(text: string): ParsedPuzzle {
    const rows = parseDelimited(text).filter(row => row.some(field => field.trim()));
    const first = rows[0];
    if (first && /^words?$/i.test(first[0].trim()) && (first[1] === undefined || HEADER_CLUES.has(first[1].trim().toLowerCase()))) rows.shift();
    return parseWordRows(rows.map(row => [row[0] ?? "", row[1] ?? ""]));
}

const csvField = (value: string) => (/[",\r\n;]|^\s|\s$/.test(value) ? `"${value.replace(/"/g, '""')}"` : value);

/** A header row and one row per word. The leading byte order mark lets spreadsheets read the UTF-8. */
export function wordCsv(wordsClues: WordClue[]): string {
    const lines = [["word", "clue"], ...wordsClues.map(({ word, clueText }) => [word, clueText ?? ""])];
    return BOM + lines.map(line => line.map(csvField).join(",")).join("\r\n") + "\r\n";
}

/** One word per line; a tab after the word starts its clue. */
export function parseWordText(text: string): ParsedPuzzle {
    const lines = (text.startsWith(BOM) ? text.slice(1) : text).split(/\r\n|\r|\n/);
    return parseWordRows(lines.map(line => {
        const tab = line.indexOf("\t");
        return tab < 0 ? [line, ""] : [line.slice(0, tab), line.slice(tab + 1)];
    }));
}

export function wordText(wordsClues: WordClue[]): string {
    return wordsClues.map(({ word, clueText }) => (clueText ? `${word}\t${clueText}` : word)).join("\n") + "\n";
}

/** A grid coordinate or clue number. The bound keeps a hostile file from asking for an enormous grid. */
const isIndex = (value: unknown): value is number => Number.isInteger(value) && (value as number) >= 0 && (value as number) <= 99;

/**
 * The widget's own data: the puzzle type and the words with their clues and, when the puzzle was generated,
 * their place on the grid. Placed words keep their layout.
 */
export function parsePuzzleJson(text: string): ParsedPuzzle {
    let data: unknown;
    try {
        data = JSON.parse(text);
    }
    catch {
        throw new WordListError("json");
    }
    const source = data as { type?: unknown; wordsClues?: unknown };
    if (!source || typeof source !== "object" || !Array.isArray(source.wordsClues)) throw new WordListError("shape");
    if (source.type !== undefined && source.type !== "crossword" && source.type !== "find-the-words") throw new WordListError("shape");
    const wordsClues: WordClue[] = [];
    for (const item of source.wordsClues as Record<string, unknown>[]) {
        if (!item || typeof item !== "object" || typeof item.word !== "string" || !wordGraphemes(item.word).length) throw new WordListError("shape");
        if (item.clueText != null && typeof item.clueText !== "string") throw new WordListError("shape");
        const entry: WordClue = { word: tidy(item.word), clueText: item.clueText ? tidy(item.clueText as string) || null : null };
        if (item.x != null || item.y != null) {
            if (!isIndex(item.x) || !isIndex(item.y) || typeof item.across !== "boolean") throw new WordListError("layout");
            entry.x = item.x;
            entry.y = item.y;
            entry.across = item.across;
            if (item.clueNumber != null) {
                if (!isIndex(item.clueNumber)) throw new WordListError("layout");
                entry.clueNumber = item.clueNumber;
            }
        }
        wordsClues.push(entry);
    }
    if (!wordsClues.length) throw new WordListError("empty");
    const placed = wordsClues.some(entry => entry.x != null);
    if (placed) {
        // The widget builds its grid from these coordinates; a layout that cannot be built is refused here.
        try {
            generateCrosswordFromList(wordsClues);
        }
        catch {
            throw new WordListError("layout");
        }
    }
    return { type: source.type as PuzzleType | undefined, wordsClues, placed };
}

export function puzzleJson(type: PuzzleType, wordsClues: WordClue[]): string {
    return JSON.stringify({ type, wordsClues }, null, 2) + "\n";
}
