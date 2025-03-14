/**
 * Library for generating placements on a crossword grid for a given list of words.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */

import { WordClue, Cell, GenerationResults, defaultCell } from '../widgets/crossword-grid'

/**
     * Generates crossword puzzle based off of words in the clue box, without given coordinates.
     * 
     * Based off of Agarwal and Joshi 2020
     * @param {WordClue[]} wordsClues The list of words and clues from which to generate the crossword
     * @returns {WordClue[]} 
     */
export function generateCrossword(wordsClues: WordClue[]): GenerationResults {

    // TODO Figure out generation / backtracking recursively
    // TODO Make the coordinates not come out negative sometimes

    // Calculate minimum dimensions of crossword
    const minDim = wordsClues.map(word => word.word.length).reduce((max, len) => Math.max(max, len), 0)

    /** The best grid found so far.
     * Smallest grid with the largest amount of words placed
     */
    let bestGrid: Cell[][] // @type {Cell[][]}
    let bestWordsPlaced: WordClue[] = []  // @type {string[]}

    /** Grid for testing adding / removing words */
    let scratchpadGrid: Cell[][] = [] // @type {Cell[][]}
    let scratchWordsPlaced: WordClue[] = []  // @type {string[]}

    // Initialize scratchpadGrid
    for(let i = 0; i < wordsClues.reduce((accumulator, currentValue) => accumulator + currentValue.word.length, 0); i++) {
        scratchpadGrid[i] = []
        for (let j = 0; j < wordsClues.reduce((accumulator, currentValue) => accumulator + currentValue.word.length, 0); j++) {
            scratchpadGrid[i][j] = defaultCell()
        }
    }

    /** The rankings of the words; indices correspond to original word list */
    let rankings: number[] = Array(wordsClues.length).fill(-1) // @type{number[]}

    /** The words in a list from high to low based off of ranking.
     * This may change based on backtracking so that the order 
     * doesn't correspond to the actual ranking anymore
     */
    let rankedList: WordClue[]
    rankedList = sortWords() // @type{string[]}

    /** How many clues there currently are. Used to calculate next clue number.
     */
    let clueCount = 0 // @type{number}

    /** Number of iterations until the algorithm stops */
    let epoch = 500 // @type{number}

    // Rank the words
    for(let i = 0; i < wordsClues.length; null) {
        rankings[i] = rankWord(i)
        i++
    }

    bestGrid = generateCrosswordGrid(scratchpadGrid, wordsClues)
    DEV: console.log("Words and clues:")
    DEV: console.log(wordsClues)

    // iterate through the cells and number them properly just in case
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

    // Use bestWordsPlaced to access coordinates of grid, read number
    for(let wordObj of bestWordsPlaced) {
        // NOTE This may cause issues
        for(let wordClue of wordsClues) {
            if(wordObj.word == wordClue.word) {
                wordClue.across = wordObj.across
                wordClue.clueNumber = bestGrid[wordObj.x][wordObj.y].number
                wordClue.x = wordObj.x
                wordClue.y = wordObj.y
            }
        }
    }

    for(let wordClue of wordsClues) {
        if(!wordClue.clueText) {
            wordClue.clueText = "* No clue for this word *"
        }
        if(!(wordClue.clueText && (wordClue.across != null) && wordClue.clueNumber && wordClue.word))
            DEV: console.log("Not all of the values for a WordClue type are defined for " + wordClue.word)
    }

    // The following changes the original order, but I don't think that's necessarily bad?

    // Sort words by clue number
    wordsClues.sort((a, b) => a.clueNumber - b.clueNumber)
    // Sort words by across / down
    wordsClues.sort((a, b) => Number(b.across) - Number(a.across))

    return {wordsAndClues: wordsClues as WordClue[], grid: bestGrid} 


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
            let possiblePlacementY = Math.floor(minDim/2) - Math.floor(newWordClue.word.length/2);

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
            let intersections = intersecting(newWordClue.word, placedWord.word)
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

                // Don't place a word if there is a white cell right before or after it starts
                let col_shift = 0
                let row_shift = 0

                if(possibleDirection == "across"){
                    col_shift = newWordClue.word.length
                }
                else {
                    row_shift = newWordClue.word.length
                }

                if(possibleX - (row_shift === 0 ? 0 : 1) >= 0 && possibleY - (col_shift === 0 ? 0 : 1) >= 0) {
                    notAdjacent = notAdjacent && !inputGrid[possibleX - (row_shift === 0 ? 0 : 1)][possibleY - (col_shift === 0 ? 0 : 1)].white
                }

                if(possibleX + row_shift < inputGrid.length && possibleY + col_shift < inputGrid.length) {
                    notAdjacent = notAdjacent && !inputGrid[possibleX + row_shift][possibleY + col_shift].white
                }

                for (let i = 0; i < newWordClue.word.length; i++) {
                    if (possibleDirection == "across") {
                        if (i != intersection[0]) {
                            if(i + possibleY >= 0 && i + possibleY < inputGrid.length) {
                                // Don't place a word if there is a collision where the char isn't the same
                                if (possibleX >= 0 && possibleX < inputGrid.length) {
                                    if(newWordClue.word[i] != inputGrid[possibleX][possibleY + i].answer) {
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
                                    if(newWordClue.word[i] != inputGrid[possibleX + i][possibleY].answer) {
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

                if(noClash && notAdjacent){
                    possiblePlacements.push({...possiblePlacement})
                }

            }

        }

        // test all the placements to make sure they don't cross over already assigned squares, 
            // or have adjacent squares that don't belong to that word
        DEV: console.log("Possible placements for " + newWordClue.word + ": ")
        DEV: console.log(possiblePlacements)
        return possiblePlacements
    }

    function selectPlacement(possiblePlacementOptions: WordClue[]): WordClue {

        let possiblePlacementsNoResize: WordClue[] = []

        // Prioritize word placement that doesn't require resizing the grid
        if(possiblePlacementOptions != null) {
            for (let placementOption of possiblePlacementOptions) {
                if (placementOption.x >= 0 && placementOption.y >= 0) {
                    possiblePlacementsNoResize.push({...placementOption})
                }
            }
        }
        let placement: WordClue
        if(possiblePlacementsNoResize.length === 0) {
            placement = possiblePlacementOptions[0]
        }
        else {
            placement = possiblePlacementsNoResize[0]
        }
        //DEV: console.log("placement for " + possiblePlacementOptions[0].word + ":")
        //DEV: console.log(placement)
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


    /** Local helper function for adding a word with a placement 
     * to an existing list of words and placements,
     * ensuring a correct grid.
     * 
     * @param {WordClue[]} wordsClues - the list of words and clues without the placemnet information for the new word.
     * @param {WordClue} wordToPlace - the word with placement information.
    */
    function updatePlacements(wordsClues: WordClue[], wordToPlace: WordClue): void {
        // I don't think this is iterating over chars 

        let x = wordToPlace.x
        let y = wordToPlace.y

        if(wordToPlace.x < 0 || wordToPlace.y < 0) {
            let shiftX = Math.abs(wordToPlace.x)
            let shiftY = Math.abs(wordToPlace.y)
            wordToPlace.x += shiftX
            wordToPlace.y += shiftY
            for(let wrdcl of wordsClues) {
                if(wrdcl.x != null && wrdcl.y != null) {
                    wrdcl.x += shiftX
                    wrdcl.y += shiftY
                    if(wrdcl.x == wordToPlace.x && wrdcl.y == wordToPlace.y) {
                        wordToPlace.clueNumber = wrdcl.clueNumber
                    }
                }
            }
        }

        
        if(wordToPlace.clueNumber == null) {
            for(let wrdcl of wordsClues) {
                if(wrdcl.x != null && wrdcl.y != null) {
                    if(wrdcl.x == wordToPlace.x && wrdcl.y == wordToPlace.y) {
                        wordToPlace.clueNumber = wrdcl.clueNumber
                    }
                }
            }
            if(wordToPlace.clueNumber == null) {
                wordToPlace.clueNumber = clueCount + 1
                clueCount += 1
            }
        }

        let i = wordsClues.findIndex((word) => word.word == wordToPlace.word)
        wordsClues[i] = wordToPlace
        return
    }

    /** Helper function that determines which word would enable adding 
     * multiple more to the grid, if any.
     * 
     * @param {string} word - the word which would be removed.
     * @returns { Cell } - the grid without the word, if its removal was blocking other words. Null otherwise
    */
    function blockingWord(inputGrid: Cell[][], word: string): Cell[][] {
        // Get copy of added words
            // wordsPlaced but only the words
        let wordList: WordClue[] = []

        // TODO make it not depend on wordsPlaced, I guess? Just do it manually with the grid :/
        // Maybe just use the scratchpad thing
        for(let wordPlaced of currentWordsPlaced) {
            if(wordPlaced.word != word)
                wordList.push(wordPlaced)
        }

        //DEV: console.log("Word list without " + word + ": " + wordList)

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
     * @returns { [Cell[][], WordClue[]] } - the new grid and new list
    */
    function wraparound(grid: Cell[][], wordClue: WordClue): [Cell[][], WordClue[]] {
        // TODO
        wordsLeft.push(wordClue)
        rankedList.splice(rankedList.indexOf(wordClue), 1)
        rankedList.push(wordClue)
        return
    }

    /** Helper function that removes a word from the grid.
     * 
     * @returns { string } - the word that was removed.
    */
    function remove(grid: Cell[][], wordClue: WordClue): void {
        // TODO

        wordsLeft.push(wordClue)
        currentWordsPlaced.splice(currentWordsPlaced.findIndex(wordR => wordR === wordClue), 1)
        return
    }

    /** Local helper function for ranking a word to place onto the grid next.
     * This ranking strategy is independent of the grid content.
     * The wordsClues array is used
     * 
     * @param { number } wordIndex - the index of the word to be added to the grid (based off original word list)
     * @returns { number } - the rank of the word
    */
    function rankWord(wordIndex: number): number {
        // Word-level intersections rather than letter-level intersections are used.
        let rank = 0
        
        for(let i = 0; i < wordsClues.length; i++) {
            if (i != wordIndex) {
                wordLoop: for(let letter of wordsClues[wordIndex].word) {
                    // Iterate over the letters of every word
                    letterLoop: for (let letterOther of wordsClues[i].word) {
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
     * Uses {@link wordsClues}
     * 
     * @returns { WordClue[] } - the list of words sorted by rank in ascending order
    */
    function sortWords(): WordClue[] {
        // Create an array of indices
        const indices = rankings.map((_, index) => index)
        //DEV: console.log("indices: " + indices)

        // Sort the indices based on the values in the original array
        indices.sort((a, b) => {
            if (rankings[a] < rankings[b]) return -1;
            if (rankings[a] > rankings[b]) return 1;
            return 0; // For equal values
        });
        //DEV: console.log("sorted indices: " + indices)

        rankedList = []

        for (let i = 0; i < wordsClues.length; i++) {
            rankedList[i] = wordsClues[indices[i]]
        }

        return rankedList;
    }

    /** Helper function for resizing the grid if a word would be out of bounds.
     * @param { number } addDim - the amount of cells to add. 
     * @param { number } shift - how far to shift the cells. Will be 0 
     * This will be the amount required to get the furthest cell in bounds again
     * @returns { number } The increase required for 
     */
    function enlargeGrid(inputGrid: Cell[][], shift: number, wordToPlace: WordClue): [Cell[][], WordClue] {

        // TODO Should I shift everything towards the center?
        let biggerGrid: Cell[][] = []
        //DEV: console.log("Increasing grid size")

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
        //DEV: console.log("Current grid dimensions: " + inputGrid.length)

        return [inputGrid, wordToPlace]

        /** Shifts the coordinates of the placed words so they're still accurate */
        function shiftPlacedWords(placedWords: WordClue[]){
            for(let wordPlaced of placedWords) {
                //DEV: console.log("There may be an error here if you try to edit one single attribute of a damn interface structure")
                wordPlaced.x = wordPlaced.x + shift
                wordPlaced.y = wordPlaced.y + shift
            }
        }
    }

    /** Helper function for shrinking the grid after all the words were 
     * placed / the grid with most words placed
     * @returns { Cell[][] } The increase required for 
     */
    function shrinkGrid(inputGrid: Cell[][]): Cell[][] {
        let newGrid: Cell[][] = []

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

        //DEV: console.log("Leftmost: " + leftmost)
        //DEV: console.log("Rightmost: " + rightmost)
        //DEV: console.log("Topmost: " + topmost)
        //DEV: console.log("Bottommost: " + bottommost)

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

    /**
     * Helper functions for generating intermediate crossword grids.
     * Uses {@link bestGrid} and {@link bestWordsPlaced}
     * 
     * @param {Cell[][]} inputGrid 
     * @param {WordClue[]} words
     * @returns {Cell[][]} 
     */
    function generateCrosswordGrid(inputGrid: Cell[][], wordsClues: WordClue[]): Cell[][] {
        // TODO Make this function recursive
        for(let wordClue of wordsClues) {
            let placement: WordClue
            if(wordClue == wordsClues[0]) {
                placement = selectPlacement(placeable(inputGrid, wordsClues, wordClue, true))
            }
            else {
                placement = selectPlacement(placeable(inputGrid,  wordsClues, wordClue))
            }
            try {
                updatePlacements(wordsClues, placement)
                inputGrid = generateCrosswordFromList(wordsClues)
            }
            catch (error) {
                DEV: console.log("During placement of " + wordClue.word +":\n" + error.message)
            }
        }
        return inputGrid
    }

}
/**
     * Generates crossword puzzle based off of a list of words with their given placements.
     * 
     * @param {WordClue[]} wordsClues The list of words and clues from which to generate the crossword
     * @returns {Cell[][]} The crossword object
     */
export function generateCrosswordFromList(wordsClues: WordClue[]): Cell[][] {

    // Initialization
    DEV: console.log("Crossword generation from list triggered")

    let leftmost: number, rightmost: number, topmost: number, bottommost: number

    leftmost = wordsClues[0].y
    rightmost = wordsClues[0].y
    topmost = wordsClues[0].x
    bottommost = wordsClues[0].x

    for(let wordClue of wordsClues) {
        if(wordClue.x != null && wordClue.y != null) {
            leftmost = leftmost > wordClue.y ? wordClue.y : leftmost
            topmost = topmost > wordClue.x ? wordClue.x : topmost

            if(wordClue.across) {
                rightmost = rightmost < wordClue.y + wordClue.word.length - 1 ? wordClue.y + wordClue.word.length - 1 : rightmost
                bottommost = bottommost < wordClue.x ? wordClue.x : bottommost
            }
            else {
                rightmost = rightmost < wordClue.y ? wordClue.y : rightmost
                bottommost = bottommost < wordClue.x + wordClue.word.length - 1 ? wordClue.x + wordClue.word.length - 1 : bottommost
            }
        }
    }

    let dimension = Math.max(rightmost - leftmost + 1, bottommost - topmost + 1)
    let grid: Cell[][] = []

    for(let i = 0; i < dimension; i++) {
        grid[i] = []
        for (let j = 0; j < dimension; j++) {
            grid[i][j] = defaultCell()
        }
    }

    let horizontalPadding: number = 0, verticalPadding: number = 0

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
            if(wordClue.clueNumber != null) {
                grid[wordClue.x][wordClue.y].number = wordClue.clueNumber
            }

            for(let c = 0; c < wordClue.word.length; c++) {

                grid[wordClue.x][wordClue.y].answer = wordClue.word[c]
                let i = 0, j = 0

                switch(wordClue.across) {
                    case true: 
                        j = c
                        break
                    default:
                        i = c
                        break
                }
                grid[wordClue.x + i ][wordClue.y + j].answer = wordClue.word[c]
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
