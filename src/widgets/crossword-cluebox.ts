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
import { CrosswordContext, WebwriterWordPuzzlesCrossword } from './crossword';
import { WordClue } from './crossword-grid';
import { cluebox_styles } from '../styles/styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlButton, SlAlert, SlDrawer } from '@shoelace-style/shoelace';
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";

// TODO Replace with HelpOverlay, HelpPopup from "@webwriter/wui/dist/helpSystem/helpSystem.js"
// @webwriter/wui

// Icons
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';
import pencil_square from 'bootstrap-icons/icons/pencil-square.svg';

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
     * Whether the current display is a preview
     */
    @property({ type: Boolean, state: true, attribute: false })
    _preview: boolean = false

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

    @property({ type: Object, attribute: false })
    _parent: WebwriterWordPuzzlesCrossword

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({type: Array, attribute: false})
    _wordsAndClues: WordClue[] = [{word: "", across: true}]

    /**
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false })
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

    drawerKeyHandler(event: KeyboardEvent): void {
        DEV: console.log("Drawer handler")
        this.ctrlHandler(event)
        if (event.key === "Escape") {
            event.stopPropagation()
            this.hideDrawer()
        }
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

    // TODO Execute upon context changing
    /**
     * Sets the "current" attribute in the cluebox to highlight the cell corresponding to the current context.
     * 
     * @param newContext 
     * @param oldContext 
     * @returns {boolean} always returns false to prevent re-rendering the whole cluebox component.
     */
    highlightContext(context: CrosswordContext): void {
        DEV: console.log("Context being highlighted")
        if(this.cluebox.querySelector('table.cluebox td[current]') != null) {
            this.cluebox.querySelector('table.cluebox td[current]').removeAttribute("current")
        }
        if(context.across != null && context.clue != null) {
            const newCell = this.cluebox.querySelector('table.cluebox td[clue="' + context.clue + '"][' + (context.across ? "across" : "down") + ']')
            newCell.setAttribute("current", "")
        }
        return
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
                        <sl-button title="Delete row" tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
                </td>
                `
    onPreviewToggle(previewActive: boolean): void {
        DEV: console.log("Preview processing for crossword-cluebox")
        if (previewActive) {
                for(let elem of this.querySelectorAll(".author-only")) {
                    elem.setAttribute("nopreview","")
                }
            }
        else {
            for(let elem of document.querySelectorAll("[nopreview]")) {
                elem.removeAttribute("nopreview")
            }
        }
    }

    renderClueboxInput() {
        DEV: console.log("render cluebox input")
        const clueboxInputRender = []

        const clueboxButtonCell = html`<td class="button-cell" tabindex="-1">
                <div class="button-cell-div">
                        <sl-button title="Delete row" tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
            </td>`

        if(this._wordsAndClues != null) {
            let i = 0
            for(i < 0; i < this._wordsAndClues.length; i++) {
                if(this._wordsAndClues[i].word != "") {
                    clueboxInputRender.push(this._wordsAndClues[i].clueText != "" 
                        ? html`<tr><td contenteditable>${this._wordsAndClues[i].word}</td>
                        <td></td><td contenteditable>${this._wordsAndClues[i].clueText}</td>${clueboxButtonCell}</tr>`
                        : html`<td contenteditable>${this._wordsAndClues[i].word}</td>
                        <td></td><td contenteditable></td>
                        ${clueboxButtonCell}</tr>`
                        )
                }
                else {
                    clueboxInputRender.push(html`<tr>${this.new_row_template_inner}</tr>`)
                }
            }
            // Always have at least 4 rows present
            if(i < 4) {
                let empty = 4 - i
                for(empty; empty > 0; empty--) {
                    clueboxInputRender.push(html`<tr>${this.new_row_template_inner}</tr>`)
                }
            }
        } else {
            for(let i = 0; i < 4; i++) {
                clueboxInputRender.push(html`<tr>${this.new_row_template_inner}</tr>`)
            }
        }


        /** 
        * cluebox template
        */
        return html`
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
                        <sl-button title="Add rows" tabindex="-1" size="small" 
                        class="plus-button" variant="default" 
                        circle @click=${(e) => this.addRow(e)}>
                        <div class="sl-icon-div"><sl-icon src=${plus}></sl-icon></div>
                    </sl-button>
                    </div>
                    </th>
                    <th class="clue-column">Clues</th>
                </tr>
            </thead>
            <tbody>
                ${clueboxInputRender}
            </tbody>
            </table>
            `      
    }

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
                clueboxTemplateCells.push(html`<tr><td clue="${this._wordsAndClues[k].clueNumber}" across>${clueboxCellContents(this._wordsAndClues[k])}</td><td clue="${this._wordsAndClues[k+i].clueNumber}" down>${clueboxCellContents(this._wordsAndClues[k+i])}</td></tr>`)
            }

            // Add clues remaining clues in only across / down column
            let diff = Math.abs(i - j)
            let start = i > j ? sharedRows : sharedRows + i

            for(let k = start; k < diff + start; k++) {
                let cell = this._wordsAndClues[k].across ? 
                    html`<tr><td clue="${this._wordsAndClues[k].clueNumber}" across>${clueboxCellContents(this._wordsAndClues[k])}</td><td></td></tr>`
                    : 
                    html`<tr><td></td><td clue="${this._wordsAndClues[k].clueNumber}" down>${clueboxCellContents(this._wordsAndClues[k])}</td></tr>`
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
        //DEV: console.log("parent has attr contenteditable: " + this._parent.hasAttribute("contenteditable"))
        //this.onPreviewToggle(this._parent.hasAttribute("contenteditable"))
                
        return html`<div class="cw-cluebox-wrapper">
                ${this.renderCluebox()}
                <sl-drawer @keydown=${this.drawerKeyHandler} contained position="relative" label="Clue input box">
                ${this.renderClueboxInput()}
                <sl-button title="Ctrl+Enter" slot="footer" variant="success" @click=${() => this.triggerCwGeneration()}>Generate crossword</sl-button>
                <sl-button slot="footer" variant="primary" @click=${() => this.hideDrawer()}>Close</sl-button>
                </sl-drawer>
                    <sl-button id="button-drawer" title="Show editor for words and clues" class="drawer-button author-only" variant="default" circle @click=${() => this.showDrawer()}>
                        <div style="justify-content:center;padding-top:2px;">
                            <sl-icon src=${pencil_square}></sl-icon>
                        </div>
                    </sl-button>
                </div>
            `
    }
}
