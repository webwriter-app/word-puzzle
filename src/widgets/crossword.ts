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

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon } from '@shoelace-style/shoelace';

// Icons
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';
import eye from 'bootstrap-icons/icons/eye-fill.svg';


// NOTE Almost all methods within this class are from / based on the crosswords-js module

/**
 * Cell object for the crossword grid. 
 * Maybe use this for the logic eventually
 */
type Cell = {
    black: boolean;
    char: string;
    answer: string;
}

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends {LitElementWw}
 * @returns {void} Nothing, but renders the DOM element for the crossword puzzle
 */
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

    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newCrosswordGrid | newCrosswordGrid()}
     */
    @property({ type: HTMLDivElement, state: true })
    grid: HTMLDivElement

    /**
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
    constructor(width: number, height: number) {
        super()
        this.width = width
        this.height = height
    }

    /**
     * @constructor
     * Some constructor I apparently thought was a good idea.
     * 
     * Pretty much just sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     */
    static get styles() {
        return css`
        div.wrapper {
            width: 100%;
            align-content: left;
            justify-content: space-around;
            display: flex;
        }
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
        table.cluebox > thead > tr > th {
            font-family: var(--sl-font-sans);
            color: var(--sl-color-gray-700);
            border-collapse: collapse;
            background-color: var(--sl-color-gray-300);
            padding: 10px;
        }
        th.preview {
            text-align: right;
            padding: 1px;
            margin: 1px;
            height: auto;
        }
        sl-button.previewButton::part(base) {
    /* Set design tokens for height and border width */
        --sl-input-height-small: 12px;
        --sl-input-width-small: 20px;
        border-radius: 0;
        color: var(--sl-color-gray-500);
        font-size: 0.75rem;
        transition: var(--sl-transition-medium) transform ease, var(--sl-transition-medium) border ease;
        }
        .previewButton::part(label) {
            word-wrap: normal;
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
            height: max-content;
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
     * @constructor
     * Create the crossword {@link grid} and {@link clueBox |clue panel}.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * Crossword element for word puzzle widget. Includes grid and clue panel elements.
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
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrossword.grid | grid} DOM element that will contain the words and clues
     * 
     * Dimensions are currently based on {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height}.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLDivElement} the DOM element for the grid.
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

    /**
     * @constructor
     * Constructor for the cells of the {@link WebwriterWordPuzzlesCrossword.grid | grid} DOM element.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @param {number} x the row of the cell.
     * @param {number} y the column of the cell.
     * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
     * @returns {HTMLDivElement} the DOM element for the _cell_
     * Source: crosswords-js
     */
    protected newCell(document: Document, x: number, y: number) {
        const cellDOM: HTMLDivElement = document.createElement('div');
        cellDOM.className = 'cell'
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

        /**
         * Event listener that replaces the text currently in the cell with whatever was pressed.
         * 
         * Overrides / prevents the default character insertion
         */
        cellDOM.addEventListener('keypress', (e) => {
            e.preventDefault(); // Prevent default character insertion
            const isAlphaChar = str => /^[a-zA-Z]$/.test(str);
            if (isAlphaChar(e.key))
                cellDOM.textContent = e.key.toUpperCase(); // Replace content with pressed key
        });
        return cellDOM
    }

    /**
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrossword.clueBox | clue panel} DOM element that will contain the words and clues
     * input by a crossword creator (i.e. teacher).
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLTableElement} the DOM element for the clue panel
     * Source: crosswords-js
     */
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
        headerTable.insertRow(0)
        const previewCell: HTMLTableCellElement = document.createElement('th');
        headerTable.rows.item(0).appendChild(previewCell)
        previewCell.className = "preview"
        previewCell.colSpan = 2

        const previewButton: SlButton = previewCell.appendChild(document.createElement('sl-button'))
        previewButton.className = "previewButton"
        previewButton.setAttribute('variant', 'default')
        previewButton.setAttribute('size', 'small')
        previewButton.innerText = "preview"
        previewButton.addEventListener('click', () => {
            DEV: console.log("activate preview")
        })
        const previewIcon = previewButton.appendChild(document.createElement('sl-icon'))
        previewIcon.setAttribute('src', eye)


        // Create body
        const bodyTable: HTMLTableSectionElement = clueBox.createTBody()
        const tableRow: HTMLTableRowElement = bodyTable.insertRow()
        const tableCell1: HTMLTableCellElement = tableRow.insertCell()
        tableCell1.setAttribute('contentEditable', 'true')
        tableCell1.setAttribute("tabindex", "0")
        const tableCell2: HTMLTableCellElement = tableRow.insertCell()
        tableCell2.setAttribute('contentEditable', 'true')
        tableCell2.setAttribute("tabindex", "0")

        // Create button for inserting and removing rows
        const buttonRow = bodyTable.insertRow()
        const addCell: HTMLTableCellElement = buttonRow.insertCell(0)
        addCell.setAttribute('addRow', '')
        const removeCell: HTMLTableCellElement = buttonRow.insertCell(1)
        removeCell.setAttribute('removeRow', '')

        // Add button
        const addButton: HTMLButtonElement = addCell.appendChild(document.createElement('sl-button'))
        addButton.setAttribute('variant', 'default')
        addButton.setAttribute('size', 'medium')
        addButton.setAttribute('circle', '')
        addButton.addEventListener('click', () => {
            DEV: console.log("blicked");
            const newRow = bodyTable.insertRow(buttonRow.rowIndex-2);
            newRow.insertCell(0).setAttribute("contentEditable", "true");
            newRow.insertCell(1).setAttribute("contentEditable", "true");
        })
        const addIcon = addButton.appendChild(document.createElement('sl-icon'))
        addIcon.setAttribute('src', plus)
        addIcon.setAttribute('font-size', '20px')

        // Remove button
        const removeButton: HTMLButtonElement = removeCell.appendChild(document.createElement('sl-button'))
        removeButton.setAttribute('variant', 'default')
        removeButton.setAttribute('size', 'medium')
        removeButton.setAttribute('circle', '')
        removeButton.addEventListener('click', () => {
            DEV: console.log("blucked. Also buttons are row ", buttonRow.rowIndex);
            if(buttonRow.rowIndex > 3)
                bodyTable.deleteRow(buttonRow.rowIndex-3)
        })
        const removeIcon = removeButton.appendChild(document.createElement('sl-icon'))
        removeIcon.setAttribute('src', minus)

        return clueBox
    }

    render() {
        return (html`<div>
                ${this.newCrossword(this.shadowRoot)}
                <sl-button><sl-icon library="icons" name="zoom-in"></sl-icon></sl-button>
            </div>
            `)
            //<p>WE LOVE YOU GOLDEN MOLE</p>
    }

}

