/// <reference types="mocha" />
import "mocha/mocha.js";
import { assert } from "chai";
import { getMochaConfig } from "@webwriter/build/test";
import "../src/widgets/webwriter-word-puzzle";
 import { cleanup, edit, hasDrawer, open, parts, read, shown, until } from "./helpers";

mocha.setup(getMochaConfig());

describe("<webwriter-word-puzzle> permissions", function () {
  afterEach(cleanup);

  it("read mode hides the author controls (crossword)", async function () {
    const widget = await open("Crossword-Animals");
    await until(() => parts(widget).input, "the cluebox input");
    const { root } = parts(widget);
    assert.isTrue((root.querySelector("#edit-words") as HTMLElement)?.hidden, "Edit words button is still shown");
    assert.isFalse(shown(root.querySelector("#edit-words")), "Edit words button is still shown");
    assert.isTrue(shown(root.querySelector("#answer-check")), "the check button is missing for readers of a crossword");
    assert.isFalse(hasDrawer(widget), "the word drawer is rendered for readers");
  });

  it("edit mode shows them, and follows the mode while the widget lives", async function () {
    const widget = await open("Crossword-Animals");
    edit(widget);
    await until(() => shown(parts(widget).root.querySelector("#edit-words")), "the Edit words button in edit mode");
    await until(() => hasDrawer(widget), "the drawer in edit mode");
    assert.isTrue(shown(parts(widget).root.querySelector("#answer-check")), "check button missing in edit mode");
    read(widget);
    await until(() => !shown(parts(widget).root.querySelector("#edit-words")), "the Edit words button to go in read mode");
    await until(() => !hasDrawer(widget), "the drawer to go in read mode");
  });

  it("find-the-words shows the check button to authors only", async function () {
    const widget = await open("Find-The-Words-Fruits");
    assert.isNull(parts(widget).root.querySelector("#answer-check"), "readers get a Show answers button");
    edit(widget);
    await until(() => shown(parts(widget).root.querySelector("#answer-check")), "the Show answers button in edit mode");
    assert.equal((parts(widget).root.querySelector("#answer-check") as HTMLElement).title, "Show answers");
    read(widget);
    await until(() => !parts(widget).root.querySelector("#answer-check"), "the button to go again");
  });

  it("the edit button opens the drawer", async function () {
    const widget = await open("Crossword-Animals");
    edit(widget);
    await until(() => hasDrawer(widget), "the drawer");
    (parts(widget).root.querySelector("#edit-words") as HTMLElement).click();
    await until(() => parts(widget).input.shadowRoot.querySelector("sl-drawer").open, "the drawer to open");
  });
});

mocha.run();
