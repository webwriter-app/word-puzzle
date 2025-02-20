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
import { WebwriterWordPuzzlesCrossword, stopCtrlPropagation } from './crossword';
import { WordClue } from './crossword-cluebox';

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
/** The correct character */
    answer: string; // Correct letter
/** The clue number. Can be null for white cells */
    number: number; 
/** Direction of the word. Down, across, both, or null */
    direction: string; 
}

/** Custom data type for words placed on the grid. 
 * Includes word itself and coordinates. */
export interface PlacedWord {
    word: string;
    x: number; // x coordinate
    y: number; // y coordinate
    direction: string; // true if across, false if down
}

/**
 * Function to create a default cell object.
 */
function defaultCell(): Partial<Cell> {
    return {
        white: false,
        answer: null, // NOTE Should this be here, or should 
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
    grid: Partial<Cell>[][]
    //protected grid: Cell[][]

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
     * Pretty much just makes a grid with 9x9 dimensions
     */
    constructor(dimension: number = 9) {
        super()
        this.grid = Array.from({ length: dimension}, () => Array(dimension).fill(defaultCell()))
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
     * Dimensions are based on {@link this.grid | grid}.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLDivElement} the DOM element for the grid.
     * Source: crosswords-js
     */
    newCrosswordGridDOM(document) {
        let gridEl = document.createElement('div');
        gridEl.classList.add('grid')
        for (let x = 1; x <= this.grid.length; x += 1) {
//        DEV: console.log("A row of the non-DOM grid looks like this:")
//        DEV: console.log((this.grid[x-1]))
            for (let y = 1; y <= this.grid.length; y += 1) {
                //  Build the cell element and place cell in grid element
                gridEl.appendChild(this.newCell(document, x, y));
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
        try {
        if (!this.grid[x-1][y-1].white) {
            cellDOM.setAttribute("black", "")
            cellDOM.setAttribute("answer", "false");
            cellDOM.contentEditable = "false";
        }
        else {
            cellDOM.contentEditable = "true";
            cellDOM.removeAttribute("black")
            // This is how you make divs focusable
            cellDOM.setAttribute("tabindex", "0")
            cellDOM.setAttribute("answer", "true");
            // Create div for adding a letter
            const cellLetter = document.createElement('div');
            cellLetter.classList.add('cell-letter')
            cellDOM.appendChild(cellLetter)
            // Add a small div for the clue number if the cell has one
            if (this.grid[x-1][y-1].number) {
                const numberText = document.createElement('div');
                numberText.classList.add('clue-label');
                numberText.contentEditable = "false";
                numberText.innerHTML = this.grid[x-1][y-1].number.toString();
                cellDOM.appendChild(numberText);
            }
        }
        }
        catch(error) {
            DEV: console.log("Error at (" + x + "," + y + ")")
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
            // TODO change focus depending on across / down context
        });

        return cellDOM
    }

    /**
     * Generates crossword puzzle based off of words in the clue box.
     * 
     * Based off of Agarwal and Joshi 2020
     */
    generateCrossword(wordsClues: Partial<WordClue>[]): WordClue[] {

        // TODO Figure out generation / backtracking recursively

        // Initialization
        DEV: console.log("generation triggered")

        /** The words in their original order. */
        let wordsOG: string[] = [] // @type{string[]}
        for(let wordClue of wordsClues) {
            wordsOG.push(wordClue.word)
        }

        /** The amount of words that still must be put into the grid */
        let wordsLeft: string[] = Object.assign([], wordsOG) // @type {string[]}

        // Calculate minimum dimensions of crossword
        const minDim = wordsOG.map(word => word.length).reduce((max, len) => Math.max(max, len), 0)

        let dimension: number = minDim

        /** The grid currently being worked withfound so far */
        let currentGrid: Partial<Cell>[][] = []

        /** The words that have been placed into the current grid */
        let currentWordsPlaced: PlacedWord[] = []  // @type {string[]}

        /** The best grid found so far.
         * Smallest grid with the largest amount of words placed
         */
        let bestGrid: Partial<Cell>[][] // @type {Cell[][]}
        let bestWordsPlaced: PlacedWord[] = []  // @type {string[]}

        /** Grid for testing adding / removing words */
        let scratchpadGrid: Partial<Cell>[][] = [] // @type {Cell[][]}
        let scratchWordsPlaced: PlacedWord[] = []  // @type {string[]}

        /** The number of words in the best grid */
        let bestWordNr = 0 // @type{number}

        for(let i = 0; i < dimension; i++) {
            currentGrid[i] = []
            for (let j = 0; j < dimension; j++) {
                currentGrid[i][j] = defaultCell()
            }
        }

        // Initialize scratchpadGrid
        for(let i = 0; i < wordsOG.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0); i++) {
            scratchpadGrid[i] = []
            for (let j = 0; j < wordsOG.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0); j++) {
                scratchpadGrid[i][j] = defaultCell()
            }
        }

        /** The rankings of the words; indices correspond to original word list */
        let rankings: number[] = Array(wordsOG.length).fill(-1) // @type{number[]}

        /** The words in a list from high to low based off of ranking.
         * This may change based on backtracking so that the order 
         * doesn't correspond to the actual ranking anymore
         */
        let rankedList: string[] = Array(wordsOG.length).fill("")
        rankedList = sortWords() // @type{string[]}

        /** How many clues there currently are. Used to calculate next clue number.
         * NOTE: This'll be a problem when words are removed
         * Maybe add a function to recalculate clue numbers
         */
        let clueCount = 0 // @type{number}

        /** Number of iterations until the grid is reset */
        let epoch = 500 // @type{number}

        // Rank the words
        for(let i = 0; i < wordsOG.length; null) {
            rankings[i] = rankWord(i)
            i++
        }

        /** Function that returns possible places for a word in the grid.
         * Returns null if there are no possible places.
         * 
         * @returns { boolean } - true if the word can be placed into G with at least one letter intersecting with another word
        */
        function placeable(inputGrid: Partial<Cell>[][], wordNew: string): PlacedWord[] {
            if (currentWordsPlaced.length == 0) {
                let possiblePlacementX = Math.floor(inputGrid.length/2 - 1);
                let possiblePlacementY = Math.floor(inputGrid.length/2) - Math.floor(wordNew.length/2);

                let possiblePlacement: PlacedWord = {word: wordNew, x: possiblePlacementX, y: possiblePlacementY, direction: "across"}

                return [possiblePlacement]
            }

            /** Function for determining whether a word is placeable in the grid. */
            let possiblePlacements: PlacedWord[]  = []

           // For every word already placed in the grid,
           // Go through all of its possible intersections with the new word
            for (let placedWord of currentWordsPlaced) {
                let intersections = intersecting(wordNew, placedWord.word)
                let possibleDirection: string
                if (placedWord.direction == "across") {
                    possibleDirection = "down"
                }
                else {
                    possibleDirection = "across"
                }

                // Calculate coordinates of a possible placement
                for (let intersection of intersections) {
                    // New word should be vertical
                    let possibleX, possibleY: number
                    if (possibleDirection == "down") {
                        possibleX = placedWord.x - intersection[0]
                        possibleY = placedWord.y + intersection[1]
                    }
                    // New word should be horizontal
                    else {
                        possibleX =  placedWord.x + intersection[1]
                        possibleY = placedWord.y - intersection[0]
                    }

                    // Test for collisions with existing words and whether adjacent squares would be white
                    let noClash = true
                    let notAdjacent = true

                    // Don't place a word if there is a white cell right before or after it starts
                    if(possibleDirection == "across"){
                        try {
                            notAdjacent = notAdjacent && !inputGrid[possibleX][possibleY - 1].white
                        } catch(error) {
                            DEV: console.log("Adjacency check (" + wordNew + "): No cell to the left")
                        }
                        try {
                            notAdjacent = notAdjacent && !inputGrid[possibleX][possibleY + wordNew.length].white
                        } catch(error) {
                            DEV: console.log("Adjacency check (" + wordNew + "): No cell to the right")
                        }
                    }
                    else {
                        try {
                            notAdjacent = notAdjacent && !inputGrid[possibleX - 1][possibleY].white
                        } catch(error) {
                            DEV: console.log("Adjacency check (" + wordNew + "): No cell below")
                        }
                        try {
                            notAdjacent = notAdjacent && !inputGrid[possibleX + wordNew.length][possibleY].white
                        } catch(error) {
                            DEV: console.log("Adjacency check (" + wordNew + "): No cell above")
                        }
                    }

                    for (let i = 0; i < wordNew.length; i++) {
                        if (possibleDirection == "across") {
                            if (i != intersection[0]) {
                                if(i + possibleY >= 0 && i + possibleY < dimension) {
                                    try {
                                        // Don't place a word if there is a collision where the char isn't the same
                                        if(wordNew[i] != inputGrid[possibleX + i][possibleY].answer)
                                            noClash = noClash && !inputGrid[possibleX][possibleY + i].white
                                    }
                                    catch(error) {
                                        DEV: console.log("The cell seems to be undefined at (" + possibleX + ", " + possibleY + ").")
                                        DEV: console.log("The grid dimensions are " + inputGrid.length)
                                    }
                                }
                                
                                try {
                                    notAdjacent = notAdjacent && !inputGrid[possibleX + 1][possibleY + i].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check (" + wordNew + "): No cells below")
                                }
                                try {
                                    notAdjacent = notAdjacent && !inputGrid[possibleX - 1][possibleY + i].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check (" + wordNew + "): No cells above")
                                }
                            }
                        }
                        else {
                            if (i != intersection[0]) {
                                if(i + possibleX >= 0 && i + possibleX < dimension) {
                                    try {
                                        // Don't place a word if there is a collision where the char isn't the same
                                        if(wordNew[i] != inputGrid[possibleX + i][possibleY].answer)
                                            noClash = noClash && !inputGrid[possibleX + i][possibleY].white
                                    }
                                    catch(error) {
                                        DEV: console.log("The cell seems to be undefined at (" + possibleX + ", " + possibleY + ").")
                                        DEV: console.log("The grid dimensions are " + inputGrid.length)
                                    }
                                }
                                // Test for adjacent squares
                                try {
                                    notAdjacent = notAdjacent && !inputGrid[possibleX + i][possibleY + 1].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check (" + wordNew + "): No cells to the right")
                                }
                                try {
                                    notAdjacent = notAdjacent && !inputGrid[possibleX + i][possibleY - 1].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check (" + wordNew + "): No cells to the left")
                                }
                        }
                    }
                }

                    let possiblePlacement: PlacedWord = {word: wordNew, x: possibleX, y: possibleY, direction: possibleDirection}

                    if(noClash && notAdjacent){
                        possiblePlacements.push({...possiblePlacement})
                    }

                }

            }

            // test all the placements to make sure they don't cross over already assigned squares, 
                // or have adjacent squares that don't belong to that word
            DEV: console.log("Possible placements for " + wordNew + ": ")
            DEV: console.log(possiblePlacements)
            return possiblePlacements
        }

        function selectPlacement(possiblePlacementOptions: PlacedWord[]): PlacedWord {

            let possiblePlacementsNoResize: PlacedWord[] = []

            // Prioritize word placement that doesn't require resizing the grid
            try {
            for (let placementOption of possiblePlacementOptions) {
                if (placementOption.x >= 0 && placementOption.y >= 0) {
                    possiblePlacementsNoResize.push({...placementOption})
                }
            }
            } catch (error) {
                DEV: console.log("Apparently possiblePlacementOptions is undefined")
            }

            let placement: PlacedWord
            if(possiblePlacementsNoResize.length === 0) {
                placement = possiblePlacementOptions[0]
            }
            else {
                placement = possiblePlacementsNoResize[0]
            }
            return placement
        }

        /** Tuple for word intersections */
        type WordIntersections = [wordNew: number, wordGrid: number]

        /** Helper function that returns the indices where 2 words intersect.
         * 
         * @returns { [number, number] } - indices of the words that match. [wordPlace, wordGrid]
        */
        function intersecting(wordPlace: string, wordGrid: string): WordIntersections[] {
                let intersections: WordIntersections[] = []

                for (let i = 0; i < wordPlace.length; i++) {
                    for (let j = 0; j < wordGrid.length; j++) {
                        if(wordPlace[i] == wordGrid[j]) {
                            intersections.push([i, j])
                        }
                    }
                }

            return intersections
        }


        /** Helper function that determines which word would enable adding 
         * multiple more to the grid, if any.
         * 
         * @param {string} word - the word which would be removed.
         * @returns { Partial<Cell> } - the grid without the word, if its removal was blocking other words. Null otherwise
        */
        function blockingWord(inputGrid: Partial<Cell>[][], word: string): Partial<Cell>[][] {
            // Get copy of added words
                // wordsPlaced but only the words
            let wordList: string[] = []

            // TODO make it not depend on wordsPlaced, I guess? Just do it manually with the grid :/
            // Maybe just use the scratchpad thing
            for(let wordPlaced of currentWordsPlaced) {
                if(wordPlaced.word != word)
                    wordList.push(wordPlaced.word)
            }

            DEV: console.log("Word list without " + word + ": " + wordList)

            // Add all the words except the blocking word
            // 
            generateCrosswordGrid(inputGrid, wordList)

            // Identify whether other words could be added after that
            // placeable()

            return
        }

        /** Helper function that removes the last added word from the grid
         * and adds it to the tail of the sorted list of words. 
         * 
         * @returns { [Cell[][], string[]] } - the new grid and new list
        */
        function wraparound(grid: Cell[][], word: string): [Cell[][], string[]] {
            // TODO
            wordsLeft.push(word)
            rankedList.splice(rankedList.indexOf(word), 1)
            rankedList.push(word)
            return
        }

        /** Helper function that removes a word from the grid.
         * 
         * @returns { string } - the word that was removed.
        */
        function remove(grid: Cell[][], word: string): void {
            // TODO

            wordsLeft.push(word)
            currentWordsPlaced.splice(currentWordsPlaced.findIndex(wordR => wordR.word === word), 1)
            return
        }

        /** Function for creating cells on the current grid, corresponding to the word that has been passed.
         * Local helper function
         * @param {string} word - the word to be added to the grid
         * @param {number} inputX - X coordinate where the first letter of the word should be placed
         * @param {number} inputY - Y coordinate where the first letter of the word should be placed
         * @param {string} direction - whether the word is across or down.
        */
        function addWord(inputGrid: Partial<Cell>[][], word: string, inputX: number, inputY: number, direction: string): Partial<Cell>[][] {
            // I don't think this is iterating over chars 
            let wordToPlace = {word: word, x: inputX, y: inputY, direction: direction}
            let shift: number = 0

            let x = wordToPlace.x
            let y = wordToPlace.y

            let success = false

            DEV: console.log("Placing " + word + " " + direction)

            let timeout = 0
            while(!success) {
            try {
                x = wordToPlace.x
                y = wordToPlace.y
                // Add clue number to the cell
                if (!inputGrid[x][y].number) {
                    inputGrid[x][y].number = clueCount + 1
                    clueCount += 1
                }

                for(let j = 0; j < word.length; j++) {
                    inputGrid[x][y].answer = word[j]
                    inputGrid[x][y].white = true
                    if (direction == "across") {
                        if (inputGrid[x][y].direction == "" || !inputGrid[x][y].direction || inputGrid[x][y].direction == "across") {
                            inputGrid[x][y].direction = "across"
                        }
                        else {
                            inputGrid[x][y].direction = "both"
                        }
                        y += 1
                    }
                    else {
                        if (inputGrid[x][y].direction == "" || !inputGrid[x][y].direction || inputGrid[x][y].direction == "down") {
                            inputGrid[x][y].direction = "down"
                        }
                        else {
                            inputGrid[x][y].direction = "both"
                        }
                        x += 1
                    }
                }
                DEV: console.log(word + " placed at (" + wordToPlace.x + ", " + wordToPlace.y + ")")
                success = true
            }
            catch(error) {
                timeout += 1
                if(timeout >= 3) {
                    throw new Error("You've created an infinite loop, congratulations")
                }
                DEV: console.log("There was an error while adding " + word + " to the grid, at (" + x + ", " + y + ").")
                DEV: console.log("Grid size:" + inputGrid.length)
                DEV: console.log("Message:" + error.message)
                DEV: console.log("Stack:" + error.stack)

                // Resize grid if word would be out of bounds at the top / left
                if (wordToPlace.x < 0 || wordToPlace.y < 0) {
                    let shift = Math.abs(Math.min(wordToPlace.x, wordToPlace.y))
                    DEV: console.log(word + " (" + wordToPlace.word + ") to be placed at (" + wordToPlace.x + ", " + wordToPlace.y + ") must be shifted by " + shift + ".")
                    let increase = shift
                    DEV: console.log("Current grid dimensions: " + inputGrid.length)
                    let enlargedGrid = enlargeGrid(inputGrid, shift, wordToPlace)
                    inputGrid = enlargedGrid[0]
                    wordToPlace = enlargedGrid[1]
                    DEV: console.log("Grid is now of dimension " + inputGrid.length + " and its contents should have been shifted by " + shift + ".")
                }


                // Resize grid if word would be out of bounds at the bottom / right
                if(direction == "across") {
                    if (wordToPlace.x - 1 >= inputGrid.length || wordToPlace.y + word.length - 1 >= inputGrid.length) {
                        let increase = wordToPlace.y + word.length - inputGrid.length
                        DEV: console.log("Current grid dimensions: " + inputGrid.length)
                        if(wordToPlace.y + word.length - 1 >= inputGrid.length) {
                            DEV: console.log(word + "is too long (" + wordToPlace.word.length + ") to be placed at (" + wordToPlace.x + ", " + wordToPlace.y + ").")
                        }
                        else {
                            DEV: console.log(word + " is on an out-of-bounds row (" + wordToPlace.x + ").")
                        }
                        let enlargedGrid = enlargeGrid(inputGrid, 0, wordToPlace)
                        inputGrid = enlargedGrid[0]
                        wordToPlace = enlargedGrid[1]
                        DEV: console.log("Grid is now of dimension " + inputGrid.length)
                    }
                }
                else  {
                    if (wordToPlace.x + word.length - 1 >= inputGrid.length || wordToPlace.y - 1 >= inputGrid.length) {
                        let increase = wordToPlace.x + word.length - inputGrid.length
                        DEV: console.log("Current grid dimensions: " + inputGrid.length)
                        if(wordToPlace.x + word.length - 1 >= inputGrid.length) {
                            DEV: console.log(word + "is too long (" + wordToPlace.word.length + ") to be placed at (" + wordToPlace.x + ", " + wordToPlace.y + ").")
                        }
                        else {
                            DEV: console.log(word + " is on an out-of-bounds column (" + wordToPlace.y + ").")
                        }
                        let enlargedGrid = enlargeGrid(inputGrid, 0, wordToPlace)
                        inputGrid = enlargedGrid[0]
                        wordToPlace = enlargedGrid[1]
                    }
                }

            }
            }
            currentWordsPlaced.push(wordToPlace)
            try {
                wordsLeft.splice(wordsLeft.indexOf(word), 1)
            } catch(error) {
                DEV: console.log("No words left")
            }
            DEV: console.log("Words left: " + wordsLeft)
            DEV: console.log("Grid should be larger. In addword function:")
            DEV: console.log(inputGrid)
            return inputGrid

        }

        /** Local helper function for ranking a word to place onto the grid next.
         *  This ranking strategy is independent of the grid content.
         * 
         * @param { number } wordIndex - the index of the word to be added to the grid (based off original word list)
         * @returns { number } - the rank of the word
        */
        function rankWord(wordIndex: number): number {
            // Word-level intersections rather than letter-level intersections are used.
            let rank = 0
            
            for(let i = 0; i < wordsOG.length; i++) {
                if (i != wordIndex) {
                    wordLoop: for(let letter of wordsOG[wordIndex]) {
                       // Iterate over the letters of every word
                        letterLoop: for (let letterOther of wordsOG[i]) {
                            if (letter == letterOther) {
                                rank += 1
                                break wordLoop
                            }
                        }
                    }
                }
            }
            return rank
        } 

        /** Local helper function for sorting the list of words based off of their ranking,
         * in ascending order.
         * 
         * @returns { string[] } - the list of words sorted by rank in ascending order
        */
        function sortWords(): string[] {
            // Create an array of indices
            const indices = rankings.map((_, index) => index)
            DEV: console.log("indices: " + indices)

            // Sort the indices based on the values in the original array
            indices.sort((a, b) => {
                if (rankings[a] < rankings[b]) return -1;
                if (rankings[a] > rankings[b]) return 1;
                return 0; // For equal values
            });
            DEV: console.log("sorted indices: " + indices)

            for (let i = 0; i < wordsOG.length; i++) {
                rankedList[i] = wordsOG[indices[i]]
            }

            return rankedList;
        }

        /** Helper function for resizing the grid if a word would be out of bounds.
         * @param { number } addDim - the amount of cells to add. 
         * @param { number } shift - how far to shift the cells. Will be 0 
         * This will be the amount required to get the furthest cell in bounds again
         * @returns { number } The increase required for 
         */
        function enlargeGrid(inputGrid: Partial<Cell>[][], shift: number, wordToPlace: PlacedWord): [Partial<Cell>[][], PlacedWord] {

            // TODO Should I shift everything towards the center?
            let biggerGrid: Partial<Cell>[][] = []
            DEV: console.log("Increasing grid size")

 //           try {
                for(let i = 0; i < inputGrid.length * 2; i++) {
                    biggerGrid[i] = []
                    for (let j = 0; j < inputGrid.length * 2; j++) {
                        if((i < shift || j < shift) || 
                           (i - shift >= inputGrid.length || j - shift >= inputGrid.length)) {
//                            DEV: console.log("(" + i + ", " + j + ") not defined at (" + (i - shift) + ", " + (j - shift) + ") for inputGrid")
                            biggerGrid[i][j] = defaultCell()
                        }
                        else {
//                            DEV: console.log("(" + i + ", " + j + ") is defined at (" + (i - shift) + ", " + (j - shift) + ") for inputGrid")
                            biggerGrid[i][j] = inputGrid[i - shift][j - shift]
                        }
                    }
                }
//            }
//            catch(error) {
 //               DEV: console.log("idk man you messed up")
//                return enlargeGrid(inputGrid, addDim + 1, shift, wordToPlace) 
//                throw(error)
//            }

            shiftPlacedWords(currentWordsPlaced)
            inputGrid = biggerGrid
            wordToPlace.x += shift
            wordToPlace.y += shift
            DEV: console.log("Current grid dimensions: " + inputGrid.length)

            return [inputGrid, wordToPlace]

            /** Shifts the coordinates of the placed words so they're still accurate */
            function shiftPlacedWords(placedWords: PlacedWord[]){
                for(let wordPlaced of placedWords) {
                    DEV: console.log("There may be an error here if you try to edit one single attribute of a damn interface structure")
                    wordPlaced.x = wordPlaced.x + shift
                    wordPlaced.y = wordPlaced.y + shift
                }
            }
        }

        /** Helper function for shrinking the grid after all the words were 
         * placed / the grid with most words placed
         * @returns { Partial<Cell>[][] } The increase required for 
         */
        function shrinkGrid(inputGrid: Partial<Cell>[][]): Partial<Cell>[][] {
            let newGrid: Partial<Cell>[][] = []

            DEV: console.log("Shrinking grid")
            let leftmost, rightmost, topmost, bottommost: number


            // Find the highest, lowest, leftmost, rightmost
                for(let i = 0; i < inputGrid.length; i++) {
                    for (let j = 0; j < inputGrid.length; j++) {
                        if(inputGrid[i][j].white) {
                            if(topmost == null) {
                                topmost = i
                            }
                            try {
                                if(leftmost == null) 
                                    leftmost = j
                                else 
                                    if(j < leftmost) 
                                        leftmost = j
                            }
                            catch(error) {
                                leftmost = j
                            }
                            try {
                                if(rightmost == null) 
                                    rightmost = j
                                else
                                    if(j > rightmost) 
                                        rightmost = j
                            }
                            catch(error) {
                                rightmost = j
                            }
                            try {
                                if(bottommost == null) 
                                    bottommost = j
                                else
                                    if(i > bottommost) 
                                        bottommost = i
                                }
                            catch(error) {
                                bottommost = i
                            }
                        }
                    }
                }

            DEV: console.log("Leftmost: " + leftmost)
            DEV: console.log("Rightmost: " + rightmost)
            DEV: console.log("Topmost: " + topmost)
            DEV: console.log("Bottommost: " + bottommost)

            let newSize, horizontalPadding, verticalPadding: number

            if(rightmost - leftmost >= bottommost - topmost) {
                newSize = rightmost - leftmost
                verticalPadding = Math.floor((newSize - (bottommost - topmost)) / 2)
                horizontalPadding = 0
            }
            else {
                newSize = bottommost - topmost
                horizontalPadding = Math.floor((newSize - (rightmost - leftmost)) / 2)
                verticalPadding = 0
            }

            
            // TODO continue making the dimensions square
            // Initialize the grid and shift everything
            for(let i = 0; i < inputGrid.length; i++) {
                newGrid[i] = []
                for (let j = 0; j < inputGrid.length; j++) {
                    if(i >= topmost - verticalPadding && i <= bottommost + verticalPadding && j >= leftmost - horizontalPadding && j <= rightmost + horizontalPadding) {
                        newGrid[i - topmost - verticalPadding][j - leftmost - horizontalPadding] = inputGrid[i][j]
                    }
                    else if(i < topmost - verticalPadding 
                        && i > bottommost + verticalPadding 
                        && j < leftmost - horizontalPadding 
                        && j > rightmost + horizontalPadding) {
                }
            }

            return newGrid
        }
    }

        function generateCrosswordGrid(inputGrid: Partial<Cell>[][], words: string[]): Partial<Cell>[][] {
            for(let word of words) {
                let placement = selectPlacement(placeable(inputGrid, word))
                    DEV: console.log("Placement for " + word + ": " + placement.x + ", " + placement.y)
                    DEV: console.log("Placing " + word)
                try {
                    inputGrid = addWord(inputGrid, placement.word,placement.x, placement.y, placement.direction)
                }
                catch (error) {
                    DEV: console.log("Something went wrong during placement of " + word + ".")
                    DEV: console.log(error.message)
                    DEV: console.log(error.stack)
                }
                    DEV: console.log("Outside addword function:")
                    DEV: console.log(inputGrid)
            }
            return inputGrid
        }

        // =====================================================================================
        // Add words to grid (WIP)

        bestGrid = generateCrosswordGrid(currentGrid, wordsOG)
        bestWordsPlaced = currentWordsPlaced
        // currentGrid = shrinkGrid(currentGrid)

        // TODO TEST: iterate through the cells and number them properly just in case
        clueCount = 0

        for(let i = 0; i < bestGrid.length; i++) {
            let previousNumber = 0
            for (let j = 0; j < bestGrid.length; j++) {
                if(bestGrid[i][j].number) {
                    previousNumber = bestGrid[i][j].number
                    bestGrid[i][j].number = clueCount + 1
                    clueCount += 1
                }
            }
        }

        // TODO Return word and clue information to display it

        this.grid = bestGrid
        DEV: console.log(this.grid)

        this.newCrosswordGridDOM(document)

        // TODO Define WordsAndClues to return

        // Use bestWordsPlaced to access coordinates of grid, read number
        for(let wordObj of bestWordsPlaced) {
            // NOTE This may cause issues
            for(let wordClue of wordsClues) {
                if(wordObj.word == wordClue.word) {
                    wordClue.direction = wordObj.direction
                    wordClue.number = this.grid[wordObj.x][wordObj.y].number
                }
            }
        }
        for(let wordClue of wordsClues) {
            if(!wordClue.clue) {
                wordClue.clue = "NO CLUE FOR THIS WORD"
            }
            if(!(wordClue.clue && wordClue.direction && wordClue.number && wordClue.word))
                DEV: console.log("Not all of the values for a WordClue type are defined for " + wordClue.word)
        }

        // Afterwards, sort these by clue number

        return wordsClues as WordClue[]
        
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

