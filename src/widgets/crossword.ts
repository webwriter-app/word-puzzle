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
import { SlButton, SlIcon, SlAlert, SlDrawer } from '@shoelace-style/shoelace';


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
export class WebwriterWordPuzzlesCrossword extends LitElementWw {

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

        this.setWordsCluesChildren(this._wordsAndClues)

        this.addEventListener("generateCw", () => {
            DEV: console.log("generateCw triggered")
            this.clueWidget._wordsAndClues = this.gridWidget.generateCrossword(this.clueWidget._wordsAndClues)
            this.clueWidget.requestUpdate()
        })
        this.addEventListener("set-context", (e: CustomEvent) => {
            if(e.detail.acrossContext)
                DEV: console.log("set-context: across, clue " + e.detail.clue)
            else
                DEV: console.log("set-context: down, clue " + e.detail.clue)
            this._crosswordContext = e.detail
            this.gridWidget._crosswordContext = this._crosswordContext
            this.clueWidget._crosswordContext = this._crosswordContext
            this.clueWidget.highlightContext(this._crosswordContext)
        })
        this.addEventListener("set-words-clues", (e: CustomEvent) => this.setWordsCluesChildren(e.detail))
    }
/**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({ type: Array, attribute: true, reflect: true})
    accessor _wordsAndClues: WordClue[]


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
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false})
    _crosswordContext: CrosswordContext


    setWordsCluesChildren(wordsClues: WordClue[]) {
        DEV: console.log("Setting words and clues in children.")
        this._wordsAndClues = wordsClues
        this.gridWidget._wordsAndClues = wordsClues
        this.clueWidget._wordsAndClues = wordsClues
        DEV: console.log("this._wordsAndClues:")
        DEV: console.log(this._wordsAndClues)
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
                min-height: 300px;
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
        this.gridWidget.generateCrossword(this._wordsAndClues)
    }

    onPreviewToggle(newValue: boolean, oldValue: boolean): boolean {
        if(newValue != oldValue) {
            this.gridWidget._preview = newValue
            this.clueWidget._preview = newValue
        }
        return newValue != oldValue
    }


    render() {
        // this.isContentEditable gives inconsistent results; it's undefined sometimes, 
        // so the attribute contenteditable is checked directly
        if(!this.hasAttribute("contenteditable")) {
            DEV: console.log("Preview mode on")
            this.clueWidget._preview = true
            this.clueWidget.onPreviewToggle(true)
        }
        else {
            DEV: console.log("Preview mode off")
            this.clueWidget._preview = false
            this.clueWidget.onPreviewToggle(false)
        }

        this.setWordsCluesChildren(this._wordsAndClues)
        return (html`<div class="wrapper">
                ${this.gridWidget}
                ${this.clueWidget}
            </div>
            `)
    }
}
