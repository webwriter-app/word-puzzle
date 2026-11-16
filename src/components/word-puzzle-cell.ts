import type { Cell } from "../model/crossword-gen";

/**
* Constructor for the cells of the {@link WwWordPuzzlesCrossword.gridEl | grid} DOM element.
*
* @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
* @param {number} x the row of the cell, 0-indexed
* @param {number} y the column of the cell, 0-indexed
* eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
* @returns {HTMLDivElement} the DOM element for the _cell_
* Source: crosswords-js, partially
*/
export function newCellDOM(document: Document, grid: Cell[][], type: string, x: number, y: number, letter: string, locale = "en", fillerGraphemes: string[] = []) {
    const cellDOM: HTMLDivElement = document.createElement('div');
    cellDOM.className = 'cell'
    cellDOM.style.gridRowStart = (x+1).toString()
    cellDOM.style.gridColumnStart = (y+1).toString()
    cellDOM.setAttribute("grid-row", (x).toString())
    cellDOM.setAttribute("grid-col", (y).toString())

    // This is just temporary for testing
    try {
    if (!grid[x][y].white) {
        if(type == "crossword") {
            cellDOM.setAttribute("black", "")
            cellDOM.setAttribute("answer", "false");
            cellDOM.contentEditable = "false";

        }else {
            cellDOM.setAttribute("white", "")
            cellDOM.setAttribute("answer", "false");
            cellDOM.contentEditable = "false";
    
            const cellLetter = document.createElement('div');
            cellLetter.classList.add('cell-letter')
            const randomLetter = fillerGraphemes.length
                ? fillerGraphemes[Math.floor(Math.random() * fillerGraphemes.length)]
                : "";
            cellLetter.innerText = randomLetter
            cellDOM.appendChild(cellLetter)

        }
    }
    else {
        if(type == "crossword") {
            cellDOM.contentEditable = "true";
        }else {
            cellDOM.contentEditable = "false";
        }
        cellDOM.removeAttribute("black")
        cellDOM.setAttribute("answer", "true");
        cellDOM.setAttribute("direction", String(grid[x][y].direction));
        // Create div for adding a letter
        const cellLetter = document.createElement('div');
        cellLetter.classList.add('cell-letter')
        // Add x and y data to the cell and letter for checking in find the words if the cursor was dragged over the correct characters
        cellDOM.setAttribute('data-x', x.toString());
        cellDOM.setAttribute('data-y', y.toString());
        cellLetter.setAttribute('data-x', x.toString());
        cellLetter.setAttribute('data-y', y.toString());
        if(type == "find-the-words") {
            cellLetter.innerText = letter
        }
        cellDOM.appendChild(cellLetter)
        // Add a small div for the clue number if the cell has one
        if (type == "crossword" && grid[x][y].number) {
            const numberText = document.createElement('div');
            numberText.classList.add('clue-label');
            numberText.contentEditable = "false";
            numberText.innerHTML = grid[x][y].number.toString();
            cellDOM.appendChild(numberText);
        }
    }
    }
    catch {
        // A cell outside the grid stays an empty element.
    }

    return cellDOM
}
