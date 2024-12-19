import {html, css} from 'lit';
import {LitElementWw, option} from '@webwriter/lit';
import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';
//import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';

declare global {interface HTMLElementTagNameMap {
  "webwriter-word-puzzles": WebwriterWordPuzzles;
}}


@customElement("webwriter-word-puzzles")
export class WebwriterWordPuzzles extends LitElementWw {
//  contentEditable = 'false';

// static localization = { }
static localization = {
    "x": {"de": "Deutsch?", "en": "It's english", "es": "Español"}
  }
// Helper function: Get localized form of `str` if available, otherwise fall back to `str`
  msg = (str: string) => this.lang in WebwriterWordPuzzles.localization? WebwriterWordPuzzles.localization[this.lang][str] ?? str: str

  @property({attribute : true})
  accessor value: string 

  @property({attribute : true})
  accessor placeholder: string


    //accessor lang = 'en'
  static get styles() {
    return css`
      :host(
        :not([contenteditable=true]):not([contenteditable=""]))
        .author-only {
        display: none;
      }
    `
  }
  
  render() {
    DEV: console.log("current lang: ", this.lang)
    return html`
    <span>${this.msg("x")} ${this.lang}</span>
    `
  }
}
/*
@customElement("grid-cell")
export class GridCell extends LitElementWw {

  @property({type: Boolean, attribute: true})
  @option({type: Boolean, label: {en: "Show suggestions"}})
  accessor showSuggestions = false

  static styles = css`
  :host {

      // Setting a background is recommended since the backdrop of the fullscreen is black by default
      background: grey;
  }
  `

  render() {
    return html`<p>Idk, a square</p>`
  }
}
  */