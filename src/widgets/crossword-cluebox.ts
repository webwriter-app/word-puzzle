/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crosswords
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, css } from 'lit';
import { LitElementWw, option } from '@webwriter/lit';
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';


// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon } from '@shoelace-style/shoelace';

// Icons
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';
// TODO Add fontawesome icon
let eye = 'assets/fontawesome-icons/wand-magic-sparkles-solid.svg';

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
     * 
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @property({ type: HTMLTableElement, state: true })
    clueBox: HTMLTableElement

    /**
     * @constructor
     * Some constructor I apparently thought was a good idea.
     * 
     * Pretty much just sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     */
    constructor() {
        super()
        this.clueBox = this.newClueBox(document)
    }

    static get styles() {
            // :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
            //     display: none;
            // }
        return css`
            table.clueBox {
                // Temporary width and height
                min-width: 200px;
                min-height: 200px;
                height: fit-content;
                border: 2px solid var(--sl-color-gray-300);
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                background-color: var(--sl-color-gray-100);
                //flex-basis: content;
            }
            table.cluebox > thead {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                background-color: var(--sl-color-gray-300);
            }
            table.cluebox > thead > tr {
                padding: 0px;
                margin: 0px;
            }
            table.cluebox th {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                border-collapse: collapse;
                background-color: var(--sl-color-gray-300);
                padding: 10px;
            } 
            table.cluebox tr.generateCw {
                text-align: right;
                margin: 1px;
                height: 20px;
            }
            table.cluebox th.generateCw {
                text-align: right;
                padding: 1px;
                padding-right: 8px;
                margin: 1px;
                height: auto;
                height: 30px;
            }
            .generateCwButton::part(base) {
            /* Set design tokens for height and border width */
                padding: 0px;
                margin: 0px;
                --sl-input-height-small: 12px;
                --sl-input-width-small: 20px;
                border-radius: 0;
                color: var(--sl-color-gray-500);
                transition: var(--sl-transition-medium) transform ease, var(--sl-transition-medium) border ease;
            }
            .generateCwButton::part(label) {
                --sl-input-height-small: 12px;
                --sl-input-width-small: 20px;
                padding: 2px;
                margin: 0px;
                word-wrap: normal;
                vertical-align: top;
                text-align: center;
                justify-content: center;
                color: var(--sl-color-gray-400);
                align-content: center;

            }
            table.cluebox sl-icon.generateCwIcon {
                font-size: 20px;
                text-align: center;
                padding: 0px;
                justify-content: center;
                color: var(--sl-color-gray-400);
                align-content: center;
                vertical-align: middle;
            }
            table.cluebox > tbody {
                max-width: 50%;
                border: 3px solid var(--sl-color-gray-200);
            }
            table.cluebox > tbody > tr {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-900);
                word-wrap: break-word;
                overflow-wrap: anywhere;
                max-width: 50%;
            }
            table.cluebox > tbody > tr > td {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-900);
                border-right: 1px solid var(--sl-color-gray-200);
                border-left: 1px solid var(--sl-color-gray-200);
                border-bottom: 2px solid var(--sl-color-gray-200);
                border-collapse: collapse;
                padding: 10px;
                align-content: center;
                justify-content: center;
                word-wrap: break-word;
                overflow-wrap: anywhere;
                height: fit-content;
                max-width: 50%;
            }
            table.cluebox td {
                justify-content: left;
            }
            table.cluebox td[addRow] {
                justify-content: center;
                align-content: center;
                height: fit-content;
                padding: 0px;
                margin: 0px;
                text-align: center;
            }
            table.cluebox td[removeRow] {
                justify-content: center;
                align-content: center;
                text-align: center;
                padding: 5px;
            }
            table.cluebox sl-button {
                width: auto;
                height: auto;
                text-align: center;
                justify-content: center;
                align-content: center;
                vertical-align: middle;
            }
            table.cluebox sl-icon {
                size: 100px;
                font-size: 20px;
                text-align: center;
                padding: 10px;
                justify-content: center;
                color: var(--sl-color-gray-400);
                align-content: center;
                vertical-align: middle;
            }
            `
    }

    // Registering custom elements
    static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox,
        };
    }

    /**
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrossword.clueBox | clue panel} DOM element that will contain the words and clues
     * input by a crossword creator (i.e. teacher).
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLTableElement} the DOM element for the clue panel
     * Source: crosswords-js
     */
    newClueBox(document) {
        // Create table and header
        DEV: console.log("rendering cluebox");
        const clueBox: HTMLTableElement = document.createElement('table')
        clueBox.classList.add('clueBox')
        const headerTable: HTMLTableSectionElement = clueBox.createTHead()
        const headerRow: HTMLTableRowElement = headerTable.insertRow()

        // Add headers
        const headers = ["Words", "Clues"]
        for (const element of headers) {
            const th: HTMLTableCellElement = document.createElement('th');
            th.textContent = element;
            headerRow.appendChild(th)
        }
        headerTable.insertRow(0)
        const generateCwCell: HTMLTableCellElement = document.createElement('th');
        headerTable.rows.item(0).appendChild(generateCwCell)
        headerTable.rows.item(0).className = "generateCw"
        generateCwCell.className = "generateCw"
        generateCwCell.colSpan = 2

        const generateCwButton: SlButton = generateCwCell.appendChild(document.createElement('sl-button'))
        generateCwButton.className = "generateCwButton"
        generateCwButton.id = "generateCwButton"
        generateCwButton.setAttribute('variant', 'default')
        generateCwButton.setAttribute('size', 'small')
        // TODO Add custom event
        generateCwButton.addEventListener('click', () => {
            DEV: console.log("generate crossword")
            DEV: console.log("TODO: add event listener")
        })
        const generateCwIcon = generateCwButton.appendChild(document.createElement('sl-icon'))
        generateCwIcon.setAttribute('src', eye)
        generateCwIcon.setAttribute('class', "generateCwIcon")


        DEV: console.log("rendering table body");
        // Create body
        const bodyTable: HTMLTableSectionElement = clueBox.createTBody()
        const tableRow: HTMLTableRowElement = bodyTable.insertRow()
        const tableCell1: HTMLTableCellElement = tableRow.insertCell()
        tableCell1.setAttribute('contenteditable', 'true')
        tableCell1.setAttribute("tabindex", "0")
        const tableCell2: HTMLTableCellElement = tableRow.insertCell()
        tableCell2.setAttribute('contenteditable', 'true')
        tableCell2.setAttribute("tabindex", "0")

        DEV: console.log("create button for inserting and removing rows");
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

        // Add button
        const addButton: HTMLButtonElement = addCell.appendChild(document.createElement('sl-button'))
        addButton.setAttribute('variant', 'default')
        addButton.setAttribute('size', 'medium')
        addButton.setAttribute('circle', '')
        addButton.classList.add('author-only')
        addButton.addEventListener('click', () => {
            DEV: console.log("blicked");
            const newRow = bodyTable.insertRow(buttonRow.rowIndex-2);
            newRow.insertCell(0).setAttribute("contenteditable", "true");
            newRow.insertCell(1).setAttribute("contenteditable", "true");
        })
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
            DEV: console.log("blucked. Also buttons are row ", buttonRow.rowIndex);
            if(buttonRow.rowIndex > 3)
                bodyTable.deleteRow(buttonRow.rowIndex-3)
        })
        const removeIcon = removeButton.appendChild(document.createElement('sl-icon'))
        removeIcon.setAttribute('src', minus)
        removeButton.classList.add('author-only')

        return clueBox
    }

    /**
     * Extracts the words from the cluebox
     */
    getWords() {
        const rows = this.clueBox.querySelectorAll("tbody tr")

        const words: string[] = Array.from(rows).map(row => 
                row.querySelector("td")?.textContent?.trim() || null
        )

        return words.filter(x => x != null)
    }

    
    render() {
        return (html`<div>
                ${this.clueBox}
            </div>
            `)
    }

}

