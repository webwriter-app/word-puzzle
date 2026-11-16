/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-word-puzzle";
 import { cleanup, edit, hasDrawer, mount, open, parts, snippet, until } from "./helpers";

mocha.setup(getMochaConfig());

describe("<webwriter-word-puzzle> localization", function () {
  afterEach(cleanup);

  it("a language on the widget translates the widget, its drawer and its clue box", async function () {
    const widget = await open("Crossword-Animals");
    assert.include(parts(widget).clues.shadowRoot.textContent, "Across", "source language first");
    widget.setAttribute("lang", "de");
    await until(() => parts(widget).clues.shadowRoot.textContent.includes("Über"), "the clue box in German");
    edit(widget);
    await until(() => (parts(widget).root.querySelector("#edit-words") as HTMLElement)?.title === "Wörter bearbeiten", "the button in German");
    await until(() => hasDrawer(widget) && parts(widget).input.shadowRoot.textContent.includes("Rätsel generieren"), "the drawer in German");
    assert.equal((parts(widget).root.querySelector("#answer-check") as HTMLElement).title, "Antworten überprüfen");
  });

  it("the editor's declarations follow the language", async function () {
    const widget = await open("Crossword-Animals");
    const label = () => (widget as any).options.type.label._ ?? (widget as any).options.type.label;
    assert.equal(label(), "Puzzle Type");
    let told = 0;
    widget.addEventListener("optionschange", () => told++);
    widget.setAttribute("lang", "de");
    await until(() => label() === "Puzzle-Typ", "the option label in German");
    assert.isAbove(told, 0, "optionschange was not sent");
    const staticLabel = (widget.constructor as any).options.type.label;
    assert.isTrue(typeof staticLabel === "function" && staticLabel({ msg: (text: string) => text }) === "Puzzle Type", "the static declaration is a function of the widget");
    widget.setAttribute("lang", "en");
    await until(() => label() === "Puzzle Type", "back to English");
  });

  it("the language of an ancestor counts", async function () {
    const { widget } = await mount(`<div lang="de">${snippet("Crossword-Animals")}</div>`);
    await until(() => parts(widget).clues.shadowRoot.textContent.includes("Über"), "German from the ancestor");
    assert.isFalse(widget.hasAttribute("lang"), "lang was written to the widget");
  });
});

mocha.run();
