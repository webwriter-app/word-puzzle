/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-word-puzzle";
 import { block, cleanup, edit, hasDrawer, mount, open, parts, until, wait, wordsOf } from "./helpers";

mocha.setup(getMochaConfig());

const firstRow = (widget: HTMLElement) =>
  (parts(widget).input.shadowRoot.querySelector(".clueboxInput") as HTMLTableElement).tBodies[0].rows[0];
// Typing changes the text node Lit rendered; replacing it with textContent would break Lit's part.
const type = (cell: HTMLElement, text: string) => {
  const node = [...cell.childNodes].find((child): child is Text => child.nodeType === Node.TEXT_NODE);
  if (node) node.data = text; else cell.append(text);
};
const save = (widget: HTMLElement) =>
  (parts(widget).input.shadowRoot.querySelector('sl-button[variant="success"]') as HTMLElement).click();

describe("<webwriter-word-puzzle> data block", function () {
  afterEach(cleanup);

  it("the authored block is read", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "11 words in the grid");
    assert.include(wordsOf(widget), "Giraffe");
    await until(() => parts(widget).clues.shadowRoot.textContent.includes("Tall with long neck"), "clues rendered");
  });

  it("an author's change is written to the same block, keeping other keys and attributes", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    const before = block(widget)!;
    const data = JSON.parse(before.textContent!);
    before.textContent = JSON.stringify({ ...data, other: { keep: "<me>" } });
    await wait(100);
    edit(widget);
    await until(() => hasDrawer(widget), "the drawer");
    const row = firstRow(widget);
    type(row.cells[0], "Dolphin");
    type(row.cells[2], "Clever sea mammal");
    save(widget);
    await until(() => block(widget)!.textContent!.includes("Dolphin"), "the block to carry the new word");
    const after = JSON.parse(block(widget)!.textContent!);
    assert.isTrue(widget.querySelectorAll(":scope > script").length === 1 && block(widget) === before, "the block was replaced or duplicated");
    assert.equal(block(widget)!.getAttribute("slot"), "data");
    assert.equal(block(widget)!.getAttribute("type"), "application/json");
    assert.equal(after.other?.keep, "<me>", "a key the widget does not know was lost");
    assert.isTrue(Array.isArray(after.wordsClues) && after.wordsClues.some((w: any) => w.word === "Dolphin" && w.clueText === "Clever sea mammal"), "the word is not in the data");
    assert.notInclude(block(widget)!.textContent!, "<", "an angle bracket is not escaped");
    assert.equal(widget.getAttribute("type"), "crossword", "the type attribute changed");
    await until(() => wordsOf(widget).includes("Dolphin"), "the grid to show the new word");
  });

  it("the first write creates the block as slot=data JSON", async function () {
    const { widget } = await mount(`<webwriter-word-puzzle type="crossword"></webwriter-word-puzzle>`);
    edit(widget);
    await until(() => hasDrawer(widget), "the drawer");
    const row = firstRow(widget);
    type(row.cells[0], "Cat"); type(row.cells[2], "Pet");
    save(widget);
    await until(() => block(widget), "a data block");
    assert.equal(block(widget)!.getAttribute("slot"), "data");
    assert.equal(block(widget)!.getAttribute("type"), "application/json");
    assert.equal(JSON.parse(block(widget)!.textContent!).wordsClues[0].word, "Cat");
  });

  it("a change made from outside (undo, remote) reaches the widget", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    block(widget)!.textContent = JSON.stringify({ wordsClues: [{ word: "Owl", clueText: "Night bird", x: 0, y: 0, across: true, clueNumber: 1 }] });
    await until(() => wordsOf(widget).length === 1 && wordsOf(widget)[0] === "Owl", "the grid to follow the block");
  });

  it("an unreadable block is replaced by the author's next change, as before", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    const errors: unknown[] = [];
    widget.addEventListener("ww-dataerror", event => errors.push((event as CustomEvent).detail), true);
    block(widget)!.textContent = "{ not json";
    await until(() => errors.length > 0, "the data error");
    edit(widget);
    await until(() => hasDrawer(widget), "the drawer");
    const row = firstRow(widget);
    type(row.cells[0], "Fox"); type(row.cells[2], "Red");
    save(widget);
    await until(() => { try { return JSON.parse(block(widget)!.textContent!).wordsClues.some((w: any) => w.word === "Fox"); } catch { return false; } }, "the block to be repaired");
  });

  it("Ctrl+Enter in the drawer still generates the puzzle", async function () {
    const widget = await open("Crossword-Animals");
    edit(widget);
    await until(() => hasDrawer(widget), "the drawer");
    const cell = firstRow(widget).cells[0];
    type(cell, "Lynx");
    cell.dispatchEvent(new KeyboardEvent("keydown", { key: "Enter", ctrlKey: true, bubbles: true, composed: true, cancelable: true }));
    await until(() => block(widget)!.textContent!.includes("Lynx"), "the block to carry Lynx");
    await until(() => wordsOf(widget).includes("Lynx"), "the grid to show Lynx");
  });
});

mocha.run();
