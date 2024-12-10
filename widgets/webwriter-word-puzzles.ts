import {html, css} from 'lit';
import {LitElementWw} from '@webwriter/lit';
import {customElement} from 'lit/decorators.js';
//import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';

declare global {interface HTMLElementTagNameMap {
  "webwriter-word-puzzles": WebwriterWordPuzzles;
}}


@customElement("webwriter-word-puzzles")
export class WebwriterWordPuzzles extends LitElementWw {
//  contentEditable = 'false';
//  lang = 'en';
  
  render() {
    return html`<span>Hello, world!</span>`
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