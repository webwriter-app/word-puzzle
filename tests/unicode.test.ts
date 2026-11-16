/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import { generateCrosswordFromList } from "../src/model/crossword-gen";
import { displayGrapheme, firstLetterGrapheme, getFillerGraphemes, splitGraphemes } from "../src/model/graphemes";

mocha.setup(getMochaConfig());

describe("graphemes in crossword generation", function () {
  it("splits combining text and words into grapheme clusters", function () {
    assert.deepEqual(splitGraphemes("café", "fr"), ["c", "a", "f", "é"]);
    assert.deepEqual(splitGraphemes("東京", "ja"), ["東", "京"]);
  });

  it("places one normalized grapheme in each grid cell", function () {
    const grid = generateCrosswordFromList([{ word: "café", x: 0, y: 0, across: true }] as any, "fr");
    assert.deepEqual(grid[0].slice(0, 4).map(cell => cell.answer), ["C", "A", "F", "É"]);
    assert.equal(grid[0].slice(0, 4).filter(cell => cell.white).length, 4);
  });

  it("uses locale-aware casing without expanding a grapheme into extra cells", function () {
    assert.equal(displayGrapheme("i", "tr"), "İ");
    assert.equal(displayGrapheme("ı", "tr"), "I");
    assert.equal(displayGrapheme("ß", "de"), "ß");
  });

  it("extracts a single letter grapheme from IME text", function () {
    assert.equal(firstLetterGrapheme("éclair", "fr"), "é");
    assert.equal(firstLetterGrapheme("🙂あいう", "ja"), "あ");
    assert.equal(firstLetterGrapheme("🙂", "ja"), undefined);
  });

  it("builds word-search filler from the puzzle's graphemes", function () {
    const filler = getFillerGraphemes([{ word: "東京" }, { word: "大阪" }] as any, "ja");
    assert.deepEqual(new Set(filler), new Set(["東", "京", "大", "阪"]));
    assert.isTrue(filler.every(letter => splitGraphemes(letter, "ja").length === 1));
    assert.isTrue(filler.every(letter => !/[A-Z]/.test(letter)));
  });

  it("omits separators from a multiword answer while preserving its label", function () {
    const answer = { word: "su samuru", x: 0, y: 0, across: true };
    const grid = generateCrosswordFromList([answer] as any, "tr");
    assert.deepEqual(grid[0].slice(0, 8).map(cell => cell.answer), [..."SUSAMURU"]);
    assert.equal(answer.word, "su samuru");
    assert.isFalse(getFillerGraphemes([answer] as any, "tr").includes(" "));
  });
});

mocha.run();
