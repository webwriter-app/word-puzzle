import assert from "node:assert/strict";
import test from "node:test";

import {
  displayGrapheme,
  firstLetterGrapheme,
  generateCrosswordFromList,
  getFillerGraphemes,
  splitGraphemes,
} from "../src/lib/crossword-gen.ts";

test("splits combining text and words into grapheme clusters", () => {
  assert.deepEqual(splitGraphemes("cafe\u0301", "fr"), ["c", "a", "f", "é"]);
  assert.deepEqual(splitGraphemes("東京", "ja"), ["東", "京"]);
});

test("places one normalized grapheme in each grid cell", () => {
  const grid = generateCrosswordFromList(
    [{ word: "cafe\u0301", x: 0, y: 0, across: true }],
    "fr",
  );

  assert.deepEqual(grid[0].slice(0, 4).map(cell => cell.answer), ["C", "A", "F", "É"]);
  assert.equal(grid[0].slice(0, 4).filter(cell => cell.white).length, 4);
});

test("uses locale-aware casing without expanding a grapheme into extra cells", () => {
  assert.equal(displayGrapheme("i", "tr"), "İ");
  assert.equal(displayGrapheme("ı", "tr"), "I");
  assert.equal(displayGrapheme("ß", "de"), "ß");
});

test("extracts a single letter grapheme from IME text", () => {
  assert.equal(firstLetterGrapheme("e\u0301clair", "fr"), "é");
  assert.equal(firstLetterGrapheme("🙂あいう", "ja"), "あ");
  assert.equal(firstLetterGrapheme("🙂", "ja"), undefined);
});

test("builds word-search filler from the puzzle's graphemes", () => {
  const filler = getFillerGraphemes([{ word: "東京" }, { word: "大阪" }], "ja");

  assert.deepEqual(new Set(filler), new Set(["東", "京", "大", "阪"]));
  assert.ok(filler.every(letter => splitGraphemes(letter, "ja").length === 1));
  assert.ok(filler.every(letter => !/[A-Z]/.test(letter)));
});

test("omits separators from a multiword answer while preserving its label", () => {
  const answer = { word: "su samuru", x: 0, y: 0, across: true };
  const grid = generateCrosswordFromList([answer], "tr");

  assert.deepEqual(grid[0].slice(0, 8).map(cell => cell.answer), [..."SUSAMURU"]);
  assert.equal(answer.word, "su samuru");
  assert.ok(!getFillerGraphemes([answer], "tr").includes(" "));
});
