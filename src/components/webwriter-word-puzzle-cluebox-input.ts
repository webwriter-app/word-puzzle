/**
 * Component for cluebox input, author only.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, render } from 'lit';
import { property, query } from 'lit/decorators.js';
import type { WebwriterWordPuzzle } from '../widgets/webwriter-word-puzzle';
import { WordClue } from '../model/crossword-gen';
import { cluebox_styles } from './word-puzzle.styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";
import SlButton from "@shoelace-style/shoelace/dist/components/button/button.component.js";
import SlDrawer from "@shoelace-style/shoelace/dist/components/drawer/drawer.component.js";
import SlIcon from "@shoelace-style/shoelace/dist/components/icon/icon.component.js";

// Icons
import plus from '@tabler/icons/outline/plus.svg';
import minus from '@tabler/icons/outline/minus.svg';
import magic_wand from '@tabler/icons/outline/wand.svg';

import { LitElementWw } from "@webwriter/lit";
import {widgetMsg} from "@webwriter/lit/localize";
import {widgetPermissions} from "@webwriter/lit/permissions";


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
export class WebwriterWordPuzzleClueboxInput extends LitElementWw {
    // All methods have the same names as in crosswords-js

    static styles = cluebox_styles

    static scopedElements = {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "sl-drawer": SlDrawer,
    }

    /** The widget that owns this element. Set by the widget right after creation. */
    parentComponent!: WebwriterWordPuzzle

    private readonly msg = widgetMsg(this);

    readonly #permissions = widgetPermissions(this);

    /**
     * The input element for the words and clues of the crossword puzzle. 
     * 
     * It's intended exclusively for use by crossword creators (i.e. teachers).
     * 
     * See the constructor {@link WebwriterWordPuzzle.newClueBox | newClueBox()}
     */
    @query(".clueboxInput")
    accessor clueboxInput: HTMLTableElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({type: Array, attribute: false})
    accessor _wordsClues: WordClue[] = [{word: "", across: true}]

    /**
     * drawer
     */
    @query("sl-drawer")
    accessor drawer: SlDrawer

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
        let wordsAndClues: WordClue[] = []
        const rows = this.clueboxInput.querySelectorAll("tbody tr")

        let words: (string | null)[] = Array.from(rows).map(row => 
                row.querySelector("td")?.textContent?.trim() || null
        )

        // Hard-coded the row here
        let clues: (string | null)[] = Array.from(rows).map(row => 
                row.querySelectorAll("td")[2]?.textContent?.trim() || null
        )

        for (let i = 0; i < words.length; i++) {
            if(words[i] != null) {
                wordsAndClues.push({word: words[i]!, clueText: clues[i]})
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
            this.triggerCwGeneration()
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
        const button = e.target as Element
        const trow = button.closest("tr")
        const tBody = trow?.closest("tbody")
        if(!trow || !tBody) return
        if(tBody.childElementCount > 5) {
            trow.remove()
        }else {
            // Clear content if four or less rows remaining
            const [td1, _, td2] = trow.querySelectorAll("td");
            td1.textContent = "";
            td2.textContent = "";
        }
    }

    /** Appends an empty row to the input table. */
    addRow() {
        let newRow = this.clueboxInput.tBodies[0].insertRow()

        render(this.new_row_template_inner(), newRow, { creationScope: this.renderOptions.creationScope })
    }

    /**
     * Lit HTML template for adding a new row to cluebox input element.
     * Used in {@link WwWordPuzzlesCwCluebox.addRow() | addRow()}
     */
    new_row_template_inner() {
        return html`
                <td contenteditable></td>
                ${this.parentComponent.type == "crossword" ? html`
                <td></td>
                <td contenteditable></td>` : html``}
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-button title="${this.msg("Delete row")}" size="small" class="minus-button" variant="default" circle @click=${(e: Event) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus} label=${this.msg("Delete row")}></sl-icon></div>
                        </sl-button>
                </div>
                </td>
        `
    
    }

    renderClueboxInput() {
        const clueboxInputRender = []

        const clueboxButtonCell = html`<td class="button-cell" tabindex="-1">
                <div class="button-cell-div">
                        <sl-button title=${this.msg("Delete row")} size="small" class="minus-button" variant="default" circle @click=${(e: Event) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus} label=${this.msg("Delete row")}></sl-icon></div>
                        </sl-button>
                </div>
            </td>`

        if(this._wordsClues != null) {
            let i = 0
            for(i < 0; i < this._wordsClues.length; i++) {
                if(this._wordsClues[i].word != "") {
                    if(this.parentComponent.type == "crossword") {
                        clueboxInputRender.push(this._wordsClues[i].clueText != "" 
                            ? html`<tr><td contenteditable>${this._wordsClues[i].word}</td>
                            <td></td><td contenteditable>${this._wordsClues[i].clueText}</td>${clueboxButtonCell}</tr>`
                            : html`<td contenteditable>${this._wordsClues[i].word}</td>
                            <td></td><td contenteditable></td>
                            ${clueboxButtonCell}</tr>`
                            )

                    }else {
                        clueboxInputRender.push(html`<tr><td contenteditable>${this._wordsClues[i].word}</td><td></td>${clueboxButtonCell}</tr>`)
                    }
                }
                else {
                    clueboxInputRender.push(html`<tr>${this.new_row_template_inner()}</tr>`)
                }
            }
            // Always have at least 5 rows present
            if(i < 5) {
                let empty = 5 - i
                for(empty; empty > 0; empty--) {
                    clueboxInputRender.push(html`<tr>${this.new_row_template_inner()}</tr>`)
                }
            }
        } else {
            for(let i = 0; i < 5; i++) {
                clueboxInputRender.push(html`<tr>${this.new_row_template_inner()}</tr>`)
            }
        }

        const wordColumnWidthStyle = this.parentComponent.type == "crossword" ? "width: 30%" : "width: 100%"


        /** 
        * cluebox template
        */
        return html`
            <table class="clueboxInput" @keydown=${this.ctrlHandler}>
                <colgroup>
                <col style=${wordColumnWidthStyle}>
                <col class="button-column">
                ${this.parentComponent.type == "crossword" ? html`<col class="clue-column">` : html``}
            </colgroup>
            <thead>
                <tr>
                    <th style=${wordColumnWidthStyle}>${this.msg("Words")}</th>
                    <th class="button-header-cell"> 
                    <div class="plus-button-div">
                        <sl-button title="${this.msg("Add rows")}" size="small"
                        class="plus-button" variant="default" 
                        circle @click=${() => this.addRow()}>
                        <div class="sl-icon-div"><sl-icon src=${plus} label=${this.msg("Add rows")}></sl-icon></div>
                    </sl-button>
                    </div>
                    </th>
                    ${this.parentComponent.type == "crossword" ? html`<th class="clue-column">${this.msg("Clues")}</th>` : html``}
                </tr>
            </thead>
            <tbody>
                ${clueboxInputRender}
            </tbody>
            </table>
            `      
    }

    reloadUnplacedMarkers(wordsClues: WordClue[]) {
        const tbody = this.renderRoot?.querySelector('tbody');
        if (!tbody) return;

        const rows = Array.from(tbody.querySelectorAll('tr'));

        for (const row of rows) {
            const firstCell = row.querySelector('td');
            const cellText = firstCell?.textContent?.trim();
            if (wordsClues.find((wc) => wc.word == cellText && wc.x == null)) {
                row.classList.add('cell-word-not-placed');
            } else {
                row.classList.remove('cell-word-not-placed');
            }
        }
    }

    render() {
        /**
        * clueboxInput template
        */
        
        const sl_drawer = html`
                <sl-drawer @keydown=${this.drawerKeyHandler} contained position="relative">
                    ${this.renderClueboxInput()}
                    <sl-button title="Ctrl+Enter" variant="success" @click=${() => {this.triggerCwGeneration();}}>
                        <sl-icon slot="prefix" src=${magic_wand}></sl-icon>
                        ${this.msg("Generate puzzle")}
                    </sl-button>
                </sl-drawer>
`
                
        return html`${this.#permissions.editing ? sl_drawer : html``}`
    }
}
