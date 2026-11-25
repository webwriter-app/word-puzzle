/**
 * Library for generating placements on a crossword grid for a given list of words.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { wordGraphemes, displayGrapheme, sameGrapheme } from "./graphemes";


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
    answer?: string | null; // Correct letter
/** The clue number. Can be null for white cells */
    number?: number | null;
/** Direction of the word. Down, across, both, or null */
    direction?: string | null;
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
    clueText?: string | null,
    /** (0-indexed) starting x-coordinate of the word on the grid*/
    x?: number | null,
    /** (0-indexed) starting y-coordinate of the word on the grid*/
    y?: number | null,
    /** Whether the word is across or down */
    across?: boolean | null,
    /** Number of the clue */
    clueNumber?: number | null
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
interface GenerationResults {
    wordsAndClues: WordClue[],
    grid: Cell[][]
}

function deleteElement<Type>(list: Type[], element: Type): Type {
    list.splice(list.indexOf(element), 1)
    return element
}

/**
     * Generates crossword puzzle based off of words in the clue box, without given coordinates.
     * 
     * Based off of Agarwal and Joshi 2020
     * @param {WordClue[]} wordsClues The list of words and clues from which to generate the crossword
     * @returns {WordClue[]} 
     */
export function generateCrossword(wordsClues: WordClue[], locale = "en"): GenerationResults {

    // TODO Figure out generation / backtracking recursively

    // Calculate minimum dimensions of crossword
    const minDim = wordsClues.map(word => wordGraphemes(word.word, locale).length).reduce((max, len) => Math.max(max, len), 0)

    /** The best grid found so far.
     * Smallest grid with the largest amount of words placed
     */
    let bestGrid!: Cell[][]
    let bestWordsPlaced: WordClue[] = []  // @type {string[]}

    /** How many clues there currently are. Used to calculate next clue number.
     */
    let clueCount = 0 // @type{number}

    /** Number of iterations until the algorithm stops */
    let epoch = 3000 // @type{number}

    let crosswordGenTimeout = 0

    try {
        generateCrosswordGrid(wordsClues, 0)
    }
    catch {
        // Generation was interrupted on purpose; the best grid found so far is used.
    }


    // iterate through the cells and number them properly just in case
    clueCount = 0

    for(let i = 0; i < bestGrid.length; i++) {
        for (let j = 0; j < bestGrid.length; j++) {
            if(bestGrid[i][j].number) {
                bestGrid[i][j].number = clueCount + 1
                clueCount += 1
            }
        }
    }

    // The following changes the original order, but I don't think that's necessarily bad?

    // Sort words by clue number
    bestWordsPlaced.sort((a, b) => a.clueNumber! - b.clueNumber!)
    // Sort words by across / down
    bestWordsPlaced.sort((a, b) => Number(b.across) - Number(a.across))

    // Bring words into inital order
    const orderWordsClues = wordsClues.map((wc) => bestWordsPlaced.find((bw) => bw.word == wc.word && bw.clueText == wc.clueText) || null).filter((nn) => nn != null)

    return {wordsAndClues: orderWordsClues, grid: bestGrid} 


    // =====================================================================================
    // HELPER FUNCTIONS
    // =====================================================================================

    /** Function that returns possible places for a word in the grid.
     * Returns null if there are no possible places.
     * @param { Cell[][] } inputGrid a given input grid
     * @param { WordClue } newWordClue 
     * @returns { boolean } - true if the word can be placed into G with at least one letter intersecting with another word
    */
    function placeable(inputGrid: Cell[][], wordsCluesPl: WordClue[], newWordClue: WordClue, firstWord?: boolean): WordClue[] {
        if (firstWord) {
            let possiblePlacementX = Math.floor(minDim/2 - 1);
            let possiblePlacementY = Math.floor(minDim/2) - Math.floor(wordGraphemes(newWordClue.word, locale).length/2);

            let possiblePlacement: WordClue = {...newWordClue}

            possiblePlacement.x = possiblePlacementX
            possiblePlacement.y = possiblePlacementY
            possiblePlacement.across = true

            
            return [possiblePlacement]
        }

        /** Function for determining whether a word is placeable in the grid. */
        let possiblePlacements: WordClue[]  = []

        // For every word already placed in the grid,
        // Go through all of its possible intersections with the new word
        for (let placedWord of wordsCluesPl) {
            if(placedWord.x != null && placedWord.y != null && placedWord.across != null) {
                let intersections = intersecting(newWordClue.word, placedWord.word, locale)
                let possibleDirection: string
                if (placedWord.across) {
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
                    const newWordGraphemes = wordGraphemes(newWordClue.word, locale);

                    // Don't place a word if there is a white cell right before or after it starts
                    if(possibleDirection == "across") {
                        if(possibleX >= 0 && possibleX < inputGrid.length && possibleY - 1 >= 0) {
                            notAdjacent = notAdjacent && !inputGrid[possibleX][possibleY - 1].white
                        }
                        if(possibleX >= 0 && possibleX < inputGrid.length && possibleY + newWordGraphemes.length < inputGrid.length) {
                            notAdjacent = notAdjacent && !inputGrid[possibleX][possibleY + newWordGraphemes.length].white
                        }
                    } else {
                        if(possibleX - 1 >= 0 && possibleY >= 0 && possibleY < inputGrid.length) {
                            notAdjacent = notAdjacent && !inputGrid[possibleX - 1][possibleY].white
                        }
                        if(possibleX + newWordGraphemes.length < inputGrid.length && possibleY >= 0 && possibleY < inputGrid.length) {
                            notAdjacent = notAdjacent && !inputGrid[possibleX + newWordGraphemes.length][possibleY].white
                        }
                    }

                    for (let i = 0; i < newWordGraphemes.length; i++) {
                        if (possibleDirection == "across") {
                            if (i != intersection[0]) {
                                if(i + possibleY >= 0 && i + possibleY < inputGrid.length) {
                                    // Don't place a word if there is a collision where the char isn't the same
                                    if (possibleX >= 0 && possibleX < inputGrid.length) {
                                        if(!sameGrapheme(newWordGraphemes[i], inputGrid[possibleX][possibleY + i].answer ?? "", locale)) {
                                            noClash = noClash && !inputGrid[possibleX][possibleY + i].white
                                        }
                                    }

                                    // Checks for white cells above / below the word
                                    if(possibleX - 1 >= 0 && possibleX - 1 < inputGrid.length) {
                                        notAdjacent = notAdjacent && !inputGrid[possibleX - 1][possibleY + i].white
                                    }
                                    if(possibleX + 1 >= 0 && possibleX + 1 < inputGrid.length) {
                                        notAdjacent = notAdjacent && !inputGrid[possibleX + 1][possibleY + i].white
                                    }
                                }
                            }
                        }
                        else {
                            if (i != intersection[0]) {
                                if(i + possibleX >= 0 && i + possibleX < inputGrid.length) {
                                    // Don't place a word if there is a collision where the char isn't the same
                                    if (possibleY >= 0 && possibleY < inputGrid.length) {
                                        if(!sameGrapheme(newWordGraphemes[i], inputGrid[possibleX + i][possibleY].answer ?? "", locale)) {
                                            noClash = noClash && !inputGrid[possibleX + i][possibleY].white
                                        }
                                    }

                                    // Test for adjacent squares
                                    if(possibleY - 1 >= 0 && possibleY - 1 < inputGrid.length) {
                                        notAdjacent = notAdjacent && !inputGrid[possibleX + i][possibleY - 1].white
                                    }
                                    if(possibleY + 1 >= 0 && possibleY + 1 < inputGrid.length) {
                                        notAdjacent = notAdjacent && !inputGrid[possibleX + i][possibleY + 1].white
                                    }
                                }
                        }
                    }
                }

                    let possiblePlacement: WordClue = {...newWordClue}

                    possiblePlacement.x = possibleX
                    possiblePlacement.y = possibleY
                    possiblePlacement.across = possibleDirection == "across"

                    if(possiblePlacement.x != null && possiblePlacement.y != null && possibleDirection != null) {
                        if(noClash && notAdjacent){
                            possiblePlacements.push({...possiblePlacement})
                        }
                    }

                }
            }
        }

        // test all the placements to make sure they don't cross over already assigned squares, 
            // or have adjacent squares that don't belong to that word
        return possiblePlacements
    }

    /** Tuple for word intersections */
    type WordIntersections = [wordNew: number, wordGrid: number]

    /** Helper function that returns the indices where 2 words intersect.
     * 
     * @returns { [number, number] } - indices of the words that match. [wordPlace, wordGrid]
    */
    function intersecting(wordPlace: string, wordGrid: string, locale: string): WordIntersections[] {
            let intersections: WordIntersections[] = []
            const placedLetters = wordGraphemes(wordPlace, locale);
            const gridLetters = wordGraphemes(wordGrid, locale);

            for (let i = 0; i < placedLetters.length; i++) {
                for (let j = 0; j < gridLetters.length; j++) {
                    if(sameGrapheme(placedLetters[i], gridLetters[j], locale)) {
                        intersections.push([i, j])
                    }
                }
            }

        return intersections
    }


    /** Local helper function for adding a word with a placement 
     * to an existing list of words and placements,
     * ensuring a correct grid.
     * 
     * @param {WordClue[]} wordsClues - the list of words and clues without the placement information for the new word. THIS IS ALTERED IN PLACE
     * @param {WordClue} wordToPlace - the word with placement information. 
    */
    function updatePlacements(wordsClues: WordClue[], possiblePlcmnts: WordClue[], p: number): WordClue[] {
        // I don't think this is iterating over chars 
        // TODO Troubleshoot, something's wrong here

        let x = possiblePlcmnts[p].x!
        let y = possiblePlcmnts[p].y!

        if(x < 0 || y < 0) {
            let shiftX = Math.abs(Math.max(x, 0))
            let shiftY = Math.abs(Math.max(y, 0))
            // Shift the coordinates for the possible placements
            for(let plcmnt of possiblePlcmnts) {
                plcmnt.x! += shiftX
                plcmnt.y! += shiftY
            }
            // Shift coordinates for placed words
            for(let wrdcl of wordsClues) {
                if(wrdcl.x != null && wrdcl.y != null) {
                    wrdcl.x += shiftX
                    wrdcl.y += shiftY
                    // Set clue number if coordinates are the same
                    if(wrdcl.x == possiblePlcmnts[p].x && wrdcl.y == possiblePlcmnts[p].y) {
                        possiblePlcmnts[p].clueNumber = wrdcl.clueNumber
                    }
                }
            }
        }


        // Add a clue number for the placement, if it wasn't added before
        if(possiblePlcmnts[p].clueNumber == null) {

            possiblePlcmnts[p].clueNumber = clueCount + 1
            clueCount += 1
        }

        // Add the placement to the list of words
        let i = wordsClues.findIndex((word) => word.word == possiblePlcmnts[p].word)
        wordsClues[i] = possiblePlcmnts[p]


        // Add padding
        let leftmost: number, rightmost: number, topmost: number, bottommost: number

        leftmost = wordsClues[0].y!
        rightmost = wordsClues[0].y!
        topmost = wordsClues[0].x!
        bottommost = wordsClues[0].x!

        for(let wordClue of wordsClues) {
            if(wordClue.x != null && wordClue.y != null) {
                leftmost = leftmost > wordClue.y ? wordClue.y : leftmost
                topmost = topmost > wordClue.x ? wordClue.x : topmost
                rightmost = rightmost < wordClue.y ? wordClue.y : rightmost
                bottommost = bottommost < wordClue.x ? wordClue.x : bottommost

                if(wordClue.across) {
                    const wordLength = wordGraphemes(wordClue.word, locale).length;
                    if(rightmost < wordClue.y + wordLength - 1) {
                        rightmost = wordClue.y + wordLength - 1
                    }
                }
                else {
                    const wordLength = wordGraphemes(wordClue.word, locale).length;
                    if(bottommost < wordClue.x + wordLength - 1) {
                        bottommost = wordClue.x + wordLength - 1
                    }
                }
            }
        }

        let horizontalPadding: number = 0, verticalPadding: number = 0
        let dimension = Math.max(rightmost - leftmost + 1, bottommost - topmost + 1)

        if(rightmost - leftmost >= bottommost - topmost) {
            verticalPadding = Math.floor((dimension - (bottommost - topmost + 1)) / 2)
        }
        else {
            horizontalPadding = Math.floor((dimension - (rightmost - leftmost + 1)) / 2)
        }


        for(let wordClue of wordsClues) {
            if(wordClue.x != null && wordClue.y != null) {
                wordClue.x = wordClue.x - topmost + verticalPadding
                wordClue.y = wordClue.y - leftmost + horizontalPadding
            }
        }

        for(let plcmnt of possiblePlcmnts) {
            // Avoid adjusting a placement twice
            // (Since it was most probably passed by reference)
            if(plcmnt != possiblePlcmnts[p]) {
                plcmnt.x = plcmnt.x! - topmost + verticalPadding
                plcmnt.y = plcmnt.y! - leftmost + horizontalPadding
            }
        }

        return wordsClues
    }

    /**
     * Helper functions for generating intermediate crossword grids.
     * Uses {@link bestGrid} and {@link bestWordsPlaced}
     * 
     * @param {Cell[][]} inputGrid
     * @param {WordClue[]} words
     * @returns {number} 0 if a grid was found, 1 otherwise - EDIT THIS
     */
    function generateCrosswordGrid(wordsCluesGen: WordClue[], depth: number): number | undefined {

        let inputGrid = generateCrosswordFromList(wordsCluesGen, locale)

        if(bestGrid != null) {
            // TODO Check if number of words and clues for inputGrid is larger than bestGrid's and if so, don't do this
            // Return immediately if inputGrid is larger than the bestGrid
            if(inputGrid.length > bestGrid.length) {
                return 1
            }
        }

        crosswordGenTimeout += 1
        if(crosswordGenTimeout == epoch) {
            throw new Error("Epoch reached")
        }

        // Limit recursion based on depth and number of possible combinations
        let wordsPlaced = nrWordsPlaced(wordsCluesGen)
        let wordsLeft = wordsCluesGen.length - nrWordsPlaced(wordsCluesGen)

        // Return if best grid is as long as the longest word
        if(wordsLeft == 0 && bestGrid != null) {
            if(bestGrid.length == wordsCluesGen.map(word => wordGraphemes(word.word, locale).length).reduce((max, len) => Math.max(max, len), 0)) {
                return 0
            }
        }

        let wordsCluesCopy = wordsCluesGen.map(wC => ({...wC}));
        //
        // TODO Fix the issue with the 0-ranking word thing. Just exclude such words
        // Save the best grid up until this point, this supports best grid with not all words placed
        if((wordsLeft > 0 && depth - wordsPlaced > (wordsLeft * (wordsLeft - 1)) / 2) || wordsLeft == 0) {
            if(inputGrid != null) {
                return setBestGrid(inputGrid)
            }
        }

        let i = 0
        while(i < wordsCluesCopy.length && (wordsCluesCopy[i].x != null && wordsCluesCopy[i].y != null)) {
            i++
        }
        
        if(i < wordsCluesCopy.length) {
            let firstFlag = i == 0
            let possiblePlacementsCw = placeable(inputGrid, wordsCluesCopy, wordsCluesCopy[i], firstFlag)
                for(let i = 0; i < possiblePlacementsCw.length; i++) {
                    // Add word
                    updatePlacements(wordsCluesCopy, possiblePlacementsCw, i)
                    wordsCluesCopy = setClueNumbers(wordsCluesCopy)
                    // Recurse
                    generateCrosswordGrid(wordsCluesCopy, depth + 1)
                    // Remove placement
                    removePlacement(wordsCluesCopy, possiblePlacementsCw[i])
                }
                // Move the word to the end of the list, generate again at this level
                moveWordToEnd(wordsCluesCopy, wordsCluesCopy[i])
                return generateCrosswordGrid(wordsCluesCopy, depth + 1)
        }
        // Why doesn't this work if wordsCluesGen is used instead of wordsCluesCopy?
        else {
            return setBestGrid(inputGrid)
        }

        function setBestGrid(grid: Cell[][]): number | undefined {
           if(bestGrid == null) {
                bestGrid = grid
                bestWordsPlaced = wordsCluesCopy
                return 0
            }
            else if(bestGrid.length > grid.length && grid.length != 0) {
                if(nrWordsPlaced(bestWordsPlaced) <= nrWordsPlaced(wordsCluesCopy)) {
                    bestGrid = grid
                    bestWordsPlaced = wordsCluesCopy
                    return 0
                }
                else {
                    return 1
                }
            }
        }

        /**
         * Returns the number of words placed
         * @param wordList 
         * @returns {number} Number of words placed
         */
        function nrWordsPlaced(wordList: WordClue[]): number {
            let nrPlacedWords = 0
            for(let wordClue of wordList) {
                nrPlacedWords += wordClue.x != null && !isNaN(wordClue.x)
                    && wordClue.y != null && !isNaN(wordClue.y) ? 1 : 0
            }
            return nrPlacedWords
        }

        function moveWordToEnd(wordList: WordClue[], moveW: WordClue) {
            wordList.push(deleteElement(wordList, moveW))
        }

        function removePlacement(wordList: WordClue[], placedW: WordClue) {
            let i = wordList.findIndex((wordL) => wordL.word == placedW.word)
            wordList[i] = {...placedW}
            wordList[i].clueNumber = null
            wordList[i].across = null
            wordList[i].x = null
            wordList[i].y = null
        }

        function setClueNumbers(wordList: WordClue[]): WordClue[]{
            let wordListCopy = wordList.map(wC => ({...wC}));
            wordListCopy.sort((a, b) => a.y! - b.y!)
            wordListCopy.sort((a, b) => a.x! - b.x!)

            let clueNr = 1
            for(let i = 0; i < wordListCopy.length; i++) {
                if(i != 0 && wordListCopy[i].x == wordListCopy[i-1].x && wordListCopy[i].y == wordListCopy[i-1].y && wordListCopy[i].x != null) {
                    wordListCopy[i].clueNumber = wordListCopy[i-1].clueNumber
                }
                else {
                    wordListCopy[i].clueNumber = clueNr
                    clueNr += 1
                }
            }

            for(let wordClCpy of wordListCopy) {
                for(let wordCl of wordList) {
                    if(wordClCpy.word == wordCl.word) {
                        wordCl.clueNumber = wordClCpy.clueNumber
                    }
                }
            }

            return wordList
        }
    }
}

    /**
     * Generates crossword puzzle based off of a list of words with their given placements.
     * 
     * @param {WordClue[]} wordsClues The list of words and clues from which to generate the crossword
     * @returns {Cell[][]} The crossword object
     */
