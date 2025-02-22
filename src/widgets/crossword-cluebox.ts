/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crosswords
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, css } from 'lit';
import { customElement, property, state } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { PlacedWord } from './crossword-grid';


// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon } from '@shoelace-style/shoelace';

// Icons
import plus from 'bootstrap-icons/icons/plus-lg.svg';
import minus from 'bootstrap-icons/icons/dash.svg';
import wand from 'bootstrap-icons/icons/magic.svg';

declare global {interface HTMLElementTagNameMap {
    "webwriter-word-puzzles": WebwriterWordPuzzles;
    "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox;
  }
}



export interface WordClue {
    word: string,
    clue: string,
    direction: string,
    number: number
}

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword-cluebox")
export class WebwriterWordPuzzlesCrosswordCluebox extends WebwriterWordPuzzles {
    // All methods have the same names as in crosswords-js

    /**
     * The input element for the words and clues of the crossword puzzle. 
     * 
     * It's intended exclusively for use by crossword creators (i.e. teachers).
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @property({ type: HTMLDivElement, state: true, attribute: false})
    clueBoxInput: HTMLTableElement

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * This one is intended for the crossword solver (i.e. student).
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @property({ type: HTMLDivElement, state: true, attribute: false})
    clueBox: HTMLTableElement

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    wordList: string[]

    // TODO COMBINE WORDS AND CLUES AND PLACEDWORDS DATA STRUCTURE
    
    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    wordsAndClues: Partial<WordClue>[]


    /**
     * The words placed. Returned by {@link WebwriterWordPuzzlesCrosswordGrid.generateCrossword}
     * 
     * Contains coordinate information
     */
    placedWords: PlacedWord[]

    /**
     * Whether the current direction is across or down.
     * true if across, false if down
     */
    @property({ type: Boolean, state: true, attribute: false})
    currentDirectionAcross: boolean

    /**
     * The clue the current selection corresponds to.
     */
    @property({ type: Boolean, state: true, attribute: false})
    currentClue: boolean

    /**
     * @constructor
     * Some constructor I apparently thought was a good idea.
     * 
     * Pretty much just sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     */
    constructor() {
        super()
        this.clueBoxInput = this.newClueBoxInput(document)
        this.clueBoxInput.addEventListener("keydown", this.ctrlHandler.bind(this))
        this.wordList = []
        this.wordsAndClues = []
    }

    static get styles() {
            // :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
            //     display: none;
            // }
        return css`
            table.clueboxInput {
                // Temporary width and height
               // min-width: 200px;
                width: 100%;
                min-height: 200px;
                height: fit-content;
                border: 2px solid var(--sl-color-gray-300);
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                background-color: var(--sl-color-gray-100);
                //flex-basis: content;
            }
            .word-column {
                // Temporary width and height
                width: 100px;
                min-height: 200px;
                height: fit-content;
                border: 2px solid var(--sl-color-gray-300);
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                background-color: var(--sl-color-gray-100);
                //flex-basis: content;
            }
            .clue-column {
                // Temporary width and height
                width: 300px;
                min-height: 200px;
                height: fit-content;
                border: 2px solid var(--sl-color-gray-300);
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                background-color: var(--sl-color-gray-100);
                //flex-basis: content;
            }
            table.clueboxInput > thead {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                background-color: var(--sl-color-gray-300);
            }
            table.clueboxInput > thead > tr {
                padding: 0px;
                margin: 0px;
            }
            table.clueboxInput th {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-700);
                border-collapse: collapse;
                background-color: var(--sl-color-gray-300);
                padding: 10px;
            } 
            table.clueboxInput tr.generateCw {
                text-align: right;
                margin: 1px;
                height: 20px;
            }
            table.clueboxInput th.generateCw {
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
            table.clueboxInput sl-icon.generateCwIcon {
                font-size: 20px;
                text-align: center;
                padding: 0px;
                justify-content: center;
                color: var(--sl-color-gray-400);
                align-content: center;
                vertical-align: middle;
            }
            table.clueboxInput > tbody {
//                max-width: 50%;
                border: 3px solid var(--sl-color-gray-200);
            }
            table.clueboxInput > tbody > tr {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-900);
                word-wrap: break-word;
                overflow-wrap: anywhere;
//                max-width: 50%;
            }
            table.clueboxInput > tbody > tr > td {
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
 //               max-width: 50%;
            }
            table.clueboxInput td {
                justify-content: left;
            }
            table.clueboxInput td[addRow] {
                justify-content: center;
                align-content: center;
                height: fit-content;
                padding: 0px;
                margin: 0px;
                text-align: center;
            }
            table.clueboxInput td[removeRow] {
                justify-content: center;
                align-content: center;
                text-align: center;
                padding: 5px;
            }
            table.clueboxInput sl-button {
                width: auto;
                height: auto;
                text-align: center;
                justify-content: center;
                align-content: center;
                vertical-align: middle;
            }
            table.clueboxInput sl-icon {
                size: 100px;
                font-size: 20px;
                text-align: center;
                padding: 10px;
                justify-content: center;
                color: var(--sl-color-gray-400);
                align-content: center;
                vertical-align: middle;
            }
            // ========================================================================
            table.cluebox {
                // Temporary width and height
                width: 200px;
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
            table.cluebox > tbody {
//                max-width: 50%;
                border: 3px solid var(--sl-color-gray-200);
            }
            table.cluebox > tbody > tr {
                font-family: var(--sl-font-sans);
                color: var(--sl-color-gray-900);
                word-wrap: break-word;
                overflow-wrap: anywhere;
                //max-width: 50%;
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
                width: 50%;
            }
            table.cluebox td {
                justify-content: left;
            }
            `
    }

