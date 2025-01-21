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


// NOTE Almost all methods within this class are from / based on the crosswords-js module

/**
 * Cell object for the crossword grid. 
 * Maybe use this for the logic eventually
 */
interface Cell {
    white: boolean;
    answer: string; // Correct letter
    number: number; // Clue number
    direction: string; // Down, across, both, or null
}

/**
 * Function to create a default cell object.
 */
function defaultCell(): Cell {
    return {
        white: false,
        answer: null,
        number: null,
        direction: null
    }
}

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles  }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword")
export class WebwriterWordPuzzlesCrossword extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    @property({ type: Array, state: true })
    protected grid: Cell[][]

    @property({ type: Number, state: true })
    width: number

    @property({ type: Number, state: true })
    height: number

    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newCrosswordGrid | newCrosswordGrid()}
     */
    @property({ type: HTMLDivElement, state: true, attribute: false})
    gridEl: HTMLDivElement

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
    constructor(width: number = 9, height: number = 9) {
        super()
        this.width = width
        this.height = height
        this.grid = Array.from({ length: width}, () => Array(height).fill(defaultCell()))
    }

    /**
     * @constructor
     * Some constructor I apparently thought was a good idea.
     * 
     * Pretty much just sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     */
    static get styles() {
        return css`
            :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
                display: none;
            }

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
        "sl-icon": SlIcon
        };
    }

    /**
     * @constructor
     * Create the crossword {@link gridEl} and {@link clueBox |clue panel}.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * Crossword element for word puzzle widget. Includes grid and clue panel elements.
     * @returns {HTMLDivElement} the DOM wrapper element for the crossword puzzle element
     * Source: crosswords-js
     */
    newCrossword(document) {
        let wrapper = document.createElement('div')
        wrapper.classList.add('wrapper')
        this.gridEl = this.newCrosswordGrid(document)
        wrapper.appendChild(this.gridEl)
        //wrapper.appendChild(this.clueBox)
        this.clueBox = wrapper.appendChild(this.newClueBox(document))
        return wrapper
    }

    /**
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrossword.gridEl | grid} DOM element that will contain the words and clues
     * 
     * Dimensions are currently based on {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height}.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLDivElement} the DOM element for the grid.
     * Source: crosswords-js
     */
    newCrosswordGrid(document) {
        let gridEl = document.createElement('div');
        gridEl.classList.add('grid')
        for (let x = 1; x <= this.height; x += 1) {
            for (let y = 1; y <= this.width; y += 1) {
                //  Build the cell element and place cell in grid element
                gridEl.appendChild(this.newCell(document, x, y));
                DEV: console.log("added a cell, hopefully")
            }
        }
        this.gridEl = gridEl
        return gridEl
    }

    updateCrosswordGrid(document) {
        DEV: console.log("updating crossword grid")
        let gridElLocal = null
        console.log("gridElLocal is supposed to be null:")
        console.log(gridElLocal)
        gridElLocal = document.createElement('div').cloneNode(true);
        console.log("gridElLocal is supposed to be an empty div:")
        console.log(gridElLocal)
        gridElLocal.classList.add('grid')
        for (let x = 1; x <= this.height; x += 1) {
            for (let y = 1; y <= this.width; y += 1) {
                //  Build the cell element and place cell in grid element
                gridElLocal.appendChild(this.newCell(document, x, y));
                DEV: console.log("added a cell, hopefully")
            }
        }
        // gridEl is correctly calculated
        console.log("gridElLocal is supposed to be a filled grid now:")
        console.log(gridElLocal)
        this.gridEl.setHTMLUnsafe(gridElLocal.getHTML())

        // Add event listener again
        for(let child of this.gridEl.querySelectorAll(".cell")) {
            child.addEventListener('keypress', (e) => {
                        e.preventDefault(); // Prevent default character insertion
                        const isAlphaChar = str => /^[a-zA-Z]$/.test(str);
                        if (isAlphaChar(e.key))
                            child.textContent = e.key.toUpperCase(); // Replace content with pressed key
                    });
        }
        //this.gridEl.replaceWith(gridElLocal.cloneNode(true))
        DEV: console.log("Grid should have been replaced")
        return this.gridEl
    }

    /**
     * @constructor
     * Constructor for the cells of the {@link WebwriterWordPuzzlesCrossword.gridEl | grid} DOM element.
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
        cellDOM.style.gridColumnStart = (y).toString()
        cellDOM.style.gridRowStart = (x).toString()
        // This is just temporary for testing

        DEV: console.log("Making cell ("+ (x-1) + ", " + (y-1) + ")")
        console.log(this.grid[x-1][y-1])
        if (!this.grid[x-1][y-1].white) {
            cellDOM.setAttribute("black", "")
            cellDOM.setAttribute("answer", "0");
            cellDOM.contentEditable = "false";
        }
        else {
            cellDOM.contentEditable = "true";
            cellDOM.removeAttribute("black")
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
        generateCwButton.setAttribute('variant', 'default')
        generateCwButton.setAttribute('size', 'small')
        generateCwButton.addEventListener('click', () => {
            DEV: console.log("generate crossword")
            this.generateCrossword()
        })
        const generateCwIcon = generateCwButton.appendChild(document.createElement('sl-icon'))
        generateCwIcon.setAttribute('src', eye)
        generateCwIcon.setAttribute('class', "generateCwIcon")


        // Create body
        const bodyTable: HTMLTableSectionElement = clueBox.createTBody()
        const tableRow: HTMLTableRowElement = bodyTable.insertRow()
        const tableCell1: HTMLTableCellElement = tableRow.insertCell()
        tableCell1.setAttribute('contenteditable', 'true')
        tableCell1.setAttribute("tabindex", "0")
        const tableCell2: HTMLTableCellElement = tableRow.insertCell()
        tableCell2.setAttribute('contenteditable', 'true')
        tableCell2.setAttribute("tabindex", "0")

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
    protected getWords() {
        const rows = this.clueBox.querySelectorAll("tbody tr")

        const words: string[] = Array.from(rows).map(row => 
                row.querySelector("td")?.textContent?.trim() || null
        )

        return words.filter(x => x != null)
    }

    /**
     * Generates crossword puzzle based off of words in the clue box and 
     * writes it to the DOM.
     * 
     * Based off of Agarwal and Joshi 2020
     */
    protected generateCrossword() {
        // Initialization

        let wordsOG = this.getWords()
        DEV: console.log(wordsOG)

        // Working word list
        let wordsLeft = Object.assign([], wordsOG)

        // Calculate minimum dimensions of crossword
        const minDim = wordsOG.map(word => word.length).reduce((max, len) => Math.max(max, len), 0)

        let width = minDim
        let height = minDim

        let currentGrid: Cell[][] = []

        for(let i = 0; i < height; i++) {
            currentGrid[i] = []
            for (let j = 0; j < width; j++) {
                currentGrid[i][j] = defaultCell()
            }
        }

        DEV: console.log(currentGrid)

        let bestGrid: Cell[][]

        let rankings: Number[]
        let rankedList: String[]
        
        let i = 0

        // Add words to grid (simplified)
        for(let word of wordsOG) {
            addWord(word, i, 0, "across")
            i += 1

            DEV: console.log(currentGrid)
        }
        
        function addWord(word: String, inputX: number, inputY: number, direction: string) {
            // I don't think this is iterating over chars 
            // CURRENT TODO Left off here
            let x = inputX
            let y = inputY

            for(let j = 0; j < word.length; j++) {
                currentGrid[x][y].answer = word[j]
                currentGrid[x][y].white = true
                if (direction == "across") {
                    if (currentGrid[x][y].direction == "" || !currentGrid[x][y].direction || currentGrid[x][y].direction == "across") {
                        currentGrid[x][y].direction = "across"
                    }
                    else {
                        currentGrid[x][y].direction = "both"
                    }
                    y += 1
                }
                else {
                    if (currentGrid[x][y].direction == "" || !currentGrid[x][y].direction || currentGrid[x][y].direction == "down") {
                        currentGrid[x][y].direction = "down"
                    }
                    else {
                        currentGrid[x][y].direction = "both"
                    }
                    x += 1
                }
//                DEV: console.log("First row" + currentGrid[0])
//                for(let h = 0; h < word.length; h++) {
//                    console.log(currentGrid[0][h].answer)
//                }
            }
        }

        // TODO Crossword generation algorithm

        this.grid = currentGrid
        this.width = currentGrid.length
        this.height = currentGrid[0].length
        
        DEV: console.log("This is the currently saved grid for the whole file:")
        DEV: console.log(this.grid)

        // TODO Add word numbers

        this.updateCrosswordGrid(document)
    }

    
    render() {
        return (html`<div>
                ${this.newCrossword(this.shadowRoot)}
            </div>
            `)
    }

}

