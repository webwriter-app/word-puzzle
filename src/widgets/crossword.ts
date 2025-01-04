import { html, css } from 'lit';
import { LitElementWw, option } from '@webwriter/lit';
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import "@shoelace-style/shoelace/dist/themes/light.css";
//import { setBasePath } from '@shoelace-style/shoelace/dist/utilities/base-path.js';
//setBasePath('./node_modules/@shoelace-style/shoelace/dist');
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';

import { SlButton, SlIcon } from '@shoelace-style/shoelace';
import { getRows } from 'mermaid/dist/diagrams/common/common.js';

// NOTE Almost all methods within this class are from the crosswords-js module

// Interface for cell objects

/**
 * Cell object for the crossword grid
 * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
 * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
 * @returns {HTMLDivElement} the DOM element for the _cell_
 */
type Cell = {
    black: boolean;
    char: string;
    answer: string;
}

@customElement("webwriter-word-puzzles-crossword")
export class WebwriterWordPuzzlesCrossword extends LitElementWw {
    // All methods have the same names as in crosswords-js

    // TODO Add a skeleton for the grid while the crossword is being created?

    @property({ type: Array, state: true })
    protected oldgrid: Cell[][]

    @property({ type: Number, state: true })
    width: number

    @property({ type: Number, state: true })
    height: number

    @property({ type: HTMLDivElement, state: true })
    grid: HTMLDivElement

    @property({ type: HTMLTableElement, state: true })
    clueBox: HTMLTableElement

    constructor(width: number, height: number) {
        super()
        this.width = width
        this.height = height
    }

    static get styles() {
        return css`
        div.wrapper {
            width: 100%;
            //align-content: left;
            justify-content: space-around;
            display: flex;
        }
        table.clueBox {
            // Temporary width and height
            min-width: 200px;
            min-height: 200px;
            height: fit-content;
            border: 1px solid var(--sl-color-gray-400);
            //border-bottom: 1px solid var(--sl-color-gray-200);
            border-collapse: collapse;
            font-family: var(--sl-font-sans);
            color: var(--sl-color-gray-700);
            background-color: var(--sl-color-gray-100);
            //flex-basis: content;
        }
        table.cluebox > thead {
            font-family: var(--sl-font-sans);
            color: var(--sl-color-gray-700);
            background-color: var(--sl-color-gray-300);
            padding: 10px;
        }
        table.cluebox > thead > tr > th {
            font-family: var(--sl-font-sans);
            color: var(--sl-color-gray-700);
            border-bottom: 1px solid var(--sl-color-gray-200);
            background-color: var(--sl-color-gray-300);
            padding: 10px;
        }
        table.cluebox > tbody {
            max-width: 50%;
        }
        table.cluebox > tbody > tr > td {
            font-family: var(--sl-font-sans);
            color: var(--sl-color-gray-900);
            //border-bottom: 1px solid var(--sl-color-gray-200);
            padding: 10px;
            word-wrap: break-word;
            overflow-wrap: anywhere;
            max-width: 50%;
        }
        table.cluebox td {
            justify-content: left;
        }
        table.cluebox td[addRow] {
            justify-content: center;
            align-content: center;
        }
        table.cluebox button {
            width: auto;
            height: auto;
        }

        td:focus {
            background-color: white;
        }

        div.grid {
            display: grid;
            flex-basis: content;
            grid-template-columns: auto;
            grid-template-rows: auto;
            justify-content: center;
            align-content: center;
            box-sizing: border-box;
            width: max-content;
            border: 2px solid black;
        }
        div.cell {
            display: grid;
            aspect-ratio: 1;
            height: 100%;
            width: 100%;
            min-width: 40px;
            min-height: 40px;
            border: 1px solid black;
            max-width: 40px;
            max-height: 40px;
            position: relative;
            align-items: center;
            text-align: center;
            font-size: 18pt;
        }
        div.cell[black] {
            background-color: black;
        }
        div.cell:focus {
            background-color: pink;
        }
        `
    }

