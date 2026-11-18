/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 */
import { html, LitElement } from 'lit';
import { state } from 'lit/decorators.js';
import { str } from '@lit/localize';
import { widgetMsg } from '@webwriter/lit/localize';
import type { WebwriterWordPuzzle, CwContext } from '../widgets/webwriter-word-puzzle';
import { WordClue, Cell, defaultCell, generateCrossword, generateCrosswordFromList } from '../model/crossword-gen';
import { wordGraphemes, displayGrapheme, firstLetterGrapheme, getFillerGraphemes, sameGrapheme } from '../model/graphemes';
import { newCellDOM } from './word-puzzle-cell';
import { grid_styles } from './word-puzzle.styles'

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

const DEFAULT_DIMENSION: number = 9

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
export class WebwriterWordPuzzleGrid extends LitElement {
    // All methods have the same names as in crosswords-js

    /**
     * Styles for the crossword grid.
     * clue-label based off of crossword-js
     */
    static styles = grid_styles

    /** The widget that owns this element. Set by the widget right after creation. */
    parentComponent!: WebwriterWordPuzzle

    @state()
    accessor grid: Cell[][] = Array.from({ length: DEFAULT_DIMENSION}, () => Array(DEFAULT_DIMENSION).fill(defaultCell()))

    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterWordPuzzle.newCrosswordGrid | newCrosswordGrid()}
     */
    @state()
    accessor gridEl!: HTMLDivElement


    /**
     * The DOM svg element for the find-the-words puzzle
     * 
     */
    @state()
    accessor svgEl!: SVGSVGElement

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @state()
    accessor _wordsClues!: WordClue[]

    @state()
    accessor _cwContext: CwContext = {across: null, clue: null}

    /**
     * Current row
     */
    @state()
    accessor cur_row!: number

    /**
     * Current column
     */
    @state()
    accessor cur_col!: number

    /** What the current grid element was built from; the grid is rebuilt only when one of these changes. */
    private builtFor: { wordsClues: WordClue[]; type: string; locale: string } | null = null;

    private readonly msg = widgetMsg(this);

    /** Find the words: the cell a word starts at (keyboard or pointer), the line drawn from it and the pointer that drags it. */
    private ftwAnchor: HTMLElement | null = null;
    private ftwLine: SVGLineElement | null = null;
    private ftwPointer: number | null = null;
    private statusEl: HTMLElement | null = null;

    /** Find the words: the words the reader has found since the grid was built, by place and direction. */
    private ftwFound = new Set<string>();

    /** Reports the reader's progress to the widget when letters or the grid change. */
    private readonly progressObserver = new MutationObserver(() => this.reportProgress());
    private reportedProgress = 0;

    private composingCell: HTMLDivElement | null = null;
    private skipCompositionInput: { cell: HTMLDivElement; data: string } | null = null;

    connectedCallback() {
        super.connectedCallback();
        this.progressObserver.observe(this.renderRoot, { childList: true, characterData: true, subtree: true });
    }

    disconnectedCallback() {
        this.progressObserver.disconnect();
        super.disconnectedCallback();
    }

    /** The share of the puzzle that is solved: matching letters in a crossword, found words in find the words. */
    private measureProgress(): number {
        if(this.parentComponent.type === "find-the-words") {
            const total = this._wordsClues.filter(word => word.x != null && word.y != null).length
            return total ? Math.min(1, this.ftwFound.size / total) : 0
        }
        let total = 0, right = 0
        for(const cell of this.gridEl?.querySelectorAll<HTMLElement>('.cell[answer="true"]') ?? []) {
            const expected = this.grid[Number(cell.getAttribute("grid-row"))]?.[Number(cell.getAttribute("grid-col"))]?.answer
            if(!expected) continue
            total++
            const letter = cell.querySelector(".cell-letter")?.textContent?.trim()
            if(letter && sameGrapheme(letter, expected, this.locale)) right++
        }
        return total ? right / total : 0
    }

    private reportProgress() {
        const progress = this.measureProgress()
        if(progress === this.reportedProgress) return
        this.reportedProgress = progress
        this.dispatchEvent(new CustomEvent("set-progress", { bubbles: true, composed: true, detail: progress }))
    }

    /** Empties the letters the reader entered in a crossword, or the words the reader found in find the words. */
    clearAnswers() {
        if(!this.gridEl) return
        if(this.parentComponent.type === "find-the-words") {
            this.ftwFound.clear()
            this.gridEl.querySelectorAll("[correct]").forEach(cell => cell.removeAttribute("correct"))
            if(this.statusEl) this.statusEl.textContent = ""
        }
        else {
            for(const cell of this.gridEl.querySelectorAll<HTMLElement>('.cell[answer="true"]')) {
                cell.removeAttribute("correct")
                cell.removeAttribute("incorrect")
                const letter = cell.querySelector(".cell-letter")
                if(letter) letter.textContent = ""
            }
        }
        this.reportProgress()
    }

    private get locale(): string {
        const language = this.parentComponent.lang || document.documentElement.lang || "en";
        try {
            return Intl.getCanonicalLocales(language)[0] ?? "en";
        } catch {
            return "en";
        }
    }


    // TODO Add event listener for adding the focus class based on the clue number and direction


    /** 
     * For handling a keypress in the crossword grid. Goes to next relevant cell
     * 
    */
    private nextEmptyCell(e?: Event) {
        // Idk how to get typescript to stop crying about this even though it works
        let currentCell: HTMLDivElement
        if(e == null) {
            currentCell = this.getCellDOM(this.cur_row, this.cur_col)
        }
        else {
            currentCell = e.target as HTMLDivElement
        }

        let nextWord: WordClue | null
        let nextCell: HTMLDivElement
        let row = (Number(currentCell.getAttribute("grid-row")))
        let col = (Number(currentCell.getAttribute("grid-col")))
        let init_row = (Number(currentCell.getAttribute("grid-row")))
        let init_col = (Number(currentCell.getAttribute("grid-col")))

        let timeoutLimit = 0
        for(let wordClue of this._wordsClues) {
            timeoutLimit += wordGraphemes(wordClue.word, this.locale).length
        }
        timeoutLimit = timeoutLimit * 10

        let {across: acrossContext, clue: clueContext} =  this.getContextFromCell(row, col)

        if(this._cwContext.across != null) {
            acrossContext = this._cwContext.across
        }
        if(this._cwContext.clue != null) {
            clueContext = this._cwContext.clue
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
            if(this._wordsClues.length > 1) {
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
                nextWord = this._wordsClues[iNextW]
                row = nextWord.x!
                col = nextWord.y!
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
                clueContext = nextWord.clueNumber ?? null
                acrossContext = nextWord.across ?? null
            }

            timeout += 1
            if(timeout >= timeoutLimit) {
                throw new Error("You've created an infinite loop, congratulations")
            }
        } while(pass < 2 && nextCell.querySelector(".cell-letter")!.textContent !== "")

        if(nextCell.querySelector(".cell-letter")!.textContent == "") {
            nextCell.focus()
            this.cur_col = Number(nextCell.getAttribute("grid-row"))
            this.cur_row = Number(nextCell.getAttribute("grid-col"))
            // Update context only if another word was chosen
            if(nextWord) {
                this.setContext(this._cwContext)
            }
        }
        else {
            // Blur if there are no empty cells
            currentCell.blur()
            this.setContext({across: null, clue: null})
        }
    }

         /**
         * Dispatches an event to change the current clue and direction context.
         * 
         * @param {number} clue the updated clue number
         * @param {boolean} across whether the updated direction is across
         */
    setContext(context: CwContext): void {
        let setContext = new CustomEvent("set-context", {bubbles: true, composed: true, detail: context})
        this.dispatchEvent(setContext)
    }


    getContextFromCell(row: number, col: number): CwContext {
        let cell = this.getCellDOM(row, col)
        let across: boolean | null
        let clue

        if(this._cwContext == null) {
            across = (cell.getAttribute("direction") == "across" || cell.getAttribute("direction") == "both")
        }
        else {
            if(cell.getAttribute("direction") == "both") {
                across = this._cwContext.across
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
    private getClueNumber(across: boolean | null, x: number, y: number): number | null {
            let shift_row = across ? 0 : 1
            let shift_col = 1 - shift_row

            while((x-shift_row >= 0 && y-shift_col >= 0) && this.grid[x-shift_row][y-shift_col].white) {
                x -= shift_row
                y -= shift_col
            }

            return this.grid[x][y].number ?? null
        }

    /**
     * Method for checking the answers.
     */
    checkAnswers(grid: Cell[][], gridDOM: HTMLDivElement) {
        let cellDOM: HTMLDivElement
        let cellDOMContents: HTMLDivElement | null

        for(let i = 0; i < grid.length; i++) {
            for(let j = 0; j < grid.length; j++) {
                cellDOM = this.getCellDOM(i, j, gridDOM)
                cellDOMContents = (this.getCellDOM(i, j, gridDOM)).querySelector(".cell-letter")
                if(cellDOMContents) {
                    if(cellDOMContents.innerText == grid[i][j].answer) {
                        cellDOM.setAttribute("correct", "")
                    }
                    else if(cellDOMContents.innerText != "" && grid[i][j].answer) {
                        cellDOM.setAttribute("incorrect", "")
                    }
                }
            }
        }
        setTimeout(() => { this.removeCellHighlighting(gridDOM); }, 5000);
    }

    private removeCellHighlighting(gridDOM: HTMLDivElement) {
        for(let cell of gridDOM.querySelectorAll("[correct]")) {
            cell.removeAttribute("correct")
        }
    }

    /** Function for getting a cell based on its location in the DOM grid.
     * 
     * @param {number} row the row number, 1-indexed
     * @param {number} col the column number, 1-indexed
     * @returns {HTMLDivElement} the DOM element of the cell
    */
    private getCellDOM(row: number, col: number, gridDOM?: HTMLDivElement): HTMLDivElement {
        if(gridDOM) {
            return gridDOM.querySelector<HTMLDivElement>('[grid-row="'+ row + '"][grid-col="' + col + '"]')!
        }
        return this.gridEl.querySelector<HTMLDivElement>('[grid-row="'+ row + '"][grid-col="' + col + '"]')!
    }

    /** Function for getting the next word in context of the direction and current clue number.
     * Returns the empty cell element at the next word
     * 
     * @returns {HTMLDivElement} the DOM element of the cell
    */
   // May not need the arguments lol
    private getNextWordIndex(across: boolean | null, clue: number | null): number {
        if(this._wordsClues.length == 1) {
            return 0
        }
            let i = this._wordsClues.findIndex(wordClue => wordClue.clueNumber == clue && wordClue.across == across)
            i += 1
            if(i >= this._wordsClues.length) {
                i = this._wordsClues.findIndex(wordClue => wordClue.across == !across)
            }
        return i
    }

    /** The word before the current one, wrapping to the last word. */
    private getPreviousWordIndex(across: boolean | null, clue: number | null): number {
        const count = this._wordsClues.length
        if(count <= 1) return 0
        const i = this._wordsClues.findIndex(wordClue => wordClue.clueNumber == clue && wordClue.across == across)
        return i <= 0 ? count - 1 : i - 1
    }

    /** Moves focus from the grid to the first control after it, so that the grid never traps the keyboard. */
    private leaveGrid(cell: HTMLElement) {
        const buttons = this.parentComponent.shadowRoot?.querySelectorAll<HTMLElement>("#answer-check, #edit-words") ?? []
        const next = Array.from(buttons).find(button => button.checkVisibility())
        if(next) next.focus()
        else cell.blur()
    }

    /** Focuses the cell a keyboard user starts from. */
    focusFirstCell(options?: FocusOptions) {
        this.gridEl?.querySelector<HTMLElement>('.cell[tabindex="0"], .cell[contenteditable="true"]')?.focus(options)
    }

    /**
     * Constructor for the cells of the {@link WebwriterWordPuzzle.gridEl | grid} DOM element.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @param {number} x the row of the cell, 0-indexed
     * @param {number} y the column of the cell, 0-indexed
     * @returns {HTMLDivElement} the DOM element for the cell
     */
    protected newCellDOM(document: Document, x: number, y: number, letter: string, fillerGraphemes: string[] = []) {
        const cellDOM = newCellDOM(document, this.grid, this.parentComponent.type, x, y, letter, fillerGraphemes)
        const place = { row: x + 1, column: y + 1 }
        if(this.parentComponent.type == "find-the-words") {
            cellDOM.tabIndex = -1
            cellDOM.setAttribute("role", "button")
            const shown = cellDOM.querySelector(".cell-letter")?.textContent ?? ""
            cellDOM.setAttribute("aria-label", this.msg(str`${shown}, row ${place.row}, column ${place.column}`))
            cellDOM.setAttribute("aria-describedby", "help")
        }
        else if(cellDOM.getAttribute("answer") == "true") {
            cellDOM.setAttribute("role", "textbox")
            cellDOM.setAttribute("aria-label", this.msg(str`Row ${place.row}, column ${place.column}`))
            cellDOM.setAttribute("aria-describedby", "help")
        }
        cellDOM.addEventListener('keydown', (e) => { this.cellKeydownHandler(e) });
        cellDOM.addEventListener('focusin', (e: FocusEvent) => {this.cellFocusHandler(e)});
        cellDOM.addEventListener('beforeinput', (e: InputEvent) => { this.cellBeforeInputHandler(e) });
        cellDOM.addEventListener('compositionstart', (e: CompositionEvent) => { this.cellCompositionStartHandler(e) });
        cellDOM.addEventListener('compositionend', (e: CompositionEvent) => { this.cellCompositionEndHandler(e) });

        return cellDOM
    }

    /**
     * Event listener for a cellDOM element that handles keypresses. 
     * 
     * Tab switches to the next word, space changes context for direction, and
     * if the key was an alphabetic character, replaces text currently in the cell
     * with whatever was pressed and calls nextEmptyCell().
     * Arrow key navigation is also possible.
     * 
     * Overrides / prevents the default character insertion
     */
    private cellKeydownHandler(e: KeyboardEvent) {
        if (e.isComposing || e.keyCode === 229 || this.composingCell) {
            e.stopPropagation();
            return;
        }
        e.stopPropagation();
        if(this.parentComponent.type == "find-the-words") {
            this.ftwKeydown(e)
            return
        }
        // Shortcuts of the browser and the system keep working; Alt with Ctrl is AltGr on some keyboards.
        if ((e.ctrlKey && !e.altKey) || e.metaKey) return;
        let cell = e.target as HTMLDivElement
        let nextCell: HTMLDivElement

        // For arrow keys
        let row = Number(cell.getAttribute("grid-row"))
        let col = Number(cell.getAttribute("grid-col"))

        switch(e.key) {
            // Go to the next (Shift: previous) clue
            case "Tab": {
                const index = e.shiftKey
                    ? this.getPreviousWordIndex(this._cwContext.across, this._cwContext.clue)
                    : this.getNextWordIndex(this._cwContext.across, this._cwContext.clue)
                const word = this._wordsClues[index]
                if(word?.x == null || word.y == null) break;
                e.preventDefault()
                this.setContext(this._cwContext)
                this.getCellDOM(word.x, word.y).focus()
                break;
            }
            // Change direction context if the current cell goes in both directions
            case " ":
                e.preventDefault()
                if(cell.getAttribute("direction") == "both") {
                    this.setContext({across: this._cwContext.across, clue: this.getClueNumber(this._cwContext.across, Number(cell.getAttribute("grid-row")), Number(cell.getAttribute("grid-col")))})
                }
                break;
            // Leave the grid
            case "Escape":
                e.preventDefault()
                this.leaveGrid(cell)
                break;
            // NAVIGATION ========================================================
            case "ArrowLeft":
                e.preventDefault()
                col -= 1
                if(col >= 0 && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "ArrowRight":
                e.preventDefault()
                col += 1
                if(col < this.grid.length && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "ArrowUp":
                e.preventDefault()
                row -= 1
                if(row >= 0 && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "ArrowDown":
                e.preventDefault()
                row += 1
                if(row < this.grid.length && this.grid[row][col].white) {
                    nextCell = this.getCellDOM(row, col)
                    nextCell.focus()
                }
                break;
            case "Backspace":
            case "Delete":
                e.preventDefault()
                const letter = cell.querySelector('.cell-letter')
                if(letter) letter.textContent = ""
                break;
            // Insert character
            default:
                // Named keys (Shift, F5, Dead, ...) are not letters; Enter must not break the cell into lines.
                if(e.key.length > 1 && /^[A-Za-z][A-Za-z0-9]+$/.test(e.key)) {
                    if(e.key == "Enter") e.preventDefault()
                    break;
                }
                e.preventDefault()
                this.commitCellText(e.key, cell);
        }
    }

    /** Find the words by keyboard: arrows move, Enter or Space marks the first letter and then the last letter of a word. */
    private ftwKeydown(e: KeyboardEvent) {
        if ((e.ctrlKey && !e.altKey) || e.metaKey) return;
        const cell = (e.target as HTMLElement).closest<HTMLElement>(".cell")
        if(!cell) return
        const row = Number(cell.getAttribute("grid-row"))
        const col = Number(cell.getAttribute("grid-col"))
        const step = { ArrowLeft: [0, -1], ArrowRight: [0, 1], ArrowUp: [-1, 0], ArrowDown: [1, 0] }[e.key]
        if(step) {
            e.preventDefault()
            const next = this.getCellDOM(row + step[0], col + step[1])
            if(!next) return
            next.focus()
            if(this.ftwAnchor) {
                const point = this.ftwCenter(next)
                this.ftwMove(point.x, point.y)
            }
        }
        else if(e.key == "Enter" || e.key == " ") {
            e.preventDefault()
            if(this.ftwAnchor) this.ftwFinish(cell)
            else {
                const point = this.ftwCenter(cell)
                this.ftwBegin(cell, point.x, point.y)
                cell.setAttribute("anchor", "")
            }
        }
        else if(e.key == "Escape") {
            e.preventDefault()
            if(this.ftwAnchor) this.ftwClear()
            else this.leaveGrid(cell)
        }
    }

    /**
     * Handles text input on Chrome on Android, where keydown does not work correctly.
     * See https://stackoverflow.com/questions/36753548/keycode-on-android-is-always-229
     */
    private cellBeforeInputHandler(e: InputEvent) {
        const cell = e.currentTarget as HTMLDivElement;
        if (e.inputType === "insertFromComposition") {
            e.preventDefault();
            return;
        }
        // Paste, drop and deletions must not change the markup of the cell; paste and drop supply a letter, deletions empty the letter.
        if (e.inputType === "insertFromPaste" || e.inputType === "insertFromDrop") {
            e.preventDefault();
            this.commitCellText(e.dataTransfer?.getData("text/plain") ?? "", cell);
            return;
        }
        if (e.inputType.startsWith("delete") && !e.isComposing && this.composingCell !== cell) {
            e.preventDefault();
            const letter = cell.querySelector(".cell-letter");
            if (letter) letter.textContent = "";
            return;
        }
        if (e.inputType !== "insertText") {
            // Undo, redo, line breaks and other edits would change the markup of the cell.
            if (!e.isComposing && this.composingCell !== cell) e.preventDefault();
            return;
        }
        if (!e.data) return;
        // Let the browser/IME own intermediate composition text. It is reduced
        // to one grapheme once compositionend fires.
        if (e.isComposing || this.composingCell === cell) return;
        if (this.skipCompositionInput?.cell === cell && this.skipCompositionInput.data === e.data) {
            e.preventDefault();
            this.skipCompositionInput = null;
            return;
        }
        e.preventDefault();
        this.commitCellText(e.data, cell);
    }

    private cellCompositionStartHandler(e: CompositionEvent): void {
        this.composingCell = e.currentTarget as HTMLDivElement;
        e.stopPropagation();
    }

    private cellCompositionEndHandler(e: CompositionEvent): void {
        const cell = e.currentTarget as HTMLDivElement;
        if (this.composingCell === cell) this.composingCell = null;
        const committedText = e.data || cell.querySelector(".cell-letter")?.textContent || "";
        this.skipCompositionInput = { cell, data: committedText };
        setTimeout(() => {
            if (this.skipCompositionInput?.cell === cell && this.skipCompositionInput.data === committedText) {
                this.skipCompositionInput = null;
            }
        }, 0);
        this.commitCellText(committedText, cell);
    }

    private commitCellText(text: string, cell: HTMLDivElement): void {
        const grapheme = firstLetterGrapheme(text, this.locale);
        if (!grapheme) return;
        const letterCell = cell.querySelector(".cell-letter");
        if (!letterCell) return;
        letterCell.textContent = displayGrapheme(grapheme, this.locale);
        cell.removeAttribute("incorrect");
        // Composition may have inserted a text node directly into the editable cell.
        for (const node of Array.from(cell.childNodes)) {
            if (node.nodeType === Node.TEXT_NODE) node.remove();
        }
        this.nextEmptyCell({ target: cell } as unknown as Event);
    }

    /** Handler for when a cell gains focus. Sets the clue and direction context
     * 
     * @param {FocusEvent} e - the event. Its target attribute is used
    */
    private cellFocusHandler(e: FocusEvent) {
        const cell = e.target as HTMLDivElement;
        if(this.parentComponent.type == "find-the-words") {
            // One tab stop for the grid; the arrow keys move it.
            this.gridEl.querySelector('.cell[tabindex="0"]')?.setAttribute("tabindex", "-1")
            cell.setAttribute("tabindex", "0")
            return
        }
        this.cur_row = Number(cell.getAttribute("grid-row"))
        this.cur_col = Number(cell.getAttribute("grid-col"))

        // Ensure current context isn't null
        let {across: acrossContext, clue: clueContext} =  this.getContextFromCell(this.cur_row, this.cur_col)

        this._cwContext.across = acrossContext
        this._cwContext.clue = clueContext
        this.setContext(this._cwContext)
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
        let {wordsAndClues, grid} = generateCrossword(wordsCluesInput, this.locale)
        this.setWordsClues(wordsAndClues)
        this.grid = grid

        this.newCrosswordGridDOM(document)

        return wordsAndClues
    }

    // TODO Implement answer checking
    // It should compare the text content of the cell with the answer in this.grid

     /**
     * Build / construct the {@link WebwriterWordPuzzle.gridEl | grid} DOM element that will contain the words and clues
     *
     * Dimensions are based on {@link this.grid | grid}.
     *
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLDivElement} the DOM element for the grid.
     * Source: crosswords-js
     */
    newCrosswordGridDOM(document: Document) {
        const findTheWords = this.parentComponent.type === "find-the-words"
        let gridEl = document.createElement('div');
        this.ftwFound.clear()
        gridEl.classList.add('grid')
        gridEl.dataset.type = this.parentComponent.type
        gridEl.style.setProperty("--n", String(this.grid.length))
        const fillerGraphemes = findTheWords
            ? getFillerGraphemes(this._wordsClues ?? [], this.locale)
            : [];
        for (let x = 0; x < this.grid.length; x += 1) {
            for (let y = 0; y < this.grid.length; y += 1) {
                //  Build the cell element and place cell in grid element
                gridEl.appendChild(this.newCellDOM(document, x, y, this.grid[x][y].answer ?? "", fillerGraphemes));
            }
        }

        const help = document.createElement("span")
        help.id = "help"
        help.className = "visually-hidden"
        help.textContent = findTheWords
            ? this.msg("Arrow keys move between letters. Enter or Space marks the first letter of a word and, after moving, its last letter. Escape cancels.")
            : this.msg("Type a letter to fill the cell. Arrow keys move, Space changes direction, Tab jumps to the next clue, Escape leaves the grid.")
        gridEl.appendChild(help)

        if(findTheWords) {
            gridEl.querySelector(".cell")?.setAttribute("tabindex", "0")

            const status = document.createElement("span")
            status.className = "visually-hidden"
            status.setAttribute("role", "status")
            gridEl.appendChild(status)
            this.statusEl = status

            // Create SVG element
            this.svgEl = document.createElementNS("http://www.w3.org/2000/svg", "svg");
            this.svgEl.setAttribute("id", "line-layer");
            this.svgEl.setAttribute("style", "position: absolute; top: 0; left: 0; width: 100%; height: 100%; pointer-events: none;");
            this.svgEl.setAttribute("aria-hidden", "true");

            // Append SVG to grid
            gridEl.appendChild(this.svgEl);

            // Dragging over the letters of a word with a mouse, a finger or a pen
            gridEl.addEventListener('pointerdown', (e) => this.ftwPointerDown(e));
            gridEl.addEventListener('pointermove', (e) => this.ftwPointerMove(e));
            gridEl.addEventListener('pointerup', (e) => this.ftwPointerUp(e));
            gridEl.addEventListener('pointercancel', (e) => this.ftwPointerCancel(e));
        }

        this.gridEl = gridEl
        this.requestUpdate()
        return this.gridEl
    }

    /** A point in the coordinates of the line layer. */
    private ftwPoint(clientX: number, clientY: number) {
        const rect = this.svgEl.getBoundingClientRect();
        return { x: clientX - rect.left, y: clientY - rect.top };
    }

    private ftwCenter(cell: HTMLElement) {
        const rect = cell.getBoundingClientRect();
        return this.ftwPoint(rect.left + rect.width / 2, rect.top + rect.height / 2);
    }

    private ftwCell(target: EventTarget | null) {
        return (target as Element | null)?.closest?.<HTMLElement>("[data-x]") ?? null;
    }

    /** Starts a word at a cell; the line follows the pointer or the keyboard cursor. */
    private ftwBegin(cell: HTMLElement | null, x: number, y: number) {
        this.ftwClear();
        this.ftwAnchor = cell ?? this.gridEl;

        const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
        line.setAttribute("x1", String(x));
        line.setAttribute("y1", String(y));
        line.setAttribute("x2", String(x));
        line.setAttribute("y2", String(y));
        line.setAttribute("stroke", "green");
        line.setAttribute("stroke-width", String(Math.round((cell?.offsetWidth || 42) * 0.6)));
        line.setAttribute("stroke-opacity", "0.5");
        line.setAttribute("stroke-linecap", "round");
        this.svgEl.appendChild(line);
        this.ftwLine = line;
    }

    private ftwMove(x: number, y: number) {
        this.ftwLine?.setAttribute("x2", String(x));
        this.ftwLine?.setAttribute("y2", String(y));
    }

    private ftwClear() {
        this.ftwLine?.remove();
        this.ftwLine = null;
        this.ftwAnchor?.removeAttribute("anchor");
        this.ftwAnchor = null;
        this.ftwPointer = null;
    }

    /** Ends a word at a cell: marks the word when it starts and ends where the puzzle's word does. */
    private ftwFinish(endEl: HTMLElement | null) {
        const startIndexX = parseInt(this.ftwAnchor?.getAttribute('data-x') ?? "", 10);
        const startIndexY = parseInt(this.ftwAnchor?.getAttribute('data-y') ?? "", 10);
        const endIndexX = parseInt(endEl?.getAttribute('data-x') ?? "", 10);
        const endIndexY = parseInt(endEl?.getAttribute('data-y') ?? "", 10);

        if (!isNaN(endIndexX) && !isNaN(endIndexY)) {
            // The user could draw from the end of the word to its start; words are horizontal or vertical,
            // so the smaller and the larger coordinates give start and end. X is the row, Y the column.
            const startWordIndexX = Math.min(startIndexX, endIndexX)
            const startWordIndexY = Math.min(startIndexY, endIndexY)
            const endWordIndexX = Math.max(startIndexX, endIndexX)
            const endWordIndexY = Math.max(startIndexY, endIndexY)

            const word = this._wordsClues.find((w) => {
                if(w.x != startWordIndexX || w.y != startWordIndexY) {
                    return false;
                }
                if(w.across) {
                    return w.x == endWordIndexX && w.y + wordGraphemes(w.word, this.locale).length - 1 == endWordIndexY
                }else {
                    return w.x + wordGraphemes(w.word, this.locale).length - 1 == endWordIndexX && w.y == endWordIndexY
                }
            })

            if(word) {
                for(let i = 0; i < wordGraphemes(word.word, this.locale).length; i++) {
                    const cellDOM = word.across ? this.getCellDOM(word.x!, word.y! + i, this.gridEl) : this.getCellDOM(word.x! + i, word.y!, this.gridEl)
                    cellDOM.setAttribute("correct", "")
                }
                this.ftwFound.add(`${word.x},${word.y},${word.across ? 1 : 0}`)
                this.reportProgress()
                // Highlight the word in the words table
                this.setContext({across: word.across ?? null, clue: this.getClueNumber(word.across ?? null, word.x!, word.y!)})
                if(this.statusEl) this.statusEl.textContent = this.msg(str`Found: ${word.word}`)
            }
        }
        this.ftwClear();
    }

    private ftwPointerDown(e: PointerEvent) {
        if(e.pointerType == "mouse" && e.button !== 0) return;
        try { this.gridEl.setPointerCapture(e.pointerId); } catch { /* a pointer that is already gone cannot be captured */ }
        const point = this.ftwPoint(e.clientX, e.clientY);
        this.ftwBegin(this.ftwCell(e.target), point.x, point.y);
        this.ftwPointer = e.pointerId;
    }

    private ftwPointerMove(e: PointerEvent) {
        if(this.ftwPointer !== e.pointerId) return;
        const point = this.ftwPoint(e.clientX, e.clientY);
        this.ftwMove(point.x, point.y);
    }

    private ftwPointerUp(e: PointerEvent) {
        if(this.ftwPointer !== e.pointerId) return;
        this.ftwFinish(this.ftwCell(this.shadowRoot?.elementFromPoint(e.clientX, e.clientY) ?? null));
    }

    private ftwPointerCancel(e: PointerEvent) {
        if(this.ftwPointer === e.pointerId) this.ftwClear();
    }

    render() {
        const { type } = this.parentComponent, locale = this.locale
        const built = this.builtFor
        if(built && built.wordsClues === this._wordsClues && built.type === type && built.locale === locale) {
            return html`${this.gridEl}`
        }
        this.builtFor = { wordsClues: this._wordsClues, type, locale }
        this.grid = generateCrosswordFromList(this._wordsClues, locale)
        this.newCrosswordGridDOM(document)
        return (html`${this.gridEl}`)
    }

}
