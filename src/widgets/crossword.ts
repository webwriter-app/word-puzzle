/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crosswords
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, css } from 'lit';
import { LitElementWw, option } from '@webwriter/lit';
import { customElement, property, query, state } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { WebwriterWordPuzzlesCrosswordGrid, WordClue, defaultCell } from './crossword-grid';
import { WebwriterWordPuzzlesCrosswordCluebox } from './crossword-cluebox';


// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon } from '@shoelace-style/shoelace';


declare global {interface HTMLElementTagNameMap {
        "webwriter-word-puzzles": WebwriterWordPuzzles;
        "webwriter-word-puzzles-crossword": WebwriterWordPuzzlesCrossword;
        "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid;
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox;
    }
}

//export function stopCtrlPropagation(event: KeyboardEvent): void {
//        if (event.ctrlKey) {
//            event.stopPropagation()
//            DEV: console.log("Prevented propagation of a single CTRL key sequence within widget")
//        }
//    }


// NOTE Almost all methods within this class are from / based on the crosswords-js module


/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles  }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword")
export class WebwriterWordPuzzlesCrossword extends WebwriterWordPuzzles {
    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newCrosswordGrid | newCrosswordGrid()}
     */
    @query('webwriter-word-puzzles-crossword-grid')
    private gridWidget: WebwriterWordPuzzlesCrosswordGrid

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @query('webwriter-word-puzzles-crossword-cluebox')
    private clueWidget: WebwriterWordPuzzlesCrosswordCluebox

    /**
     * Current context; direction. true = across, false = down.
     */
    @state()
    acrossContext: boolean = true // @type {boolean}

    /**
     * Current context; clue number.
     */
    @state()
    currentClue!: number // @type {boolean}

    /**
     * @constructor
     * Constructor for the crossword puzzle
     * 
     * Sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     * Dispatches an event to generate the crossword grid
     */
    constructor(dimension: number = 8) {
        super()
        this.gridWidget = new WebwriterWordPuzzlesCrosswordGrid
        this.gridWidget.grid = Array.from({ length: dimension}, () => Array(dimension).fill(defaultCell()))
        this.gridWidget.newCrosswordGridDOM(document)
        this.clueWidget = new WebwriterWordPuzzlesCrosswordCluebox
        this.clueWidget.newClueBoxInput(document)
        this.clueWidget.clueBox = this.clueWidget.newClueBox(this.clueWidget.wordsAndClues as WordClue[])

        this.addEventListener("generateCw", () => {
            DEV: console.log("generateCw triggered")
            this.clueWidget.wordsAndClues = this.gridWidget.generateCrossword(this.clueWidget.wordsAndClues)
            this.clueWidget.clueBox = this.clueWidget.newClueBox(this.clueWidget.wordsAndClues as WordClue[])
        })
        this.addEventListener("set-context", (e: CustomEvent) => {
            DEV: console.log("set-context triggered")
            DEV: console.log("Current clue:" + e.detail.clue)
            if(e.detail.acrossContext)
                DEV: console.log("Current direction: across")
            else
                DEV: console.log("Current direction: down")
            this.currentClue = e.detail.clue
            this.acrossContext = e.detail.acrossContext
            this.gridWidget.currentClue = this.currentClue
            this.clueWidget.currentClue = this.currentClue
            this.gridWidget.acrossContext = this.acrossContext
            this.clueWidget.acrossContext = this.acrossContext
        })

        this.toggleDirection = this.toggleDirection.bind(this)
    }
    /**
     * Styles
     * 
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
                flex-wrap: wrap;
            }
            `
    }

    // Registering custom elements
    static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid,
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox,
        };
    }

    toggleDirection(): void {
        this.acrossContext = !this.acrossContext
        this.gridWidget.acrossContext = this.acrossContext
        this.clueWidget.acrossContext = this.acrossContext
        DEV: console.log("Direction toggled")
    }

    setCurrentClue(clue: number): void {
        this.currentClue = clue
    }

    /**
     * Generates crossword puzzle based off of words in the clue box and 
     * writes it to the DOM.
     * 
     * Based off of Agarwal and Joshi 2020
     */
    protected generateCrossword() {
        // Initialization
        let wordsAndClues = this.clueWidget.getNewWords()
        let wordsOG: string[] = []
        for(let wordAndClue of wordsAndClues) {
            wordsOG.push(wordAndClue.word)
        }

        this.clueWidget.wordsAndClues = this.gridWidget.generateCrossword(wordsAndClues)
//        this.clueWidget.generateClueBox(wordsAndClues as WordClue[])
    }


    render() {
        return (html`<div class="wrapper">
                ${this.clueWidget}
                ${this.gridWidget}
            </div>
            `)
    }
}

