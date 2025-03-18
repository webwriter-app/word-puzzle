/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, css } from 'lit';
import { LitElementWw, option } from '@webwriter/lit';
import { customElement, property, state, query } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { WebwriterWordPuzzlesCrossword, setContext, CrosswordContext } from './crossword';
import { generateCrossword, generateCrosswordFromList } from '../lib/crossword-gen'
import { grid_styles } from '../styles/styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

declare global {interface HTMLElementTagNameMap {
    "webwriter-word-puzzles": WebwriterWordPuzzles;
    "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid;
    }
}

function stopCtrlPropagation(event: KeyboardEvent): void {
        if (event.ctrlKey) {
            event.stopPropagation()
            DEV: console.log("Prevented propagation of a single CTRL key sequence within widget")
        }
    }


// NOTE Almost all methods within this class are from / based on the crosswords-js module

/**
 * Cell object for the crossword grid. 
 * Maybe use this for the logic eventually
 * ```typescript
 * {
 *     white: boolean;
 *     answer: string;
 *     number: number;
 *     direction: string;
 * }
 * ```
 */
export interface Cell {
    white: boolean;
/** The correct character */
    answer?: string; // Correct letter
/** The clue number. Can be null for white cells */
    number?: number; 
/** Direction of the word. Down, across, both, or null */
    direction?: string; 
}

/** Custom data type for words placed on the grid. 
 * Includes word itself and coordinates. 
 * ```typescript
 * {
 *     word: string;
 *     clue: string;
 *     x: number;
 *     y: number;
 *     direction: string;
 *     number: number;
 * }
 * ```
 * */
export interface WordClue {
    /** The word in question */
    word: string,
    /** The text for the clue */
    clueText?: string,
    /** (0-indexed) starting x-coordinate of the word on the grid*/
    x?: number, 
    /** (0-indexed) starting y-coordinate of the word on the grid*/
    y?: number, 
    /** Whether the word is across or down */
    across?: boolean,
    /** Number of the clue */
    clueNumber?: number
}


/**
 * Function to create a default cell object.
 */
export function defaultCell(): Cell {
    return {
        white: false,
        answer: null, // NOTE Should this be here, or should 
        number: null,
        direction: null
    }
}

/**
 * ```typescript
 * {
 *   wordsAndClues: WordClue[],
 *   grid: Cell[][]
 * }
 * ```
 */
export interface GenerationResults {
    wordsAndClues: WordClue[],
    grid: Cell[][]
}


