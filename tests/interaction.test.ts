/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-word-puzzle";
import { cleanup, edit, hasDrawer, mount, open, parts, snippet, until, wait, wordsOf } from "./helpers";

mocha.setup(getMochaConfig());

const press = (target: Element, key: string, init: KeyboardEventInit = {}) => {
  const event = new KeyboardEvent("keydown", { key, bubbles: true, composed: true, cancelable: true, ...init });
  target.dispatchEvent(event);
  return event;
};
const active = (widget: HTMLElement) => {
  const grid = parts(widget).grid;
  return grid.shadowRoot.activeElement as HTMLElement | null;
};
const letterOf = (cell: Element) => cell.querySelector(".cell-letter")!.textContent;
const pointer = (type: string, x: number, y: number, pointerType = "touch") =>
  new PointerEvent(type, { pointerId: 7, pointerType, clientX: x, clientY: y, button: 0, bubbles: true, composed: true, cancelable: true });
const centre = (element: Element) => {
  const box = element.getBoundingClientRect();
  return { x: box.left + box.width / 2, y: box.top + box.height / 2 };
};
const cellAt = (grid: any, row: number, col: number) =>
  grid.shadowRoot.querySelector(`[grid-row="${row}"][grid-col="${col}"]`) as HTMLElement;
const placed = (grid: any) => grid._wordsClues.find((entry: any) => entry.x != null && entry.across) as { word: string; x: number; y: number };

