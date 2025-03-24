/**
 * Component for cluebox, for users.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, HTMLTemplateResult } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { CwContext, WwWordPuzzlesCrossword } from './webwriter-word-puzzles-crossword';
import { WordClue } from '../lib/crossword-gen';
import { cluebox_styles } from '../styles/styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";


//declare global {interface HTMLElementTagNameMap {
//    "webwriter-word-puzzles": WebwriterWordPuzzles;
//    "ww-word-puzzles-cw-cluebox": WwWordPuzzlesCwCluebox;
//    }
//}


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("ww-word-puzzles-cw-cluebox")
export class WwWordPuzzlesCwCluebox extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    localize = null

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * This one is intended for the crossword solver (i.e. student).
     * 
     * See the constructor {@link WwWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @query(".cluebox")
    accessor cluebox: HTMLTableElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({type: Array, attribute: true, reflect: true})
    _wordsClues: WordClue[] = [{word: "", across: true}]

    /**
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false })
    _cwContext: CwContext

    /**
     * @constructor
     * 
     * Does nothing I guess
     */
    constructor() {
        super()
    }

    static get styles() {
        return cluebox_styles
    }

    /**
     * Sets the "current" attribute in the cluebox to highlight the cell corresponding to the current context.
     * 
     * @param newContext 
     * @param oldContext 
     * @returns {boolean} always returns false to prevent re-rendering the whole cluebox component.
     */
    highlightContext(context: CwContext): void {
        if(this.cluebox.querySelector('table.cluebox td[current]') != null) {
            this.cluebox.querySelector('table.cluebox td[current]').removeAttribute("current")
        }
        if(context.across != null && context.clue != null) {
            const newCell = this.cluebox.querySelector('table.cluebox td[clue="' + context.clue + '"][' + (context.across ? "across" : "down") + ']')
            newCell.setAttribute("current", "")
        }
        return
    }
    
    render() {
        /** number of across clues */
        let i = 0
        /** number of down clues */
        let j = 0

        const clueboxTemplateCells = []

        if(this._wordsClues != null) {
            for(let wordClue of this._wordsClues) {
                if(wordClue.across) {
                    i++
                }
                else
                    j++
            }

            let sharedRows = Math.min(i, j)

            // Add clues in the same row
            for(let k = 0; k < sharedRows; k++) {
                clueboxTemplateCells.push(html`<tr><td clue="${this._wordsClues[k].clueNumber}" across>${clueboxCellContents(this._wordsClues[k])}</td><td clue="${this._wordsClues[k+i].clueNumber}" down>${clueboxCellContents(this._wordsClues[k+i])}</td></tr>`)
            }

            // Add clues remaining clues in only across / down column
            let diff = Math.abs(i - j)
            let start = i > j ? sharedRows : sharedRows + i

            for(let k = start; k < diff + start; k++) {
                let cell = this._wordsClues[k].across ? 
                    html`<tr><td clue="${this._wordsClues[k].clueNumber}" across>${clueboxCellContents(this._wordsClues[k])}</td><td></td></tr>`
                    : 
                    html`<tr><td></td><td clue="${this._wordsClues[k].clueNumber}" down>${clueboxCellContents(this._wordsClues[k])}</td></tr>`
                    clueboxTemplateCells.push(cell)
            }
        }
        else {
                clueboxTemplateCells.push(html`<tr><td></td><td></td></tr>`)
        }


        /**
         * The contents of a single cell element
         * @param {WordClue} wordClue 
         * @returns {HTMLTemplateResult}
         */
        function clueboxCellContents(wordClue: WordClue): HTMLTemplateResult {
            if(wordClue != null) {
                return html`
                        <b>${wordClue.clueNumber != null ? 
                        "[" + wordClue.clueNumber + "]" : ""}</b> 
                        ${wordClue.clueText != null ? wordClue.clueText : html`<i style="color:gray;">No clue provided for this word</i>`}
                    ` 
            }
            else {
                return html``
            }
        }

        return html`
            <table class="cluebox">
                <colgroup>
                <col>
                <col>
            </colgroup>
            <thead>
                <tr>
                    <th>Across</th>
                    <th>Down</th>
                </tr>
            </thead>
            <tbody>
                ${clueboxTemplateCells}
            </tbody>
            </table>
            `
    }
}