const DEFAULT_DIMENSION: number = 9

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles  }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword-grid")
export class WebwriterWordPuzzlesCrosswordGrid extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    // TODO Add a skeleton for the grid while the crossword is being created?

    @property({ type: Array, state: true, attribute: true, reflect: true})
    grid: Cell[][]
    //protected grid: Cell[][]

    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newCrosswordGrid | newCrosswordGrid()}
     */
    @property({ type: HTMLDivElement, state: true, attribute: false})
    gridEl: HTMLDivElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     * TODO attr. candidate
     */
    @property({ type: Array, state: true, attribute: true, reflect: true})
    _wordsAndClues: WordClue[]

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
     * TODO Replace current context vars
     * 
     */
    @property({ type: Object, state: true, attribute: false})
    _crosswordContext

    /**
     * Current row
     */
    @state()
    cur_row: number // @type {boolean}

    /**
     * Current column
     */
    @state()
    cur_col: number // @type {boolean}


    /**
     * @constructor
     * Some constructor I apparently thought was a good idea.
     * 
     * Pretty much just makes a grid with 9x9 dimensions
     */
    constructor() {
        super()
        this.grid = Array.from({ length: DEFAULT_DIMENSION}, () => Array(DEFAULT_DIMENSION).fill(defaultCell()))
        this._crosswordContext = {across: null, clue: null}
    }

    /**
     * Styles for the crossword grid.
     * clue-label based off of crossword-js
     */
    static get styles() {
        return grid_styles
    }

    // TODO Add event listener for adding the focus class based on the clue number and direction

    /**
     * Build / construct the {@link WebwriterWordPuzzlesCrossword.gridEl | grid} DOM element that will contain the words and clues
     * 
     * Dimensions are based on {@link this.grid | grid}.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLDivElement} the DOM element for the grid.
     * Source: crosswords-js
     */
    newCrosswordGridDOM(document) {
        let gridEl = document.createElement('div');
        this.gridEl = gridEl
        this.gridEl.classList.add('grid')
        for (let x = 0; x < this.grid.length; x += 1) {
            for (let y = 0; y < this.grid.length; y += 1) {
                //  Build the cell element and place cell in grid element
                this.gridEl.appendChild(this.newCell(document, x, y));
            }
        }
        this.gridEl.addEventListener("keydown", stopCtrlPropagation)
        //DEV: console.log("gridEl:")
        //DEV: console.log(this.gridEl)
        this.requestUpdate()
        DEV: console.log("Updated crossword grid DOM:")
        DEV: console.log(this.gridEl)
        //DEV: console.log("Grid object:")
        //DEV: console.log(this.grid)
        //DEV: console.log("Words and clues:")
        //DEV: console.log(this._wordsAndClues)
        return this.gridEl
    }

    /** 
     * For handling a keypress in the crossword grid. Goes to next relevant cell
     * 
    */
    nextEmptyCell(e?: KeyboardEvent) {
        // Idk how to get typescript to stop crying about this even though it works
        let currentCell: HTMLDivElement
        if(e == null) {
            currentCell = this.getCellDOM(this.cur_row, this.cur_col)
        }
        else {
            currentCell = e.target
        }

        let nextWord: WordClue
        let nextCell: HTMLDivElement
        let row = (Number(currentCell.getAttribute("grid-row")))
        let col = (Number(currentCell.getAttribute("grid-col")))
        let init_row = (Number(currentCell.getAttribute("grid-row")))
        let init_col = (Number(currentCell.getAttribute("grid-col")))

        let timeoutLimit = 0
        for(let wordClue of this._wordsAndClues) {
            timeoutLimit += wordClue.word.length
        }
        timeoutLimit = timeoutLimit * 10

        let {across: acrossContext, clue: clueContext} =  this.getContextFromCell(row, col)

        if(this._crosswordContext.across != null) {
            acrossContext = this._crosswordContext.across
        }
        if(this._crosswordContext.clue != null) {
            clueContext = this._crosswordContext.clue
        }

        let initialAcross = acrossContext
        let initialClue = clueContext

        let currentWordIndex = this.getNextWordIndex(acrossContext, clueContext) - 1
        if (currentWordIndex == -1) {
            currentWordIndex = this._wordsAndClues.length - 1
        }
        let iNextW = -1

        let timeout = 0
        let pass = -1
        let nrow = 0
        let ncol = 0
        do {
            nextWord = null
            nrow = row + Number(!acrossContext)
            ncol = col + Number(acrossContext)

            pass += (row == init_row) && (col == init_col) ? 1 : 0
            
            // Edge case for a one-word crossword
            if(this._wordsAndClues.length > 1) {
                iNextW = this.getNextWordIndex(acrossContext, clueContext)
            }

            // If going further would be out of bounds, get next word
            if((ncol >= this.grid.length) 
                || (nrow >= this.grid.length) 
                // if no cell is defined
                || this.grid[nrow][ncol] == null
                // if the next cell is black
                || !this.grid[nrow][ncol].white) {
                if(iNextW == -1) {
                    iNextW = 0
                }
                nextWord = this._wordsAndClues[iNextW]
                row = nextWord.x
                col = nextWord.y
                nextCell = this.getCellDOM(row, col)
            }
            // otherwise, get the next cell
            else {
                    row = nrow
                    col = ncol
                    nextCell = this.getCellDOM(row, col)
            }

            timeout += 1
            if(timeout > timeoutLimit) {
                throw new Error("You've created an infinite loop, congratulations")
            }

            if(nextWord) {
                clueContext = nextWord.clueNumber
                acrossContext = nextWord.across
            }

            timeout += 1
            if(timeout >= timeoutLimit) {
                throw new Error("You've created an infinite loop, congratulations")
            }

            // TODO Change this condition
        } while(pass < 2 && nextCell.querySelector(".cell-letter").textContent !== "")

        if(nextCell.querySelector(".cell-letter").textContent == "") {
            nextCell.focus()
            this.cur_col = Number(nextCell.getAttribute("grid-row"))
            this.cur_row = Number(nextCell.getAttribute("grid-col"))
            // Update context only if another word was chosen
            if(nextWord) {
                setContext(this._crosswordContext)
            }
        }
        else {
            // Blur if there are no empty cells
            currentCell.blur()
        }
    }

    getContextFromCell(row: number, col: number): {across: boolean, clue: number} {
        let cell: HTMLDivElement = this.gridEl.querySelector('[grid-row="'+ row + '"][grid-col="' + col + '"]')
        let across: boolean
        let clue

        if(this._crosswordContext == null) {
            across = (cell.getAttribute("direction") == "across" || cell.getAttribute("direction") == "both")
        }
        else {
            if(cell.getAttribute("direction") == "both") {
                across = this._crosswordContext.across
            }
            else  {
                across = cell.getAttribute("direction") == "across"
            }
        }

        clue = this.getClueNumber(across, this.cur_row, this.cur_col)

        return {across, clue}
    }

    /**
     * Gets the current clue number for a cell based off of the grid object. (Not DOM)
     * 
     * @param {boolean} across 
     * @param {number} x 
     * @param {number} y 
     * @returns 
     */
    getClueNumber(across: boolean, x: number, y: number): number {
            let shift_row = across ? 0 : 1
            let shift_col = 1 - shift_row

            // TODO Fix out of bounds checking
            while((x-shift_row >= 0 && y-shift_col >= 0) && this.grid[x-shift_row][y-shift_col].white) {
                x -= shift_row
                y -= shift_col
            }

            return this.grid[x][y].number
        }

    /** Function for getting a cell based on its location in the DOM grid.
     * 
     * @param {number} row the row number, 1-indexed
     * @param {number} col the column number, 1-indexed
     * @returns {HTMLDivElement} the DOM element of the cell
    */
    getCellDOM(row: number, col: number): HTMLDivElement {
        return this.gridEl.querySelector('[grid-row="'+ row + '"][grid-col="' + col + '"]')
    }

    /** Function for getting the next word in context of the direction and current clue number.
     * Returns the empty cell element at the next word
     * 
     * @returns {HTMLDivElement} the DOM element of the cell
    */
   // May not need the arguments lol
    getNextWordIndex(across: boolean, clue: number): number {
        if(this._wordsAndClues.length == 1) {
            return 0
        }
            let i = this._wordsAndClues.findIndex(wordClue => wordClue.clueNumber == clue && wordClue.across == across)
            i += 1
            if(i >= this._wordsAndClues.length) {
                i = this._wordsAndClues.findIndex(wordClue => wordClue.across == !across)
            }
        return i
    }

    /**
     * Constructor for the cells of the {@link WebwriterWordPuzzlesCrossword.gridEl | grid} DOM element.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @param {number} x the row of the cell, 0-indexed
     * @param {number} y the column of the cell, 0-indexed
     * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
     * @returns {HTMLDivElement} the DOM element for the _cell_
     * Source: crosswords-js
     */
    // TODO idk why the focusing stuff isn't working now, maybe I set the values here wrong
    protected newCell(document: Document, x: number, y: number) {
        const cellDOM: HTMLDivElement = document.createElement('div');
        cellDOM.className = 'cell'
        cellDOM.style.display = 'grid'
        cellDOM.style.gridRowStart = (x+1).toString()
        cellDOM.style.gridColumnStart = (y+1).toString()
        cellDOM.setAttribute("grid-row", (x).toString())
        cellDOM.setAttribute("grid-col", (y).toString())
        // This is just temporary for testing
        try {
        if (!this.grid[x][y].white) {
            cellDOM.setAttribute("black", "")
            cellDOM.setAttribute("answer", "false");
            cellDOM.contentEditable = "false";
        }
        else {
            cellDOM.contentEditable = "true";
            cellDOM.removeAttribute("black")
            cellDOM.setAttribute("answer", "true");
            cellDOM.setAttribute("direction", this.grid[x][y].direction);
            // Create div for adding a letter
            const cellLetter = document.createElement('div');
            cellLetter.classList.add('cell-letter')
            cellDOM.appendChild(cellLetter)
            // Add a small div for the clue number if the cell has one
            if (this.grid[x][y].number) {
                const numberText = document.createElement('div');
                numberText.classList.add('clue-label');
                numberText.contentEditable = "false";
                numberText.innerHTML = this.grid[x][y].number.toString();
                cellDOM.appendChild(numberText);
            }
        }
        }
        catch(error) {
            DEV: console.log("newCell(): Error at (" + x + "," + y + ")")
        }

        /**
         * Event listener that replaces the text currently in the cell with whatever was pressed.
         * 
         * Overrides / prevents the default character insertion
         */
        cellDOM.addEventListener('keydown', (e) => { this.cellKeydownHandler(e) });

        /**
         * Event listener for current focus
         * 
         * Overrides / prevents the default character insertion
         */
        cellDOM.addEventListener('focusin', (e: FocusEvent) => {
            // DEV: console.log("Cell focus event triggered")
            e.stopPropagation()
            this.cellFocusHandler(e)
        });

        return cellDOM
    }

    /**
     * Event listener for a cellDOM element that handles keypresses. 
     * 
     * Tab switches to the next word, space changes context for direction, and
     * if the key was an alphabetic character, the text currently in the cell with whatever was pressed.
     * 
     * Overrides / prevents the default character insertion
     */
    cellKeydownHandler(e: KeyboardEvent) {
        e.preventDefault(); // Prevent default character insertion
        const isAlphaChar = str => /^[a-zA-Z]$/.test(str);
        let cell: HTMLDivElement = (e.target)
        let nextCell: HTMLDivElement

        // For arrow keys
        let row = Number(cell.getAttribute("grid-row"))
        let col = Number(cell.getAttribute("grid-col"))

        switch(e.key) {
            // Go to next clue
            case "Tab":
                e.stopPropagation()
                let nextWord  = this._wordsAndClues[this.getNextWordIndex(this._crosswordContext.across, this._crosswordContext.clue)]
                row = nextWord.x
                col = nextWord.y
                setContext(this._crosswordContext)
                nextCell = this.getCellDOM(row, col)
                nextCell.focus()
                break;
            // Change direction context if the current cell goes in both directions
            case " ":
                if(cell.getAttribute("direction") == "both") {
                    setContext({across: !this._crosswordContext.across, clue: this.getClueNumber(!this._crosswordContext.across, Number(cell.getAttribute("grid-row")), Number(cell.getAttribute("grid-col")))})
                }
                break;
            // NAVIGATION ========================================================
            case "ArrowLeft":
                col -= 1
                if(col >= 0 && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "ArrowRight":
                col += 1
                if(col < this.grid.length && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "ArrowUp":
                row -= 1
                if(row >= 0 && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "ArrowDown":
                row += 1
                if(row < this.grid.length && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "Backspace":
            case "Delete":
                cell.querySelector('.cell-letter').textContent = ""
            // Insert character
            default: 
                if (isAlphaChar(e.key)) {
                    cell.querySelector('.cell-letter').textContent = e.key.toUpperCase()
                    this.nextEmptyCell(e)
                }
        }
    }


    /** Handler for when a cell gains focus. Sets the clue and direction context
     * 
     * @param {FocusEvent} e - the event. Its target attribute is used
    */
    cellFocusHandler(e: FocusEvent) {
        this.cur_row = Number((e.target).getAttribute("grid-row"))
        this.cur_col = Number((e.target).getAttribute("grid-col"))
        //DEV: console.log("Current cell coordinates..? (" + this.cur_row + ", " + this.cur_col + ")")
        
        if(this.cur_row == null || this.cur_row == null) {
            this.cur_row = Number((e.target).getAttribute("grid-row"))
            this.cur_col = Number((e.target).getAttribute("grid-col"))
        }
        // Needs to be corrected bc it's 1-indexed in the DOM
        let x = this.cur_row
        let y = this.cur_col

        // Ensure current context isn't null
        let {across: acrossContext, clue: clueContext} =  this.getContextFromCell(this.cur_row, this.cur_col)

        // This is ideally not supposed to happen if a cell is already currently selected
        //if (this._crosswordContext.acrossContext == null) {
            this._crosswordContext.across = acrossContext
        //}

        this._crosswordContext.clue = clueContext

        // Iterate to beginning of word
        // NOTE: This may mean the context is changed even 
        if(this._crosswordContext.acrossContext) {
            while(y > 0 && this.grid[x][y-1].white) {
                y -= 1
            }
        }
        else {
            while(x > 0 && this.grid[x-1][y].white) {
                x -= 1
            }
        }
        //DEV: console.log("Word beginning (0-indexed): (" + x + ", " + y + ")")
        setContext(this._crosswordContext)
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
     * Generates crossword puzzle based off of words in the clue box, without given coordinates.
     * Calls the function in crossword-gen
     * 
     * @param {WordClue[]} wordsClues The list of words and clues from which to generate the crossword
     * @returns {WordClue[]} 
     */
    generateCrossword(wordsCluesInput: WordClue[]): WordClue[] {
        let {wordsAndClues, grid} = generateCrossword(wordsCluesInput)
        this.setWordsClues(wordsAndClues)
        this.grid = grid

        this.newCrosswordGridDOM(document)

        return wordsAndClues
    }

    // TODO Implement answer checking
    // It should compare the text content of the cell with the answer in this.grid 
    
    render() {
        return (html`<div>
                ${this.gridEl}
            </div>
            `)
    }

}