describe("<webwriter-word-puzzle> keyboard and pointer input", function () {
  this.timeout(10000);
  afterEach(cleanup);

  it("types letters, ignores modifier keys and leaves the grid with Escape", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    const { grid } = parts(widget);
    await until(() => grid.gridEl?.querySelector('[contenteditable="true"]'), "cells");
    widget.focus();
    const cell = await until(() => active(widget), "focus in the grid", 3000);
    press(cell, "Shift", { shiftKey: true });
    press(cell, "Enter");
    assert.equal(letterOf(cell), "", "a named key wrote a letter");
    press(cell, "q");
    assert.equal(letterOf(cell), "Q");
    assert.notEqual(active(widget), cell, "focus stays after a letter");
    const event = press(active(widget)!, "r", { ctrlKey: true });
    assert.isFalse(event.defaultPrevented, "a browser shortcut was blocked");
    press(active(widget)!, "Escape");
    await until(() => !active(widget), "focus out of the grid", 3000);
    assert.equal(widget.shadowRoot!.activeElement?.id, "answer-check");
  });

  it("keeps the cell intact on paste, cut, undo and delete input", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    const { grid } = parts(widget);
    await until(() => grid.gridEl?.querySelector('[contenteditable="true"]'), "cells");
    widget.focus();
    const cell = await until(() => active(widget), "focus in the grid");
    const before = (type: string, init: InputEventInit = {}) => {
      const event = new InputEvent("beforeinput", { inputType: type, bubbles: true, composed: true, cancelable: true, ...init });
      cell.dispatchEvent(event);
      return event;
    };
    const data = new DataTransfer();
    data.setData("text/plain", "xyz");
    const paste = before("insertFromPaste", { dataTransfer: data });
    assert.isTrue(paste.defaultPrevented, "paste was not intercepted");
    assert.isNotNull(cell.querySelector(".cell-letter"));
    for (const type of ["historyUndo", "insertParagraph", "insertFromDrop"]) assert.isTrue(before(type).defaultPrevented, type);
    cell.querySelector(".cell-letter")!.textContent = "Q";
    assert.isTrue(before("deleteByCut").defaultPrevented);
    assert.equal(letterOf(cell), "", "cut did not empty the letter");
    assert.isNotNull(cell.querySelector(".cell-letter"));
    press(cell, "Backspace");
    assert.isNotNull(cell.querySelector(".cell-letter"));
  });

  it("carries print rules that hide the controls and keep the grid", async function () {
    const widget = await open("Crossword-Animals");
    const rules = [...widget.shadowRoot!.adoptedStyleSheets, ...Array.from(widget.shadowRoot!.styleSheets)]
      .flatMap(sheet => Array.from(sheet.cssRules))
      .filter((rule): rule is CSSMediaRule => rule instanceof CSSMediaRule && rule.conditionText.includes("print"));
    assert.isAbove(rules.length, 0, "no @media print rule");
    const text = rules.map(rule => rule.cssText).join("\n");
    assert.include(text, "display: none");
    assert.include(text, "break-inside: avoid");
  });

  it("jumps to the next and previous clue with Tab and Shift+Tab", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    const { grid } = parts(widget);
    await until(() => grid.gridEl?.querySelector('[contenteditable="true"]'), "cells");
    widget.focus();
    const first = await until(() => active(widget), "focus in the grid");
    press(first, "Tab");
    const second = active(widget)!;
    assert.notEqual(second, first);
    press(second, "Tab", { shiftKey: true });
    await until(() => active(widget) === first, "Shift+Tab back to the first clue");
  });

  it("labels the cells and describes the keys", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => wordsOf(widget).length === 11, "words");
    const { grid } = parts(widget);
    const cell = await until(() => grid.gridEl?.querySelector('[contenteditable="true"]'), "cells") as HTMLElement;
    assert.match(cell.getAttribute("aria-label")!, /\d/);
    assert.include(cell.getAttribute("aria-describedby"), "help");
    assert.isAbove(grid.shadowRoot.getElementById("help").textContent.length, 10);
  });

  it("marks a word of a find-the-words puzzle with the keyboard", async function () {
    const widget = await open("Find-The-Words-Fruits");
    await until(() => wordsOf(widget).length > 3, "words");
    const { grid } = parts(widget);
    await until(() => grid.gridEl?.querySelector(".cell"), "cells");
    const word = placed(grid);
    const length = [...word.word].filter(letter => /\p{L}/u.test(letter)).length;
    const start = cellAt(grid, word.x, word.y);
    start.focus();
    assert.equal(grid.shadowRoot.querySelectorAll('.cell[tabindex="0"]').length, 1, "more than one tab stop");
    press(start, "Enter");
    assert.isTrue(start.hasAttribute("anchor"));
    let at = start;
    for (let i = 1; i < length; i++) { press(at, "ArrowRight"); at = active(widget)!; }
    assert.equal(at, cellAt(grid, word.x, word.y + length - 1));
    press(at, "Enter");
    for (let i = 0; i < length; i++) assert.isTrue(cellAt(grid, word.x, word.y + i).hasAttribute("correct"), `letter ${i} is not marked`);
    assert.isFalse(start.hasAttribute("anchor"));
    assert.include(grid.shadowRoot.querySelector('[role="status"]').textContent, word.word);
  });

  it("cancels a started word with Escape", async function () {
    const widget = await open("Find-The-Words-Fruits");
    await until(() => wordsOf(widget).length > 3, "words");
    const { grid } = parts(widget);
    await until(() => grid.gridEl?.querySelector(".cell"), "cells");
    const start = cellAt(grid, 0, 0);
    start.focus();
    press(start, "Enter");
    press(start, "Escape");
    assert.isFalse(start.hasAttribute("anchor"));
    assert.isNull(grid.shadowRoot.querySelector("svg line"));
  });

  for (const pointerType of ["mouse", "touch", "pen"]) {
    it(`marks a word by dragging with a ${pointerType} pointer`, async function () {
      const widget = await open("Find-The-Words-Fruits");
      await until(() => wordsOf(widget).length > 3, "words");
      const { grid } = parts(widget);
      await until(() => grid.gridEl?.querySelector(".cell"), "cells");
      const word = placed(grid);
      const length = [...word.word].filter(letter => /\p{L}/u.test(letter)).length;
      cellAt(grid, word.x, word.y + length - 1).scrollIntoView({ block: "center" });
      const from = centre(cellAt(grid, word.x, word.y));
      const to = centre(cellAt(grid, word.x, word.y + length - 1));
      cellAt(grid, word.x, word.y).dispatchEvent(pointer("pointerdown", from.x, from.y, pointerType));
      assert.isNotNull(grid.shadowRoot.querySelector("svg line"), "no line while dragging");
      grid.gridEl.dispatchEvent(pointer("pointermove", to.x, to.y, pointerType));
      grid.gridEl.dispatchEvent(pointer("pointerup", to.x, to.y, pointerType));
      for (let i = 0; i < length; i++) assert.isTrue(cellAt(grid, word.x, word.y + i).hasAttribute("correct"), `letter ${i} is not marked`);
      assert.isNull(grid.shadowRoot.querySelector("svg line"), "the line stays after the drag");
    });
  }

  it("does not scroll the page from the find-the-words grid and keeps the crossword scrollable", async function () {
    const find = await open("Find-The-Words-Fruits");
    const cross = await open("Crossword-Animals");
    await until(() => wordsOf(find).length > 3 && wordsOf(cross).length > 3, "words");
    assert.equal(getComputedStyle(parts(find).grid.gridEl).touchAction, "none");
    assert.notEqual(getComputedStyle(parts(cross).grid.gridEl).touchAction, "none");
  });
});

