const graphemeSegmenters = new Map<string, Intl.Segmenter>();

/** Split text into user-perceived characters using locale-aware grapheme rules. */
export function splitGraphemes(text: string, locale = "en"): string[] {
    const lang = locale || "en";
    let segmenter = graphemeSegmenters.get(lang);
    if (!segmenter) {
        segmenter = new Intl.Segmenter(lang, { granularity: "grapheme" });
        graphemeSegmenters.set(lang, segmenter);
    }
    return Array.from(segmenter.segment(text.normalize("NFC")), ({ segment }) => segment);
}

/** Words keep spaces and hyphens in their labels. Grid cells hold letters only. */
export function wordGraphemes(word: string, locale = "en"): string[] {
    return splitGraphemes(word, locale).filter(grapheme => /\p{L}/u.test(grapheme));
}

/** Uppercase one grapheme without allowing case expansion to occupy extra cells. */
export function displayGrapheme(grapheme: string, locale = "en"): string {
    const normalized = grapheme.normalize("NFC");
    const upper = normalized.toLocaleUpperCase(locale);
    return splitGraphemes(upper, locale).length === 1 ? upper : normalized;
}

/** Get the first letter grapheme from keyboard or IME text for a single grid cell. */
export function firstLetterGrapheme(text: string, locale = "en"): string | undefined {
    return wordGraphemes(text, locale)[0];
}

export function sameGrapheme(a: string, b: string, locale: string): boolean {
    return a.normalize("NFC").toLocaleLowerCase(locale) === b.normalize("NFC").toLocaleLowerCase(locale);
}

/** Create a filler alphabet from graphemes in the puzzle words. */
export function getFillerGraphemes(words: { word: string }[], locale = "en"): string[] {
    return Array.from(new Set(words.flatMap(({ word }) => wordGraphemes(word, locale).map(letter => displayGrapheme(letter, locale)))));
}
