/**
 * Component for cluebox input, author only.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, render } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { WwWordPuzzlesCrossword } from './webwriter-word-puzzles-crossword';
import { WordClue } from '../lib/crossword-gen';
import { cluebox_styles } from '../styles/styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";
import { SlButton, SlAlert, SlDrawer } from '@shoelace-style/shoelace';
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";

// Icons
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';
import magic_wand from 'bootstrap-icons/icons/magic.svg';
import pencil_square from 'bootstrap-icons/icons/pencil-square.svg';


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("ww-word-puzzles-cw-cluebox-input")
export class WwWordPuzzlesCwClueboxInput extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    localize = null

    /**
     * Whether the current display is a preview
     */
    @property({ type: Boolean, state: true, attribute: false })
    _preview: boolean = false

    /**
     * The input element for the words and clues of the crossword puzzle. 
     * 
     * It's intended exclusively for use by crossword creators (i.e. teachers).
     * 
     * See the constructor {@link WwWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @query(".clueboxInput")
    accessor clueboxInput: HTMLTableElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({type: Array, attribute: false})
    _wordsClues: WordClue[] = [{word: "", across: true}]

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
        "sl-drawer": SlDrawer
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
        if(this._wordsClues.length != 0) {
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
        return this._wordsClues
    }

    showDrawer() {
        this.drawer.show()
        this.clueboxInput.tBodies[0].rows[0].cells[0].focus()
    }

    hideDrawer() {
        this.drawer.hide()
    }

    drawerKeyHandler(event: KeyboardEvent): void {
        //DEV: console.log("Drawer handler")
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
            if(this._wordsClues.length != 0) {
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
     * Used in {@link WwWordPuzzlesCwCluebox.addRow() | addRow()}
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
    onPreviewToggle(contenteditable: boolean): void {
        //DEV: console.log("Preview processing for crossword-cluebox")
        this._preview = !contenteditable
        //DEV: console.log("this._preview:")
        //DEV: console.log(this._preview)

        this.requestUpdate()
    }

    renderClueboxInput() {
        //DEV: console.log("render cluebox input")
        const clueboxInputRender = []

        const clueboxButtonCell = html`<td class="button-cell" tabindex="-1">
                <div class="button-cell-div">
                        <sl-button title="Delete row" tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
            </td>`

        if(this._wordsClues != null) {
            let i = 0
            for(i < 0; i < this._wordsClues.length; i++) {
                if(this._wordsClues[i].word != "") {
                    clueboxInputRender.push(this._wordsClues[i].clueText != "" 
                        ? html`<tr><td contenteditable>${this._wordsClues[i].word}</td>
                        <td></td><td contenteditable>${this._wordsClues[i].clueText}</td>${clueboxButtonCell}</tr>`
                        : html`<td contenteditable>${this._wordsClues[i].word}</td>
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

    render() {
        /**
        * clueboxInput template
        */
        //DEV: console.log("parent has attr contenteditable: " + this._parent.hasAttribute("contenteditable"))
        //this.onPreviewToggle(this._parent.hasAttribute("contenteditable"))
        const edit_button = html`<sl-drawer @keydown=${this.drawerKeyHandler} contained position="relative" label="Clue input box">
                ${this.renderClueboxInput()}
                <sl-button title="Ctrl+Enter" slot="header-actions" size="small" variant="success" @click=${() => this.triggerCwGeneration()}>Generate crossword
                            <sl-icon slot="suffix" src=${magic_wand}></sl-icon>
</sl-button>
                </sl-drawer>
                    <sl-button id="button-drawer" title="Show editor for words and clues" class="drawer-button author-only" variant="default" circle @click=${() => this.showDrawer()}>
                        <div style="justify-content:center;padding-top:2px;">
                            <sl-icon src=${pencil_square}></sl-icon>
                        </div>
                    </sl-button>
`
                
        return html`${!this._preview ? edit_button : html``}`
    }
}