describe("<webwriter-word-puzzle> layout and theme", function () {
  this.timeout(10000);
  afterEach(cleanup);

  for (const width of [300, 768, 2100]) {
    for (const name of ["Crossword-Animals", "Find-The-Words-Fruits"] as const) {
      it(`${name} fits a container ${width}px wide`, async function () {
        const { widget, host } = await mount(snippet(name));
        host.style.width = `${width}px`;
        await until(() => wordsOf(widget).length > 3, "words");
        await wait(200);
        assert.isAtMost(widget.scrollWidth, widget.clientWidth + 1, "the widget scrolls sideways");
        const box = widget.getBoundingClientRect();
        const grid = parts(widget).grid.gridEl.getBoundingClientRect();
        assert.isAtMost(grid.right, box.right + 1, "the grid reaches out of the widget");
        assert.isAtLeast(grid.left, box.left - 1);
        const cell = parts(widget).grid.gridEl.querySelector(".cell").getBoundingClientRect();
        assert.isAtLeast(cell.width, 18);
        assert.isAtMost(cell.width, 42.5);
        assert.isAtLeast(box.height, 160);
      });
    }
  }

  it("takes text color, font and accent from the document theme and keeps its colors without one", async function () {
    const { widget, host } = await mount(snippet("Crossword-Animals"));
    await until(() => wordsOf(widget).length > 3, "words");
    const { grid, clues } = parts(widget);
    const clueCell = () => clues.shadowRoot.querySelector("td[clue]") as HTMLElement;
    const plain = { color: getComputedStyle(clueCell()).color, family: getComputedStyle(clueCell()).fontFamily };
    const tint = () => getComputedStyle(grid.gridEl).getPropertyValue("--accent-soft").trim();
    assert.equal(tint(), "", "a tint without a theme would change the default colors");
    host.style.cssText = "--ww-text-color: rgb(10, 20, 30); --ww-font-family: Georgia, serif; --ww-theme-accent-1: rgb(200, 40, 40)";
    await wait(50);
    assert.equal(getComputedStyle(clueCell()).color, "rgb(10, 20, 30)");
    assert.include(getComputedStyle(clueCell()).fontFamily, "Georgia");
    assert.notEqual(plain.family, getComputedStyle(clueCell()).fontFamily);
    assert.include(getComputedStyle(grid.gridEl).fontFamily, "Georgia");
    assert.include(tint(), "rgb(200, 40, 40)", "the tint ignores the accent");
  });

  it("keeps the word table inside its drawer at 300px and reaches its buttons by keyboard", async function () {
    const { widget, host } = await mount(snippet("Crossword-Animals"));
    host.style.width = "300px";
    edit(widget);
    await until(() => hasDrawer(widget), "the drawer");
    const { input } = parts(widget);
    input.showDrawer();
    await wait(600);
    const box = input.drawer.shadowRoot.querySelector('[part="panel"]').getBoundingClientRect();
    const table = input.shadowRoot.querySelector("table.clueboxInput").getBoundingClientRect();
    assert.isAtMost(table.right, box.right + 1, "the word table reaches out of the drawer");
    assert.isAtLeast(table.left, box.left - 1);
    for (const button of input.shadowRoot.querySelectorAll("table.clueboxInput sl-button")) {
      assert.notEqual(button.getAttribute("tabindex"), "-1", "a row button is not a tab stop");
    }
    assert.isAtLeast(input.shadowRoot.querySelectorAll("sl-icon[label]").length, 2);
  });

  it("exposes its parts", async function () {
    const widget = await open("Crossword-Animals");
    const root = widget.shadowRoot!;
    assert.isNotNull(root.querySelector('[part="puzzle"]'));
    assert.equal(parts(widget).grid.getAttribute("part"), "grid");
    assert.equal(parts(widget).grid.getAttribute("exportparts"), "cell");
    assert.equal(parts(widget).clues.getAttribute("part"), "clues");
  });
});

mocha.run();
