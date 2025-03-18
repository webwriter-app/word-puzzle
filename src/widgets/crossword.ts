/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
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
import { SlButton, SlIcon, SlAlert, SlTooltip, SlDrawer } from '@shoelace-style/shoelace';


declare global {interface HTMLElementTagNameMap {
        "webwriter-word-puzzles": WebwriterWordPuzzles;
        "webwriter-word-puzzles-crossword": WebwriterWordPuzzlesCrossword;
        "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid;
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox;
        "sl-button": SlButton;
        "sl-drawer": SlDrawer;
    }
}


/**
 * Dispatches an event to update the current words and clues.
 * 
 * @param {number} clue the updated clue number
 */
export function setWordsClues(wordsClues: WordClue[]): void {
    let setWordsClues = new CustomEvent("set-words-clues", {bubbles: true, composed: true, detail: wordsClues})
    this.dispatchEvent(setWordsClues)
}


/**
 * Data type for the crossword context.
 * 
 * ```typescript
 * {
 *   across: boolean,
 *   clue: number
 * }
 * ```
 */
export interface CrosswordContext {
    across: boolean,
    clue: number
}

/**
     * Dispatches an event to change the current clue and direction context.
     * 
     * @param {number} clue the updated clue number
     * @param {boolean} across whether the updated direction is across
     */
export function setContext(context: CrosswordContext): void {
    let setContext = new CustomEvent("set-context", {bubbles: true, composed: true, detail: context})
    this.dispatchEvent(setContext)
}

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WebwriterWordPuzzles  }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword")
export class WebwriterWordPuzzlesCrossword extends WebwriterWordPuzzles {

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({ type: Array, state: true, attribute: true, reflect: true})
    wordsAndClues: WordClue[]


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

        this.addEventListener("generateCw", () => {
            DEV: console.log("generateCw triggered")
            this.clueWidget.wordsAndClues = this.gridWidget.generateCrossword(this.clueWidget.wordsAndClues)
            this.clueWidget.requestUpdate()
        })
        this.addEventListener("set-context", (e: CustomEvent) => {
            if(e.detail.acrossContext)
                DEV: console.log("set-context: across, clue " + e.detail.clue)
            else
                DEV: console.log("set-context: down, clue " + e.detail.clue)
            this.currentClue = e.detail.clue
            this.acrossContext = e.detail.acrossContext
            this.gridWidget.currentClue = this.currentClue
            this.clueWidget.currentClue = this.currentClue
            this.gridWidget.acrossContext = this.acrossContext
            this.clueWidget.acrossContext = this.acrossContext
        })
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
        "sl-alert": SlAlert,
        "sl-tooltip": SlTooltip,
        "sl-drawer": SlDrawer,
        "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid,
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox,
        };
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
                ${this.gridWidget}
                ${this.clueWidget}
            </div>
            `)
    }
}

