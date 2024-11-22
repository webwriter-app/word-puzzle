import {html, css} from "lit"
import {LitElementWw} from "@webwriter/lit"
import {customElement, property, query, queryAssignedElements} from "lit/decorators.js"

@customElement("webwriter-word-puzzles")
export class Webwriter_word_puzzles extends LitElementWw {
  render() {
    DEV: console.log("This was partially loaded")
    return html`<textarea>Hello, world!</textarea>`
  }
}
