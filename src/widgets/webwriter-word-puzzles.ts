import {html, css} from 'lit';
import {LitElementWw, option} from '@webwriter/lit';
import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';
import { WebwriterWordPuzzlesCrossword } from './crossword';
//import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';

declare global {interface HTMLElementTagNameMap {
    "webwriter-word-puzzles": WebwriterWordPuzzles;
  }
}

@customElement("webwriter-word-puzzles")
export class WebwriterWordPuzzles extends LitElementWw {
//  contentEditable = 'false';

  static get scopedElements() {
    return {
      "webwriter-word-puzzles-crossword": WebwriterWordPuzzlesCrossword
    };
  }

  @property({attribute: false})
  accessor crossword: WebwriterWordPuzzlesCrossword

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
    return html`
    <webwriter-word-puzzles-crossword></webwriter-word-puzzles-crossword>
    `
  }
}