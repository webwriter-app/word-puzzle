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
import { CwContext, WebwriterCrossword } from './webwriter-crossword';
import { WordClue } from '../lib/crossword-gen';
import { cluebox_styles } from '../styles/styles'

import {localized, msg} from "@lit/localize"
import LOCALIZE from "../../localization/generated"

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";


//declare global {interface HTMLElementTagNameMap {
//    "webwriter-word-puzzles": WebwriterWordPuzzles;
//    "webwriter-crossword-cluebox": WwWordPuzzlesCwCluebox;
//    }
//}


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@localized()
@customElement("webwriter-crossword-cluebox")
export class WebwriterCrosswordCluebox extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    public localize = LOCALIZE

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * This one is intended for the crossword solver (i.e. student).
     * 
     * See the constructor {@link WebwriterCrossword.newClueBox | newClueBox()}
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
    constructor(private parentComponent: WebwriterCrossword) {
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

        const clueboxTemplateCellsAcross = []
        const clueboxTemplateCellsDown = []

        const clueboxFindTheWords = []

        if(this._wordsClues != null) {
            for(let wordClue of this._wordsClues) {
                // For find the words
                clueboxFindTheWords.push(html`<tr><td clue="${wordClue.clueNumber}" across>${wordClue.word}</td></tr>`)

                // For crossword
                if(wordClue.across) {
                    clueboxTemplateCellsAcross.push(html`<tr><td clue="${wordClue.clueNumber}" across>${clueboxCellContents(wordClue)}</td></tr>`)
                }
                else {
                    clueboxTemplateCellsDown.push(html`<tr><td clue="${wordClue.clueNumber}" down>${clueboxCellContents(wordClue)}</td></tr>`)
                }
            }
        }

        if(clueboxTemplateCellsAcross.length == 0) {
            clueboxTemplateCellsAcross.push(html`<tr><td style="text-align: center">No words</td></tr>`)
        }
        if(clueboxTemplateCellsDown.length == 0) {
            clueboxTemplateCellsDown.push(html`<tr><td style="text-align: center">No words</td></tr>`)
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
            <div class="tables-wrapper">
                ${this.parentComponent.type == "find-the-words" ? html`
                <table class="cluebox">
                    <colgroup>
                        <col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>${msg("Words")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clueboxFindTheWords}
                    </tbody>
                </table>`
                :
                html`
                <table class="cluebox">
                    <colgroup>
                        <col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>${msg("Across")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clueboxTemplateCellsAcross}
                    </tbody>
                </table>
                <table class="cluebox">
                    <colgroup>
                        <col>
                    </colgroup>
                    <thead>
                        <tr>
                            <th>${msg("Down")}</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${clueboxTemplateCellsDown}
                    </tbody>
                </table>`
                }
            </div>
            `
    }
}