export function generateCrosswordFromList(wordsClues: WordClue[], locale = "en"): Cell[][] {

    // Initialization
    if(!wordsClues?.length) {
        let grid: Cell[][] = []

            for(let i = 0; i < 8; i++) {
                grid[i] = []
                for (let j = 0; j < 8; j++) {
                    grid[i][j] = defaultCell()
                }
            }
        return grid
    }

    let leftmost: number, rightmost: number, topmost: number, bottommost: number

    leftmost = wordsClues[0].y!
    rightmost = wordsClues[0].y!
    topmost = wordsClues[0].x!
    bottommost = wordsClues[0].x!

    // Shifting words and clues
    for(let wordClue of wordsClues) {
        if(wordClue.x != null && wordClue.y != null) {
            leftmost = leftmost > wordClue.y ? wordClue.y : leftmost
            topmost = topmost > wordClue.x ? wordClue.x : topmost

            if(wordClue.across) {
                const wordLength = wordGraphemes(wordClue.word, locale).length;
                if(rightmost < wordClue.y + wordLength - 1) {
                    rightmost = wordClue.y + wordLength - 1
                }
                if(bottommost < wordClue.x) {
                    bottommost = wordClue.x
                }
            }
            else {
                if(rightmost < wordClue.y) {
                    rightmost = wordClue.y
                }
                const wordLength = wordGraphemes(wordClue.word, locale).length;
                if(bottommost < wordClue.x + wordLength - 1) {
                    bottommost = wordClue.x + wordLength - 1
                }
            }
        }
    }

    let dimension = Math.max(rightmost - leftmost + 2, bottommost - topmost + 2)
    let grid: Cell[][] = []

    for(let i = 0; i < dimension; i++) {
        grid[i] = []
        for (let j = 0; j < dimension; j++) {
            grid[i][j] = defaultCell()
        }
    }

    for(let wordClue of wordsClues) {
        if(wordClue.x != null && wordClue.y != null && !isNaN(wordClue.x) && !isNaN(wordClue.y)) {
            if(wordClue.clueNumber != null) {
                grid[wordClue.x][wordClue.y].number = wordClue.clueNumber
            }

            const letters = wordGraphemes(wordClue.word, locale);
            for(let c = 0; c < letters.length; c++) {

                let i = 0, j = 0

                switch(wordClue.across) {
                    case true: 
                        j = c
                        break
                    default:
                        i = c
                        break
                }
                grid[wordClue.x + i ][wordClue.y + j].answer = displayGrapheme(letters[c], locale)
                grid[wordClue.x + i ][wordClue.y + j].white = true

                let direction = wordClue.across ? "across" : "down"
                if(grid[wordClue.x + i ][wordClue.y + j].direction != null) {
                    let direction_opposite = !wordClue.across ? "across" : "down"
                    if(grid[wordClue.x + i ][wordClue.y + j].direction == direction_opposite) {
                        grid[wordClue.x + i ][wordClue.y + j].direction = "both"
                    }
                    else {
                        grid[wordClue.x + i ][wordClue.y + j].direction = direction
                    }
                }
                else {
                        grid[wordClue.x + i ][wordClue.y + j].direction = direction
                }
            }
        }
    }

    return grid
}