    // Registering custom elements
    static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox,
        };
    }

    /**
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrosswordCluebox.clueBoxInput | clue panel} DOM element 
     * that will be used by a crossword creator (i.e. teacher) to add words and clues.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLTableElement} the DOM element for the clue panel
     * Source: crosswords-js
     */
    newClueBoxInput(document) {
        // Create table and header
        DEV: console.log("rendering cluebox");
        const clueBoxInput: HTMLTableElement = document.createElement('table')
        clueBoxInput.classList.add('clueboxInput')
        clueBoxInput.createTHead()
        clueBoxInput.tHead.insertRow()

        // Add headers
        const headers = ["Words", "Clues"]
        for (const element of headers) {
            const th: HTMLTableCellElement = document.createElement('th');
            th.textContent = element;
            clueBoxInput.tHead.rows[0].appendChild(th)
        }
        clueBoxInput.tHead.insertRow(0)
        const generateCwCell: HTMLTableCellElement = document.createElement('th');
        clueBoxInput.tHead.rows.item(0).appendChild(generateCwCell)
        clueBoxInput.tHead.rows.item(0).className = "generateCw"
        generateCwCell.className = "generateCw"
        generateCwCell.colSpan = 2

        const generateCwButton: SlButton = generateCwCell.appendChild(document.createElement('sl-button'))
        generateCwButton.className = "generateCwButton"
        generateCwButton.id = "generateCwButton"
        generateCwButton.setAttribute('variant', 'default')
        generateCwButton.setAttribute('size', 'small')
        generateCwButton.addEventListener('click', () => {
            this.wordsAndClues = this.getNewWords()
            if(this.wordsAndClues.length != 0) {
                const genClicked = new CustomEvent("generateCw", {bubbles: true, composed: true})
                this.dispatchEvent(genClicked)
            }
        })
        const generateCwIcon = generateCwButton.appendChild(document.createElement('sl-icon'))
        generateCwIcon.setAttribute('src', wand)
        generateCwIcon.setAttribute('class', "generateCwIcon")

        // Create body
        const bodyTable: HTMLTableSectionElement = clueBoxInput.createTBody()
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

        addRow()
        addRow()
        addRow()
        addRow()

        // Add button
        const addButton: HTMLButtonElement = addCell.appendChild(document.createElement('sl-button'))
        addButton.setAttribute('variant', 'default')
        addButton.setAttribute('size', 'medium')
        addButton.setAttribute('circle', '')
        addButton.classList.add('author-only')
        addButton.addEventListener('click', () => { addRow() })
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

        function addRow() {
            bodyTable.insertRow(buttonRow.rowIndex-2);
            bodyTable.rows[buttonRow.rowIndex-3].insertCell(0);
            bodyTable.rows[buttonRow.rowIndex-3].insertCell(1);
            bodyTable.rows[buttonRow.rowIndex-3].cells[0].setAttribute("contenteditable", "true");
            bodyTable.rows[buttonRow.rowIndex-3].cells[0].classList.add('word-column')
            bodyTable.rows[buttonRow.rowIndex-3].cells[1].setAttribute("contenteditable", "true");
            bodyTable.rows[buttonRow.rowIndex-3].cells[1].classList.add('clue-column')
        }

        return clueBoxInput
    }


    /**
     * Extracts the words from the cluebox
     * This works
     * 
     */
    getNewWords() {
        this.wordsAndClues = []
        const rows = this.clueBoxInput.querySelectorAll("tbody tr")

        let words: string[] = Array.from(rows).map(row => 
                row.querySelector("td")?.textContent?.trim() || null
        )

        let clues: string[] = Array.from(rows).map(row => 
                row.querySelectorAll("td")[1]?.textContent?.trim() || null
        )

        for (let i = 0; i < words.length; i++) {
            if(words[i] != null) {
                this.wordsAndClues.push({word: words[i], clue: clues[i]})
            }
        }
        DEV: console.log("Words and clues:")
        DEV: console.log(this.wordsAndClues)

        this.wordList = words.filter(x => x != null)

        return this.wordsAndClues
    }

    /**
     * @constructor
     * Build / construct the {@link WebwriterWordPuzzlesCrosswordCluebox.clueBox | clue panel} DOM element 
     * that will contain the clues for a puzzle solver (i.e. student) to solve.
     * 
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * @returns {HTMLTableElement} the DOM element for the clue panel
     * Source: crosswords-js
     */
    generateClueBox(wordsAndClues: WordClue[]) {
        DEV: console.log("Generating cluebox, in theory")
        let clueBox: HTMLTableElement = document.createElement('table')
        clueBox.classList.add('cluebox')
        let headerTable: HTMLTableSectionElement = clueBox.createTHead()
        let headerRow: HTMLTableRowElement = headerTable.insertRow()
        // Add headers
        let headers = ["Across", "Down"]
        for (let element of headers) {
            let th: HTMLTableCellElement = document.createElement('th');
            th.textContent = element;
            headerRow.appendChild(th)
        }

        DEV: console.log("rendering table body");
        // Create body
        let bodyTable: HTMLTableSectionElement = clueBox.createTBody()
        let lastInsArray: number[] = [-1, -1]
        bodyTable.insertRow()
        bodyTable.rows[0].insertCell()
        bodyTable.rows[0].insertCell()
        bodyTable.rows[0].cells[0].setAttribute('contenteditable', 'false')
        bodyTable.rows[0].cells[1].setAttribute('contenteditable', 'false')

        for(let wordAndClue of wordsAndClues) {
            let cellColumn = 0

            if(wordAndClue.direction == "across")
                cellColumn = 0
            else
                cellColumn = 1

            if(bodyTable.rows.length <= lastInsArray[cellColumn] + 1) {
                bodyTable.insertRow()
                bodyTable.rows[bodyTable.rows.length - 1].insertCell()
                bodyTable.rows[bodyTable.rows.length - 1].insertCell()
                bodyTable.rows[bodyTable.rows.length - 1].cells[0].setAttribute('contenteditable', 'false')
                bodyTable.rows[bodyTable.rows.length - 1].cells[1].setAttribute('contenteditable', 'false')
            }

            // NOTE idk if this is going to show anything useful
            if(bodyTable.rows[lastInsArray[cellColumn]+1].cells[cellColumn].innerHTML == "") {
                bodyTable.rows[lastInsArray[cellColumn]+1].cells[cellColumn].innerHTML = "<b>[" + wordAndClue.number + "]</b> "+ wordAndClue.clue
                lastInsArray[cellColumn] += 1
            }
        }

        this.clueBox = clueBox
        this.requestUpdate()
        return clueBox

//        function addRow(table: HTMLTableElement) {
//            table.insertRow()
//            table.rows[table.rows.length-1].insertCell()
//            table.rows[table.rows.length-1].insertCell()
//            table.rows[table.rows.length-1].cells[0].setAttribute('contenteditable', 'false')
//            table.rows[table.rows.length-1].cells[1].setAttribute('contenteditable', 'false')
//        }
    }

    /** Event handler for stopping control propagation and rendering
     * 
     */
    ctrlHandler(event: KeyboardEvent): void {
        if (event.ctrlKey && event.key === "Enter") {
            event.stopPropagation()
            DEV: console.log("Prevented propagation of a single CTRL key sequence within widget (cluebox)")
            this.getNewWords()
            if(this.wordsAndClues.length != 0) {
                const genCw = new CustomEvent("generateCw", {bubbles: true, composed: true})
                this.dispatchEvent(genCw)
            }
            DEV: console.log("This is supposed to generate the grid though")
        }
    }

    
    render() {
        DEV: console.log("rendering cluebox")
        if(this.wordsAndClues.length == 0) {
        return (html`<div>
                ${this.clueBoxInput}
            </div>
            `)
        }
        else {
        return (html`<div>
                ${this.clueBoxInput} ${this.clueBox}
            </div>
            `)

        }
    }

}
