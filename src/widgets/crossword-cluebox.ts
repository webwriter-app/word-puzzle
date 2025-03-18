/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, HTMLTemplateResult, render } from 'lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { CrosswordContext } from './crossword';
import { WordClue } from './crossword-grid';
import { cluebox_styles } from '../styles/styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlButton, SlAlert, SlTooltip, SlDrawer } from '@shoelace-style/shoelace';
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";

// TODO Replace with HelpOverlay, HelpPopup from "@webwriter/wui/dist/helpSystem/helpSystem.js"
// @webwriter/wui

// Icons
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';
import wand from 'bootstrap-icons/icons/magic.svg';
import caret_left from 'bootstrap-icons/icons/caret-left-fill.svg';

declare global {interface HTMLElementTagNameMap {
    "webwriter-word-puzzles": WebwriterWordPuzzles;
    "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox;
    }
}


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword-cluebox")
export class WebwriterWordPuzzlesCrosswordCluebox extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    localize = null
    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * This one is intended for the crossword solver (i.e. student).
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @query(".cluebox")
    accessor cluebox: HTMLTableElement

    /**
     * The input element for the words and clues of the crossword puzzle. 
     * 
     * It's intended exclusively for use by crossword creators (i.e. teachers).
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @query(".clueboxInput")
    accessor clueboxInput: HTMLTableElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({type: Array, attribute: false})
    _wordsAndClues: WordClue[] = [{word: "", across: true}]

    /**
     * The word currently in the clueboxInput element.
     */
    @property({type: Array, attribute: false})
    words: string[] = ["", "", "", ""]

    /**
     * The clue currently in the clueboxInput element.
     */
    @property({type: Array, attribute: false})
    clues: string[] = ["", "", "", ""]

    /**
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false})
    _crosswordContext: CrosswordContext

    /**
     * drawer
     */
    @query("sl-drawer")
    accessor drawer: SlDrawer

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

    // Registering custom elements
    static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "sl-alert": SlAlert,
        "sl-tooltip": SlTooltip,
        "sl-drawer": SlDrawer,
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox,
        };
    }

    /**
     * Dispatches an event to update the current words and clues.
     * 
     * @param {number} clue the updated clue number
     */
    setWordsClues(wordsClues: WordClue[]): void {
        let setWordsClues = new CustomEvent("set-words-clues", {bubbles: true, composed: true, detail: wordsClues})
        this.dispatchEvent(setWordsClues)
    }


    /**
     * Event handler that triggers crossword generation
     */
    triggerCwGeneration() {
        this.getNewWords()
        if(this._wordsAndClues.length != 0) {
            const genClicked = new CustomEvent("generateCw", {bubbles: true, composed: true})
            this.dispatchEvent(genClicked)
        }
    }

    /**
     * Extracts the words from the cluebox.
     * Calls {@link setWordsClues}
     * 
     */
    getNewWords() {
        let wordsAndClues = []
        const rows = this.clueboxInput.querySelectorAll("tbody tr")

        let words: string[] = Array.from(rows).map(row => 
                row.querySelector("td")?.textContent?.trim() || null
        )

        // Hard-coded the row here
        let clues: string[] = Array.from(rows).map(row => 
                row.querySelectorAll("td")[2]?.textContent?.trim() || null
        )

        for (let i = 0; i < words.length; i++) {
            if(words[i] != null) {
                wordsAndClues.push({word: words[i], clueText: clues[i]})
            }
        }

        this.setWordsClues(wordsAndClues)
        return this._wordsAndClues
    }

    showDrawer() {
        this.drawer.show()
        DEV: console.log("Content of focused cell:")
        DEV: console.log(this.clueboxInput.tBodies[0].rows[0].cells[0].getHTML())
        this.clueboxInput.tBodies[0].rows[0].cells[0].focus()
    }

    hideDrawer() {
        this.drawer.hide()
    }

    /** Event handler for stopping control propagation and rendering
     * 
     */
    ctrlHandler(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === "Enter") {
            event.stopPropagation()
            this.getNewWords()
            if(this._wordsAndClues.length != 0) {
                this.triggerCwGeneration()
            }
        }
        else if(event.ctrlKey)
            event.stopPropagation()
    }
    

    /**
     * Handler for deleting the row corresponding to the clicked button.
     * 
     * @param {Event} e Click event of the button
     */
    deleteRow(e: Event) {
        let button: HTMLButtonElement = (e.target)
        const trow:  HTMLTableRowElement = button.closest("tr")
        const tBody:  HTMLTableRowElement = trow.closest("tBody")
        if(tBody.childElementCount > 4) {
            trow.remove()
        }
    }

    /**
     * Handler for deleting the row corresponding to the clicked button.
     * 
     * @param {Event} e Click event of the button
     */
    addRow(e: Event) {
        let newRow = this.clueboxInput.tBodies[0].insertRow()

        render(this.new_row_template_inner, newRow)
    }

    /**
     * Lit HTML template for adding a new row to cluebox input element.
     * Used in {@link WebwriterWordPuzzlesCrosswordCluebox.addRow() | addRow()}
     */
    new_row_template_inner = html`
                <td contenteditable></td>
                <td></td>
                <td contenteditable></td>
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-tooltip content="Delete row">
                            <sl-button tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                                <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                            </sl-button>
                        </sl-tooltip>
                </div>
                </td>
                `


    renderCluebox() {
        // Count across and down clues

        /** number of across clues */
        let i = 0
        /** number of down clues */
        let j = 0

        const clueboxTemplateCells = []

        if(this._wordsAndClues != null) {
            for(let wordClue of this._wordsAndClues) {
                if(wordClue.across) {
                    i++
                }
                else
                    j++
            }

            let sharedRows = Math.min(i, j)

            // Add clues in the same row
            for(let k = 0; k < sharedRows; k++) {
                clueboxTemplateCells.push(html`<tr>`)
                clueboxTemplateCells.push(html`<td>${singleCell(this._wordsAndClues[k])}</td><td>${singleCell(this._wordsAndClues[k+i])}</td>`)
                clueboxTemplateCells.push(html`</tr>`)
            }

            // Add clues remaining clues in only across / down column
            let diff = Math.abs(i - j)
            let start = i > j ? sharedRows : sharedRows + i

            for(let k = start; k < diff + start; k++) {
                let cell = this._wordsAndClues[k].across ? 
                    html`<tr><td>${singleCell(this._wordsAndClues[k])}</td><td></td></tr>`
                    : 
                    html`<tr><td></td><td>${singleCell(this._wordsAndClues[k])}</td></tr>`
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
        function singleCell(wordClue: WordClue): HTMLTemplateResult {
            if(wordClue != null) {
                return html`
                        <b>${wordClue.clueNumber != null ? 
                        "[" + wordClue.clueNumber + "]" : ""}</b> 
                        ${wordClue.clueText != null ? wordClue.clueText : ""}
                    ` 
            }
            else {
                return html``
            }
        }

        /** 
        * cluebox template
        */
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

    render() {
        /**
        * clueboxInput template
        */
        const clueboxInputTemplate = html`
            <table class="clueboxInput" @keydown=${this.ctrlHandler}>
                <colgroup>
                <col class="word-column">
                <col class="button-column">
                <col class="clue-column">
            </colgroup>
            <thead>
                <tr>
                    <th class="word-column">Words</th>
                    <th class="button-header-cell"> 
                    <div class="plus-button-div">
                <sl-tooltip content="Add rows">
                        <sl-button tabindex="-1" size="small" 
                        class="plus-button" variant="default" 
                        circle @click=${(e) => this.addRow(e)}>
                        <div class="sl-icon-div"><sl-icon src=${plus}></sl-icon></div>
                    </sl-button></sl-tooltip>
                    </div>
                    </th>
                    <th class="clue-column">Clues</th>
                </tr>
            </thead>
            <tbody>
                <tr>${this.new_row_template_inner}</tr>
                <tr>${this.new_row_template_inner}</tr>
                <tr>${this.new_row_template_inner}</tr>
                <tr>${this.new_row_template_inner}</tr>
            </tbody>
            </table>
            `

        
        return html`<div style="display:flex;flex-wrap:wrap;justify-content:center;">
                ${this.renderCluebox()}
                <sl-drawer contained position="relative" label="Clue input box">
                ${clueboxInputTemplate}
                <sl-button slot="footer" variant="success" @click=${() => this.triggerCwGeneration()}>Generate crossword</sl-button>
                <sl-button slot="footer" variant="primary" @click=${() => this.hideDrawer()}>Close</sl-button>
                </sl-drawer>
                    <div style="width:0px; height:0px;">
                    <sl-tooltip content="Show editor for words and clues" >
                        <sl-button class="drawer-button" nopreview variant="default" circle @click=${() => this.showDrawer()}>
                            <div style="justify-content:center;padding-top:2px;">
                                <sl-icon src=${caret_left}></sl-icon>
                            </div>
                        </sl-button>
                    </sl-tooltip>
                    </div>
                </div>
            `
    }
}
