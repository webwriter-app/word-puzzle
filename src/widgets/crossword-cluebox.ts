/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, css } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
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

    /**
     * The input element for the words and clues of the crossword puzzle. 
     * 
     * It's intended exclusively for use by crossword creators (i.e. teachers).
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @property({ type: HTMLDivElement, state: true, attribute: false})
    clueBoxInput: HTMLTableElement

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * This one is intended for the crossword solver (i.e. student).
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @property({ type: HTMLDivElement, state: true, attribute: false})
    clueBox: HTMLTableElement

    @query(".cluebox")
    accessor cluebox: HTMLTableElement

    @query(".clueboxInput")
    accessor clueboxInput: HTMLTableElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    wordsAndClues: WordClue[] = []

    /**
     * Whether the current direction is across or down.
     * true if across, false if down
     */
    @property({ type: Boolean, state: true, attribute: false})
    acrossContext: boolean

    /**
     * The clue the current selection corresponds to.
     */
    @property({ type: Number, state: true, attribute: false})
    currentClue: number

    /**
     * drawer
     */
    @query("sl-drawer")
    accessor drawer: SlDrawer


    /**
     * TypeScript HTML snippet for adding a new row
     */
    new_row_html = `<td class="word-column" contenteditable></td>
                <td class="clue-column" contenteditable></td>
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-button tabindex="-1" size="small" class="minus-button" variant="default" circle>
                            <div class="sl-icon-div"><sl-icon></sl-icon></div>
                        </sl-button>
                </div>
                </td>`

    /**
     * @constructor
     * Some constructor I apparently thought was a good idea.
     * 
     * Pretty much just sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     */
    constructor() {
        super()
        this.clueBoxInput = this.newClueBoxInput(document)
        this.clueBoxInput.addEventListener("keydown", this.ctrlHandler.bind(this))
        this.newClueBox(this.wordsAndClues)
        this.clueBox = this.newClueBox(this.wordsAndClues)
        this.wordsAndClues = []
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
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrosswordCluebox.clueBoxInput | clue panel} DOM element 
     * that will be used by a crossword creator (i.e. teacher) to add words and clues.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLTableElement} the DOM element for the clue panel
     * Source: crosswords-js
     */
    newClueBoxInput(document): HTMLTableElement {
        // Create table and header
        //DEV: console.log("rendering cluebox");
        const clueBoxInput: HTMLTableElement = document.createElement('table')
        clueBoxInput.classList.add('clueboxInput')
        const colgroup: HTMLTableColElement = document.createElement('colgroup')
        const col1 = document.createElement('col')
        col1.style.width = '30%'
        const col2 = document.createElement('col')
        col2.style.width = '70%'
        colgroup.appendChild(col1)
        colgroup.appendChild(col2)
        clueBoxInput.createTHead()
        clueBoxInput.tHead.insertRow()
        clueBoxInput.insertBefore(colgroup, clueBoxInput.tHead)

        // Add headers
        const headers = ["Words", "Clues"]
        for (const element of headers) {
            const th: HTMLTableCellElement = document.createElement('th');
            th.textContent = element;
            if(element == "Words")
                th.classList.add("word-column")
            else
                th.classList.add("clue-column")
            clueBoxInput.tHead.rows[0].appendChild(th)
        }
        clueBoxInput.tHead.insertRow(0)

        // Create body
        const bodyTable: HTMLTableSectionElement = clueBoxInput.createTBody()
        // Create button for inserting and removing rows
        const buttonRow = bodyTable.insertRow()
        buttonRow.id = 'buttonRow'
        //buttonRow.classList.add('author-only')
        buttonRow.setAttribute('contenteditable', 'false')
        buttonRow.classList.add('author-only')
        const addCell: HTMLTableCellElement = buttonRow.insertCell(0)
        addCell.setAttribute('addRow', '')
        addCell.classList.add('author-only')
        const removeCell: HTMLTableCellElement = buttonRow.insertCell(1)
        removeCell.setAttribute('removeRow', '')
        removeCell.classList.add('author-only')

        addRow()
        addRow()
        addRow()
        addRow()

        // Add button
        const addButton: HTMLButtonElement = addCell.appendChild(document.createElement('sl-button'))
        addButton.setAttribute('variant', 'default')
        addButton.setAttribute('size', 'medium')
        addButton.setAttribute('circle', '')
        addButton.classList.add('author-only')
        addButton.addEventListener('click', () => { addRow() })
        const addIcon = addButton.appendChild(document.createElement('sl-icon'))
        addIcon.setAttribute('src', plus)
        addIcon.setAttribute('font-size', '20px')

        // Remove button
        const removeButton: HTMLButtonElement = removeCell.appendChild(document.createElement('sl-button'))
        removeButton.setAttribute('variant', 'default')
        removeButton.setAttribute('size', 'medium')
        removeButton.setAttribute('circle', '')
        removeButton.classList.add('author-only')
        removeButton.addEventListener('click', () => {
            //DEV: console.log("blucked. Also buttons are row ", buttonRow.rowIndex);
            if(buttonRow.rowIndex > 3)
                bodyTable.deleteRow(buttonRow.rowIndex-3)
        })
        const removeIcon = removeButton.appendChild(document.createElement('sl-icon'))
        removeIcon.setAttribute('src', minus)
        removeButton.classList.add('author-only')

        function addRow() {
            bodyTable.insertRow(buttonRow.rowIndex-2);
            bodyTable.rows[buttonRow.rowIndex-3].insertCell(0);
            bodyTable.rows[buttonRow.rowIndex-3].insertCell(1);
            bodyTable.rows[buttonRow.rowIndex-3].cells[0].setAttribute("contenteditable", "true");
            bodyTable.rows[buttonRow.rowIndex-3].cells[0].classList.add('word-column')
            bodyTable.rows[buttonRow.rowIndex-3].cells[1].setAttribute("contenteditable", "true");
            bodyTable.rows[buttonRow.rowIndex-3].cells[1].classList.add('clue-column')
        }

        return clueBoxInput
    }

    /**
     * Event handler that triggers crossword generation
     */
    triggerCwGeneration() {
        this.wordsAndClues = this.getNewWords()
        if(this.wordsAndClues.length != 0) {
            const genClicked = new CustomEvent("generateCw", {bubbles: true, composed: true})
            this.dispatchEvent(genClicked)
        }
    }

    /**
     * Extracts the words from the cluebox
     * This works
     * 
     */
    getNewWords() {
        this.wordsAndClues = []
        const rows = this.clueboxInput.querySelectorAll("tbody tr")

        let words: string[] = Array.from(rows).map(row => 
                row.querySelector("td")?.textContent?.trim() || null
        )

        let clues: string[] = Array.from(rows).map(row => 
                row.querySelectorAll("td")[1]?.textContent?.trim() || null
        )

        for (let i = 0; i < words.length; i++) {
            if(words[i] != null) {
                this.wordsAndClues.push({word: words[i], clueText: clues[i]})
            }
        }
        DEV: console.log("Words and clues:")
        DEV: console.log(this.wordsAndClues)

        return this.wordsAndClues
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

    /**
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrosswordCluebox.clueBox | clue panel} DOM element 
     * that will contain the clues for a puzzle solver (i.e. student) to solve.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLTableElement} the DOM element for the clue panel
     * Source: crosswords-js
     */
    newClueBox(wordsAndClues: WordClue[]): HTMLTableElement {
        //DEV: console.log("Generating cluebox, in theory")
        const clueBox: HTMLTableElement = document.createElement('table')
        clueBox.classList.add('cluebox')
        const headerTable: HTMLTableSectionElement = clueBox.createTHead()
        const headerRow: HTMLTableRowElement = headerTable.insertRow()
        // Add headers
        const headers = ["Across", "Down"]
        for (let element of headers) {
            let th: HTMLTableCellElement = document.createElement('th');
            th.textContent = element;
            headerRow.appendChild(th)
        }
        const colgroup: HTMLTableColElement = document.createElement('colgroup')
        const col1 = document.createElement('col')
        const col2 = document.createElement('col')
        colgroup.appendChild(col1)
        colgroup.appendChild(col2)
        col1.style.width = '50%'
        col2.style.width = '50%'
        clueBox.insertBefore(colgroup, clueBox.tHead)


        //DEV: console.log("rendering table body");
        // Create body
        const bodyTable: HTMLTableSectionElement = clueBox.createTBody()
        const lastInsArray: number[] = [-1, -1]
        bodyTable.insertRow()
        bodyTable.rows[0].insertCell()
        bodyTable.rows[0].insertCell()
        bodyTable.rows[0].cells[0].setAttribute('contenteditable', 'false')
        bodyTable.rows[0].cells[1].setAttribute('contenteditable', 'false')

        for(let wordAndClue of wordsAndClues) {
            let cellColumn = 0

            if(wordAndClue.across)
                cellColumn = 0
            else
                cellColumn = 1

            if(bodyTable.rows.length <= lastInsArray[cellColumn] + 1) {
                bodyTable.insertRow()
                bodyTable.rows[bodyTable.rows.length - 1].insertCell()
                bodyTable.rows[bodyTable.rows.length - 1].insertCell()
                bodyTable.rows[bodyTable.rows.length - 1].cells[0].setAttribute('contenteditable', 'false')
                bodyTable.rows[bodyTable.rows.length - 1].cells[1].setAttribute('contenteditable', 'false')
            }

            // NOTE idk if this is going to show anything useful
            if(bodyTable.rows[lastInsArray[cellColumn]+1].cells[cellColumn].innerHTML == "") {
                bodyTable.rows[lastInsArray[cellColumn]+1].cells[cellColumn].innerHTML = "<b>[" + wordAndClue.clueNumber + "]</b> "+ wordAndClue.clueText
                lastInsArray[cellColumn] += 1
            }
        }

        this.clueBox = clueBox
        this.requestUpdate()
        return clueBox

    }

    /** Event handler for stopping control propagation and rendering
     * 
     */
    ctrlHandler(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === "Enter") {
            event.stopPropagation()
            //DEV: console.log("Prevented propagation of a single CTRL key sequence within widget (cluebox)")
            this.getNewWords()
            if(this.wordsAndClues.length != 0) {
                this.triggerCwGeneration()
            }
            //DEV: console.log("This is supposed to generate the grid though")
        }
        else if(event.ctrlKey)
            event.stopPropagation()
    }

    /**
     * Handler for deleting the row corresponding to the clicked button.
     * 
     * @param {Event} e Click event of the button
     */
    addRow(e: Event) {
        const newRow = this.clueboxInput.tBodies[0].insertRow()
        
        newRow.innerHTML = this.new_row_html

        newRow.querySelector(".minus-button").addEventListener('click', (e) => this.deleteRow(e))
        newRow.querySelector("sl-icon").setAttribute('src', minus)


        //const buttonCell = newRow.insertCell()
        //buttonCell.innerHTML = this.button_cell_html
        //buttonCell.addEventListener('click', (e) => this.addRow(e))



        // Add minus icon
        // Add event listener

    }


    /**
     * Handler for deleting the row corresponding to the clicked button.
     * 
     * @param {Event} e Click event of the button
     */
    deleteRow(e: Event) {
        let button: HTMLButtonElement = (e.target)
        const trow:  HTMLTableRowElement = button.closest("tr")
        trow.remove()
        // TODO go 3 ancestors up and delete row
    }

    render() {
        //DEV: console.log("rendering cluebox")

        // TODO Refactor this to use the snippet from before

        /*
        * clueboxInput template
        */
        const clueboxInputTemplate = html`
        <table class="clueboxInput author-only" @keydown=${this.ctrlHandler}>
            <colgroup>
            <col class="word-column">
            <col  class="clue-column">
            <col  class="button-column">
        </colgroup>
        <thead>
            <tr>
                <th class="word-column">Words</th>
                <th class="clue-column">Clues</th>
            </tr>
        </thead>
        <tbody>
            <tr>
                <td contenteditable></td>
                <td contenteditable></td>
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-button tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.addRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
                </td>
            </tr>
            <tr>
                <td contenteditable></td>
                <td contenteditable></td>
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-button tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
                </td>
            </tr> 
            <tr>
                <td contenteditable></td>
                <td contenteditable></td>
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-button tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
                </td>
            </tr> 
            <tr>
                <td contenteditable></td>
                <td contenteditable></td>
                <td class="button-cell" tabindex="-1">
                    <div class="button-cell-div">
                        <sl-button tabindex="-1" size="small" class="minus-button" variant="default" circle @click=${(e) => this.deleteRow(e)}>
                            <div class="sl-icon-div"><sl-icon src=${minus}></sl-icon></div>
                        </sl-button>
                </div>
                </td>
            </tr> 
        </tbody>
        </table>
        `

        return html`<div style="display:flex;flex-wrap:wrap;justify-content:center;">
                ${clueboxInputTemplate}
                ${this.clueBox} 
                <sl-drawer contained position="relative" label="Clue input box">
                ${this.clueBoxInput} 
                <sl-button slot="footer" variant="success" @click=${() => this.triggerCwGeneration()}>Generate crossword</sl-button>
                <sl-button slot="footer" variant="primary" @click=${() => this.hideDrawer()}>Close</sl-button>
                </sl-drawer>
                <sl-tooltip content="Show editor for words and clues">
                    <sl-button class="drawer-button" variant="default" circle @click=${() => this.showDrawer()}>
                        <div style="justify-content:center;padding-top:2px;">
                            <sl-icon src=${caret_left}></sl-icon>
                        </div>
                    </sl-button>
                </sl-tooltip>
            </div>
            `
    }
}
