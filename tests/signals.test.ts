/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-word-puzzle";
import { cleanup, open, parts, until, wordsOf } from "./helpers";

mocha.setup(getMochaConfig());

const pointer = (type: string, x: number, y: number) =>
  new PointerEvent(type, { pointerId: 3, pointerType: "touch", clientX: x, clientY: y, button: 0, bubbles: true, composed: true, cancelable: true });
const centre = (element: Element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};
const cellAt = (grid: any, row: number, col: number) => grid.shadowRoot.querySelector(`[grid-row="${row}"][grid-col="${col}"]`) as HTMLElement;

describe("<webwriter-word-puzzle> signals", function () {
  this.timeout(15000);
  afterEach(cleanup);

  it("publishes stable progress and solved signals for a crossword", async function () {
    const widget = await open("Crossword-Animals") as any;
    await until(() => wordsOf(widget).length === 11, "words");
    const { progress, solved } = widget.signals;
    assert.strictEqual(widget.signals.progress, progress, "the signal instance changed");
    const { grid } = parts(widget);
    const cells = await until(() => {
      const found = [...grid.gridEl.querySelectorAll('.cell[answer="true"]')] as HTMLElement[];
      return found.length ? found : null;
    }, "answer cells");
    assert.equal(progress.get(), 0);
    assert.isFalse(solved.get());
    const letter = (cell: HTMLElement) => cell.querySelector(".cell-letter") as HTMLElement;
    const answer = (cell: HTMLElement) => grid.grid[Number(cell.getAttribute("grid-row"))][Number(cell.getAttribute("grid-col"))].answer as string;
    letter(cells[0]).textContent = answer(cells[0]);
    await until(() => progress.get() > 0, "progress after one letter");
    assert.approximately(progress.get(), 1 / cells.length, 1e-9);
    letter(cells[1]).textContent = answer(cells[1]) === "X" ? "Y" : "X";
    await until(() => false, "no change for a wrong letter", 300).catch(() => undefined);
    assert.approximately(progress.get(), 1 / cells.length, 1e-9, "a wrong letter counted");
    cells.forEach(cell => (letter(cell).textContent = answer(cell)));
    await until(() => solved.get(), "solved");
    assert.equal(progress.get(), 1);
    widget.clearAnswers();
    await until(() => progress.get() === 0, "progress after clearing");
    assert.isFalse(solved.get());
  });

  it("counts the words found in find-the-words", async function () {
    const widget = await open("Find-The-Words-Fruits") as any;
    await until(() => wordsOf(widget).length > 3, "words");
    const { grid } = parts(widget);
    await until(() => grid.gridEl?.querySelector(".cell"), "cells");
    const total = grid._wordsClues.filter((entry: any) => entry.x != null).length;
    assert.equal(widget.signals.progress.get(), 0);
    const word = grid._wordsClues.find((entry: any) => entry.x != null && entry.across);
    const length = [...word.word].filter(letter => /\p{L}/u.test(letter)).length;
    cellAt(grid, word.x, word.y + length - 1).scrollIntoView({ block: "center" });
    const from = centre(cellAt(grid, word.x, word.y)), to = centre(cellAt(grid, word.x, word.y + length - 1));
    cellAt(grid, word.x, word.y).dispatchEvent(pointer("pointerdown", from.x, from.y));
    grid.gridEl.dispatchEvent(pointer("pointermove", to.x, to.y));
    grid.gridEl.dispatchEvent(pointer("pointerup", to.x, to.y));
    await until(() => widget.signals.progress.get() > 0, "progress after a word");
    assert.approximately(widget.signals.progress.get(), 1 / total, 1e-9);
    widget.clearAnswers();
    await until(() => widget.signals.progress.get() === 0, "progress after clearing");
  });

  it("a receiver reads the signal and reacts to changes", async function () {
    const widget = await open("Crossword-Animals") as any;
    await until(() => wordsOf(widget).length === 11, "words");
    const seen: number[] = [widget.signals.progress.get()];
    const lifetime = new AbortController();
    const { grid } = parts(widget);
    const cell = await until(() => grid.gridEl?.querySelector('.cell[answer="true"]') as HTMLElement | null, "a cell");
    const poll = setInterval(() => { const value = widget.signals.progress.get(); if (seen.at(-1) !== value) seen.push(value); }, 20);
    lifetime.signal.addEventListener("abort", () => clearInterval(poll));
    cell.querySelector(".cell-letter")!.textContent = grid.grid[Number(cell.getAttribute("grid-row"))][Number(cell.getAttribute("grid-col"))].answer;
    await until(() => seen.length > 1, "a change");
    lifetime.abort();
    assert.equal(seen[0], 0);
    assert.isAbove(seen.at(-1)!, 0);
  });
});

mocha.run();
