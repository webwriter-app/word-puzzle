/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-word-puzzle";
import { parseDelimited, parsePuzzleJson, parseWordCsv, parseWordText, wordCsv } from "../src/model/word-list";
import csvFixture from "./fixtures/words.csv";
import textFixture from "./fixtures/words.txt";
import jsonFixture from "./fixtures/puzzle.json";
import { block, cleanup, mount, open, parts, until, wordsOf } from "./helpers";

mocha.setup(getMochaConfig());

const file = (text: string, name: string, type = "") => new File([text], name, { type });
const empty = () => mount('<webwriter-word-puzzle type="crossword"></webwriter-word-puzzle>').then(({ widget }) => widget as any);
const saved = (widget: HTMLElement) => JSON.parse(block(widget)!.textContent!).wordsClues as { word: string; clueText: string | null; x?: number }[];

describe("<webwriter-word-puzzle> conversions", function () {
  this.timeout(15000);
  afterEach(cleanup);

  describe("parsing", function () {
    it("reads CSV with a header, quotes, another delimiter, blank lines and duplicates", function () {
      const { wordsClues } = parseWordCsv(csvFixture);
      assert.deepEqual(wordsClues, [
        { word: "Cat", clueText: 'Says "meow"' },
        { word: "Dog", clueText: "Barks" },
        { word: "Bird", clueText: null },
      ]);
      assert.deepEqual(parseDelimited("a,b\r\n\"x,\ny\",z"), [["a", "b"], ["x,\ny", "z"]]);
    });

    it("picks the column delimiter by consistency, not by the clue text", function () {
      assert.deepEqual(parseWordCsv("cat,Furry; has; claws\ndog,Barks").wordsClues.map(entry => [entry.word, entry.clueText]), [
        ["cat", "Furry; has; claws"], ["dog", "Barks"],
      ]);
      assert.deepEqual(parseWordCsv("word;clue\ncat;Furry, small").wordsClues.map(entry => [entry.word, entry.clueText]), [["cat", "Furry, small"]]);
    });

    it("reads text with an optional clue after a tab", function () {
      assert.deepEqual(parseWordText(textFixture).wordsClues.map(entry => [entry.word, entry.clueText]), [
        ["Tiger", "Striped big cat"], ["Zebra", null], ["Lion", "King of the jungle"],
      ]);
    });

    it("refuses an empty list, bad JSON and a broken layout with a code", function () {
      assert.throws(() => parseWordCsv("word,clue\n,\n"), Error, "empty");
      assert.throws(() => parsePuzzleJson("{"), Error, "json");
      assert.throws(() => parsePuzzleJson('{"wordsClues": 3}'), Error, "shape");
      assert.throws(() => parsePuzzleJson('{"wordsClues": [{"word": "Cat", "x": 2, "y": 0}]}'), Error, "layout");
      assert.throws(() => parsePuzzleJson('{"wordsClues": [{"word": "Cat", "x": 1000000, "y": 0, "across": true}]}'), Error, "layout");
    });
  });

  describe("files", function () {
    it("imports CSV and generates the puzzle; nothing changes before the apply function runs", async function () {
      const widget = await empty();
      const apply = await widget.importCsv(file(csvFixture, "words.csv", "text/csv"));
      assert.deepEqual(wordsOf(widget), []);
      apply();
      await until(() => wordsOf(widget).length === 3, "three words");
      assert.sameMembers(wordsOf(widget), ["Cat", "Dog", "Bird"]);
      await until(() => saved(widget).length === 3, "the block");
      assert.isTrue(saved(widget).some(entry => entry.x != null), "no layout was generated");
    });

    it("rejects an invalid file with a message and leaves the widget alone", async function () {
      const widget = await open("Crossword-Animals");
      await until(() => wordsOf(widget).length === 11, "words");
      for (const [method, text] of [["importCsv", ",\n"], ["importText", "\n\n"], ["importJson", "[]"], ["importJson", "nope"]] as const) {
        let error: Error | undefined;
        try { await (widget as any)[method](file(text, "x")); } catch (caught) { error = caught as Error; }
        assert.match(error?.message ?? "", /file/i, `${method} accepted ${text}`);
      }
      assert.equal(wordsOf(widget).length, 11);
    });

    it("round trips the widget's own JSON with its layout and type", async function () {
      const widget = await empty();
      (await widget.importJson(file(JSON.stringify(jsonFixture), "puzzle.json", "application/json")))();
      await until(() => wordsOf(widget).length === 2, "two words");
      const exported = widget.exportJson() as File;
      assert.equal(exported.type, "application/json");
      assert.match(exported.name, /\.json$/);
      const data = JSON.parse(await exported.text());
      assert.deepEqual(data, jsonFixture);
      const other = await empty();
      (await other.importJson(exported))();
      assert.deepEqual(parts(other).grid._wordsClues, parts(widget).grid._wordsClues);
    });

    it("round trips CSV and text through the exports", async function () {
      const widget = await empty();
      (await widget.importCsv(file(csvFixture, "words.csv")))();
      await until(() => wordsOf(widget).length === 3, "words");
      const csv = widget.exportCsv() as File;
      assert.equal(csv.type, "text/csv");
      const text = widget.exportText() as File;
      assert.equal(text.type, "text/plain");
      const expected = [["Cat", 'Says "meow"'], ["Dog", "Barks"], ["Bird", null]].sort();
      for (const [exported, parse] of [[csv, parseWordCsv], [text, parseWordText]] as const) {
        const parsed = parse(await exported.text()).wordsClues.map(entry => [entry.word, entry.clueText]).sort();
        assert.deepEqual(parsed, expected);
      }
      assert.match(wordCsv([{ word: "a;b", clueText: "x,y" }]), /"a;b","x,y"/);
    });

    it("imports JSON into a find-the-words puzzle and switches the type", async function () {
      const widget = await empty();
      const data = { ...jsonFixture, type: "find-the-words" };
      (await widget.importJson(file(JSON.stringify(data), "p.json")))();
      assert.equal(widget.type, "find-the-words");
    });
  });

  describe("DOM conversions", function () {
    const fragment = (html: string) => document.createRange().createContextualFragment(html);

    it("takes a dl, a list and nothing else", async function () {
      const widget = await empty();
      assert.isFalse(widget.loadDl(fragment("<p>none</p>")));
      assert.isFalse(widget.loadList(fragment("<ul></ul>")));
      assert.isTrue(widget.loadDl(fragment("<dl><dt>Tiger</dt><dd>Striped</dd><dd>big cat</dd><div><dt>Zebra</dt></div></dl>")));
      await until(() => wordsOf(widget).length === 2, "dl words");
      assert.equal(parts(widget).grid._wordsClues.find((entry: any) => entry.word === "Tiger").clueText, "Striped big cat");
      assert.isTrue(widget.loadList(fragment("<ol><li>One</li><li> Two </li></ol>")));
      await until(() => wordsOf(widget).includes("Two"), "list words");
      assert.sameMembers(wordsOf(widget), ["One", "Two"]);
    });

    it("exports the words as a dl and back", async function () {
      const widget = await empty();
      assert.isNull(widget.toDl());
      (await widget.importText(file(textFixture, "w.txt")))();
      await until(() => wordsOf(widget).length === 3, "words");
      const list = widget.toDl() as HTMLElement;
      assert.equal(list.localName, "dl");
      assert.deepEqual([...list.children].map(child => `${child.localName}:${child.textContent}`),
        ["dt:Tiger", "dd:Striped big cat", "dt:Zebra", "dt:Lion", "dd:King of the jungle"]);
      const other = await empty();
      assert.isTrue(other.loadDl(fragment(list.outerHTML)));
      assert.sameMembers(wordsOf(other), ["Tiger", "Zebra", "Lion"]);
    });
  });

  describe("actions", function () {
    it("generates the puzzle again from the words and clears the answers", async function () {
      const widget = await open("Crossword-Animals") as any;
      await until(() => wordsOf(widget).length === 11, "words");
      widget.generatePuzzle();
      assert.equal(wordsOf(widget).length, 11);
      const { grid } = parts(widget);
      await until(() => grid.gridEl?.querySelector('.cell[answer="true"] .cell-letter'), "cells");
      const cell = grid.gridEl.querySelector('.cell[answer="true"] .cell-letter') as HTMLElement;
      cell.textContent = "Q";
      widget.clearAnswers();
      assert.equal(cell.textContent, "");
    });
  });
});

mocha.run();
