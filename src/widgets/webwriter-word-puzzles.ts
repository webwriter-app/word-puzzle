/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module webwriter-word-puzzles
 */
import {html, css} from 'lit';
import {LitElementWw, option} from '@webwriter/lit';
import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';

/**
 * Imports module for generating crossword.
 * 
 * @module crossword
 */
import { WebwriterWordPuzzlesCrossword } from './crossword';
import { WebwriterWordPuzzlesCrosswordGrid } from './crossword-grid';
import { WebwriterWordPuzzlesCrosswordCluebox } from './crossword-cluebox';
//import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';
import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
setBasePath('./node_modules/@shoelace-style/shoelace/dist');

declare global {interface HTMLElementTagNameMap {
    "webwriter-word-puzzles": WebwriterWordPuzzles;
    "webwriter-word-puzzles-crossword": WebwriterWordPuzzlesCrossword;
    "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid;
    "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox;
  }
}


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends {LitElementWw}
 * 
 * Includes {@link WebWriterWordPuzzlesCrossword }
 * 
 * @returns {void} Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles")
export class WebwriterWordPuzzles extends LitElementWw {
//  contentEditable = 'false';

  /**
   * @property {WebWriterWordPuzzlesCrossword} crossword 
   * Probably unused, tbh
   * @see {@link /src/widgets/crossword.ts | other file}
   */
  @property({attribute: false})
  accessor crossword: WebwriterWordPuzzlesCrossword

  static get styles() {
    return css`
    `
  }

  render() {
    return html`
    `
  }
}