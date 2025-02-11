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
import { WebwriterWordPuzzlesCrossword } from './crossword';

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
    "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid;
    }
}



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
@customElement("webwriter-word-puzzles-crossword-grid")
export class WebwriterWordPuzzlesCrosswordGrid extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    // TODO Add a skeleton for the grid while the crossword is being created?

    @property({ type: Array, state: true })
    grid: Cell[][]
    //protected grid: Cell[][]

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
     * Styles for the crossword grid.
     * clue-label based off of crossword-js
     */
    static get styles() {
        return css`
            :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
                display: none;
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
                grid-template-columns: repeat(3, 25%, [col-start]);
                grid-template-rows: [row1-start] 25% [row1-end row2-start] 75% [row2-end];
                aspect-ratio: 1;
                height: 100%;
                width: 100%;
                min-width: 40px;
                min-height: 40px;
                border: 1px solid black;
                max-width: 40px;
                max-height: 40px;
                position: center;
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
            .cell-letter {
                grid-column-start: 1;
                grid-column-end: span 100%;
                grid-row-start: row1-start;
                grid-row-end: span 100%;
                height: 100%;
                width: 100%;
                position: center;
                font-size: 18pt;
            }
            .clue-label {
                grid-column-start: 1;
                grid-column-end: span 25%;
                grid-row-start: row1-start;
                grid-row-end: span row1-end;
                position: absolute;
                margin: 1px 0px 0px 1px;
                font-size: 8pt;
                place-self: start;
                pointer-events: none;
            }
            `
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
        for (let x = 1; x <= this.width; x += 1) {
            for (let y = 1; y <= this.height; y += 1) {
                //  Build the cell element and place cell in grid element
                gridEl.appendChild(this.newCell(document, x, y));
                DEV: console.log("added a cell, hopefully")
            }
        }
        this.gridEl = gridEl
        this.requestUpdate()
        return gridEl
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
        cellDOM.style.gridRowStart = (x).toString()
        cellDOM.style.gridColumnStart = (y).toString()
        // This is just temporary for testing

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
            // TODO clue label disappears if you type something in the cell
            const cellLetter = document.createElement('div');
            cellLetter.classList.add('cell-letter')
            cellDOM.appendChild(cellLetter)
            if (this.grid[x-1][y-1].number) {
                const numberText = document.createElement('div');
                numberText.classList.add('clue-label');
                numberText.contentEditable = "false";
                numberText.innerHTML = this.grid[x-1][y-1].number.toString();
                cellDOM.appendChild(numberText);
            }


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
                if (cellDOM.querySelector('.cell-letter')) {
                    cellDOM.querySelector('.cell-letter').textContent = e.key.toUpperCase()
                }
                else
                    cellDOM.textContent = e.key.toUpperCase(); // Replace content with pressed key
        });
        return cellDOM
    }

    /**
     * Generates crossword puzzle based off of words in the clue box.
     * 
     * Based off of Agarwal and Joshi 2020
     */
    generateCrossword(words: Array<String>) {
        // Initialization

        DEV: console.log("generation triggered")
        let wordsOG = words

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

        let bestGrid: Cell[][]

        let rankings: Number[]
        let rankedList: String[]
        let clueCount: number

        clueCount = 0
        
        let i = 0

        // Add words to grid (simplified)
        for(let word of wordsOG) {
            addWord(word, i, 0, "across")
            i += 1

            //addWord(word, 0, i, "down")
            //i += 1
            DEV: console.log(currentGrid)
        }
        
        function addWord(word: String, inputX: number, inputY: number, direction: string) {
            // I don't think this is iterating over chars 
            // CURRENT TODO Left off here
            let x = inputX
            let y = inputY

            // Add clue number to the cell
            if (!currentGrid[x][y].number) {
                currentGrid[x][y].number = clueCount + 1
                clueCount += 1
            }

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
                    DEV: console.log("increased y")
                }
                else {
                    if (currentGrid[x][y].direction == "" || !currentGrid[x][y].direction || currentGrid[x][y].direction == "down") {
                        currentGrid[x][y].direction = "down"
                    }
                    else {
                        currentGrid[x][y].direction = "both"
                    }
                    x += 1
                    DEV: console.log("increased x")
                }
            }
        }

        // TODO Crossword generation algorithm

        this.grid = currentGrid
        this.width = currentGrid.length
        this.height = currentGrid[0].length
        
        DEV: console.log(this.grid)

        // TODO Add word numbers
        this.newCrosswordGrid(document)
        
    }

    
    render() {
        return (html`<div>
                ${this.gridEl}
            </div>
            `)
    }

}