    // Registering custom elements
    static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        };
    }

    /**
     * Create the crossword grid and clue panel.
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLDivElement} the DOM wrapper element for the crossword puzzle element
     * Source: crosswords-js
     */
    newCrossword(document) {
        let wrapper = document.createElement('div')
        wrapper.classList.add('wrapper')
        this.grid = this.newCrosswordGrid(document)
        wrapper.appendChild(this.grid)
        //wrapper.appendChild(this.clueBox)
        this.clueBox = wrapper.appendChild(this.newClueBox(document))
        return wrapper
    }

    /**
     * Build a crossword grid _cell_ DOM element with child elements.
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
     * @returns {HTMLDivElement} the DOM element for the _cell_
     * Source: crosswords-js
     */
    newCrosswordGrid(document) {
        this.width = 9
        this.height = 9
        let grid = document.createElement('div');
        grid.classList.add('grid')
        for (let y = 1; y <= this.height; y += 1) {
            for (let x = 1; x <= this.width; x += 1) {
                //  Build the cell element and place cell in grid element
                grid.appendChild(this.newCell(document, x, y));
                DEV: console.log("added a cell, hopefully")
            }
        }
        return grid
    }

    protected newCell(document: Document, x: number, y: number) {
        const cellDOM: HTMLElement = document.createElement('div');
        cellDOM.classList.add('cell')
        // TODO Add variables for the style to use only in the style part
        cellDOM.style.display = 'grid'
        cellDOM.style.gridColumnStart = (x).toString()
        cellDOM.style.gridRowStart = (y).toString()
        // This is just temporary for testing
        if (x % 2 === 0)
            cellDOM.setAttribute("black", "")
        if (cellDOM.hasAttribute("black")) {
            cellDOM.setAttribute("answer", "0");
            cellDOM.contentEditable = "false";
        }
        else {
            cellDOM.contentEditable = "true";
            // This is how you make divs focusable
            cellDOM.setAttribute("tabindex", "0")
        }
        cellDOM.addEventListener('keypress', (e) => {
            e.preventDefault(); // Prevent default character insertion
            const isAlphaChar = str => /^[a-zA-Z]$/.test(str);
            if (isAlphaChar(e.key))
                cellDOM.textContent = e.key.toUpperCase(); // Replace content with pressed key
        });
        return cellDOM
    }

    // TODO Maybe make this a popup eventually idk
    protected newClueBox(document) {
        // Create table and header
        const clueBox: HTMLTableElement = document.createElement('table')
        clueBox.classList.add('clueBox', 'author-only')
        const headerTable: HTMLTableSectionElement = clueBox.createTHead()
        const headerRow: HTMLTableRowElement = headerTable.insertRow()

        // Add headers
        const headers = ["Words", "Clues"]
        for (const element of headers) {
            const th: HTMLTableCellElement = document.createElement('th');
            th.textContent = element;
            headerRow.appendChild(th)
        }

        // Create body
        const bodyTable: HTMLTableSectionElement = clueBox.createTBody()
        const tableRow: HTMLTableRowElement = bodyTable.insertRow()
        const tableCell1: HTMLTableCellElement = tableRow.insertCell()
        tableCell1.setAttribute('contentEditable', 'true')
        tableCell1.setAttribute("tabindex", "0")
        const tableCell2: HTMLTableCellElement = tableRow.insertCell()
        tableCell2.setAttribute('contentEditable', 'true')
        tableCell2.setAttribute("tabindex", "0")

        const buttonRow = bodyTable.insertRow()
        const addCell: HTMLTableCellElement = buttonRow.insertCell(0)
        // TODO Left off here
        addCell.setAttribute('addRow', '')
        const removeCell: HTMLTableCellElement = buttonRow.insertCell(1)
        removeCell.setAttribute('removeRow', '')

        const addButton: HTMLButtonElement = addCell.appendChild(document.createElement('sl-button'))
        addButton.setAttribute('variant', 'default')
        addButton.setAttribute('size', 'medium')
        addButton.setAttribute('circle', '')
        addButton.addEventListener('click', () => {
            DEV: console.log("blicked");
            const newRow = bodyTable.insertRow(buttonRow.rowIndex-1);
            newRow.insertCell(0).setAttribute("contentEditable", "true");
            newRow.insertCell(1).setAttribute("contentEditable", "true");
        })
        const addIcon = addButton.appendChild(document.createElement('sl-icon'))
        addIcon.setAttribute('src', plus)

        const removeButton: HTMLButtonElement = removeCell.appendChild(document.createElement('sl-button'))
        removeButton.setAttribute('variant', 'default')
        removeButton.setAttribute('size', 'medium')
        removeButton.setAttribute('circle', '')
        removeButton.addEventListener('click', () => {
            DEV: console.log("blucked. Also buttons are row ", buttonRow.rowIndex);
            if(buttonRow.rowIndex != 1)
                bodyTable.deleteRow(buttonRow.rowIndex-2)
        })
        const removeIcon = removeButton.appendChild(document.createElement('sl-icon'))
        removeIcon.setAttribute('src', minus)
 

        //icon.setAttribute('name', 'plus-circle')

        return clueBox
    }

    render() {
        return (html`<div>
                ${this.newCrossword(this.shadowRoot)}
            </div>
            `)
            //<p>WE LOVE YOU GOLDEN MOLE</p>
    }

}

