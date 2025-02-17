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
/** The correct character */
    answer: string; // Correct letter
/** The clue number */
    number: number; 
/** Direction of the word. Down, across, both, or null */
    direction: string; 
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
        DEV: console.log("A row of the non-DOM grid looks like this:")
        DEV: console.log((this.grid[x-1]))
            for (let y = 1; y <= this.grid.length; y += 1) {
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
    generateCrossword(words: string[]) {

        // TODO Figure out generation / backtracking recursively

        // Initialization
        DEV: console.log("generation triggered")

        /** The words in their original order. */
        let wordsOG: string[] = words // @type{string[]}

        /** The amount of words that still must be put into the grid */
        let wordsLeft: string[] = Object.assign([], wordsOG) // @type {string[]}

        /** Custom data type for words placed on the grid. 
         * Includes word itself and coordinates. */
        interface PlacedWord {
            word: string;
            x: number; // x coordinate
            y: number; // y coordinate
            direction: string; // true if across, false if down
        }

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
        let scratchpadGrid: Partial<Cell>[][] // @type {Cell[][]}
        let scratchWordsPlaced: PlacedWord[] = []  // @type {string[]}

        /** The number of words in the best grid */
        let bestWordNr = 0 // @type{number}

        for(let i = 0; i < dimension; i++) {
            currentGrid[i] = []
            for (let j = 0; j < dimension; j++) {
                currentGrid[i][j] = defaultCell()
            }
        }
        DEV: console.log("basic stuff initialized")

        // Initialize scratchpadGrid
        for(let i = 0; i < wordsOG.reduce((accumulator, currentValue) => accumulator + currentValue.length, 0); i++) {
            scratchpadGrid[i] = []
            for (let j = 0; j < dimension; j++) {
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

                    // Currently doesn't support the word being added if the grid is too small for it
                    if (possibleDirection == "across") {
                        for (let i = 0; i < wordNew.length; i++) {
                            if (i != intersection[0]) {
                                if(i + possibleY >= 0 && i + possibleY < dimension)
                                    noClash = noClash && !currentGrid[possibleX][possibleY + i].white
                                try {
                                    notAdjacent = notAdjacent && !currentGrid[possibleX + 1][possibleY + i].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check: No cells below")
                                }
                                try {
                                    notAdjacent = notAdjacent && !currentGrid[possibleX - 1][possibleY + i].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check: No cells above")
                                }
                            }
                        }
                    }
                    else {
                        for (let i = 0; i < wordNew.length; i++) {
                            if (i != intersection[0]) {
                                if(i + possibleX >= 0 && i + possibleX < dimension)
                                    noClash = noClash && !currentGrid[possibleX + i][possibleY].white
                                // Test for adjacent squares
                                try {
                                    notAdjacent = notAdjacent && !currentGrid[possibleX + i][possibleY + 1].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check: No cells to the right")
                                }
                                try {
                                    notAdjacent = notAdjacent && !currentGrid[possibleX + i][possibleY - 1].white
                                } catch(error) {
                                    DEV: console.log("Adjacency check: No cells to the left")
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
        function addWord(inputGrid: Partial<Cell>[][], word: string, inputX: number, inputY: number, direction: string): void {
            // I don't think this is iterating over chars 
            let wordToPlace = {word: word, x: inputX, y: inputY, direction: direction}
            let shift: number = 0

            // Resize grid if word would be out of bounds at the bottom / right
            if(direction == "across") {
                if (wordToPlace.x - 1 >= dimension || wordToPlace.y + word.length - 1 >= dimension) {
                    let increase = inputY + word.length - dimension
                    resizeGrid(inputGrid, increase, 0, wordToPlace)
                }
            }
            else  {
                if (wordToPlace.x + word.length - 1 >= dimension || wordToPlace.y - 1 >= dimension) {
                    let increase = inputX + word.length - dimension
                    resizeGrid(inputGrid, increase, 0, wordToPlace)
                }
            }

            // Resize grid if word would be out of bounds at the top / left
            if (wordToPlace.x < 0 || inputY < 0) {
                let shift = Math.abs(Math.min(inputX, inputY))
                let increase = shift
                resizeGrid(inputGrid, increase, shift, wordToPlace)
            }
            let x = wordToPlace.x
            let y = wordToPlace.y

            // Add clue number to the cell
            if (!inputGrid[x][y].number) {
                inputGrid[x][y].number = clueCount + 1
                clueCount += 1
            }

            DEV: console.log("Placing " + word + " " + direction)
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
                    DEV: console.log("increased y")
                }
                else {
                    if (inputGrid[x][y].direction == "" || !inputGrid[x][y].direction || inputGrid[x][y].direction == "down") {
                        inputGrid[x][y].direction = "down"
                    }
                    else {
                        inputGrid[x][y].direction = "both"
                    }
                    x += 1
                    DEV: console.log("increased x")
                }
            }
            currentWordsPlaced.push({ word: word, x: inputX, y: inputY, direction: direction })
            try {
                wordsLeft.splice(wordsLeft.indexOf(word), 1)
            } catch(error) {
                DEV: console.log("No words left")
            }
            DEV: console.log(wordsLeft)
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
        function resizeGrid(inputGrid: Partial<Cell>[][], addDim: number, shift: number, wordToPlace: PlacedWord): number {

            // TODO Reimplement resize grid as enlarge grid, to double it and stuff
            // TODO Add a resizing grid (shrink grid) at the end
            let biggerGrid: Partial<Cell>[][] = []
            DEV: console.log("Increasing grid size")

            try {
                for(let i = 0; i < dimension + addDim; i++) {
                    biggerGrid[i] = []
                    for (let j = 0; j < dimension + addDim; j++) {
                        if((i < shift || j < shift) || 
                           (i - shift >= dimension || j - shift >= dimension)) {
                            biggerGrid[i][j] = defaultCell()
                        }
                        else {
                            biggerGrid[i][j] = inputGrid[i - shift][j - shift]
                        }
                    }
                }
            }
            catch(error) {
                DEV: console.log("Some cells are out of bounds. Increasing size further")
                return resizeGrid(inputGrid, addDim + 1, shift, wordToPlace) 
            }
            

            shiftPlacedWords(currentWordsPlaced)
            inputGrid = biggerGrid
            dimension += addDim
            wordToPlace.x += shift
            wordToPlace.y += shift

            // Recurse until it returns 0 lol
            return 0

            /** Shifts the coordinates of the placed words so they're still accurate */
            function shiftPlacedWords(placedWords: PlacedWord[]){
                for(let wordPlaced of placedWords) {
                    DEV: console.log("There may be an error here if you try to edit one single attribute of a damn interface structure")
                    wordPlaced.x = wordPlaced.x + shift
                    wordPlaced.y = wordPlaced.y + shift
                }
            }
        }

        function generateCrosswordGrid(inputGrid: Partial<Cell>[][], words: string[]): Partial<Cell>[][] {
            for(let word of words) {
                let placement = selectPlacement(placeable(inputGrid, word))
                try {
                    DEV: console.log("Placement for " + word + ": " + placement.x + ", " + placement.y)
                    DEV: console.log("Placing " + word)
                    addWord(inputGrid, placement.word,placement.x, placement.y, placement.direction)
                }
                catch (error) {
                    DEV: console.log("No placement for " + word + " could be found")
                }
            }
            return currentGrid
        }

        // =====================================================================================
        // Add words to grid (WIP)

        currentGrid = generateCrosswordGrid(currentGrid, wordsOG)
        this.grid = currentGrid
        
        DEV: console.log(this.grid)

        // TODO iterate through the cells and number them properly just in case
        this.newCrosswordGridDOM(document)
        
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

