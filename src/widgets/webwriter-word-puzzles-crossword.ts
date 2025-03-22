/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, css, PropertyValues } from 'lit';
import { LitElementWw, option } from '@webwriter/lit';
import { customElement, property, query, state } from 'lit/decorators.js';

import { WebwriterWordPuzzles as WwWordPuzzles } from './webwriter-word-puzzles';
import { WwWordPuzzlesCwGrid, WordClue, defaultCell } from './ww-word-puzzles-cw-grid';
import { WwWordPuzzlesCwCluebox } from './ww-word-puzzles-cw-cluebox';

import { crossword_styles } from '../styles/styles'


// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon, SlAlert, SlDrawer } from '@shoelace-style/shoelace';


declare global {interface HTMLElementTagNameMap {
        "webwriter-word-puzzles": WwWordPuzzles;
        "webwriter-word-puzzles-crossword": WwWordPuzzlesCrossword;
        "ww-word-puzzles-cw-grid": WwWordPuzzlesCwGrid;
        "ww-word-puzzles-cw-cluebox": WwWordPuzzlesCwCluebox;
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
export interface CwContext {
    across: boolean,
    clue: number
}

/**
     * Dispatches an event to change the current clue and direction context.
     * 
     * @param {number} clue the updated clue number
     * @param {boolean} across whether the updated direction is across
     */
export function setContext(context: CwContext): void {
    let setContext = new CustomEvent("set-context", {bubbles: true, composed: true, detail: context})
    this.dispatchEvent(setContext)
}

/**
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WwWordPuzzles  }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@customElement("webwriter-word-puzzles-crossword")
export class WwWordPuzzlesCrossword extends WwWordPuzzles {

    /**
     * @constructor
     * Constructor for the crossword puzzle
     * 
     * Sets the {@link WwWordPuzzlesCrossword.width | width} and {@link WwWordPuzzlesCrossword.height | height} attributes
     * Dispatches an event to generate the crossword grid
     */
    constructor() {
        super()
        this.addEventListener("generateCw", this.generateCwHandler)
        this.addEventListener("set-context", (e: CustomEvent) => { this.setContextHandler(e) })
        this.addEventListener("set-words-clues", (e: CustomEvent) => this.setWordsCluesChildren(e.detail))
    }

    protected firstUpdated(_changedProperties: PropertyValues): void {
        //this.gridW = new WwWordPuzzlesCwGrid
        //this.clueW = new WwWordPuzzlesCwCluebox()

        //DEV: console.log("Within firstupdated, contenteditable is " + this.hasAttribute("contenteditable"))
        this.onPreviewToggle(this.hasAttribute("contenteditable"))
    }

    generateCwHandler() {
        DEV: console.log("generateCw triggered")
        this.clueW._wordsClues = this.gridW.generateCrossword(this.clueW._wordsClues)
        this.clueW.requestUpdate()
    }
    setContextHandler(e: CustomEvent) {
        if(e.detail.acrossContext)
            DEV: console.log("set-context: across, clue " + e.detail.clue)
        else
            DEV: console.log("set-context: down, clue " + e.detail.clue)
        this._cwContext = e.detail
        this.gridW._cwContext = this._cwContext
        this.clueW._cwContext = this._cwContext
        this.clueW.highlightContext(this._cwContext)
 
    }

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({ type: Array, attribute: true, reflect: true})
    accessor _wordsClues: WordClue[]


    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WwWordPuzzlesCrossword.newCrosswordGrid | newCrosswordGrid()}
     */
    @query('ww-word-puzzles-cw-grid')
    private gridW: WwWordPuzzlesCwGrid

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WwWordPuzzlesCrossword.newClueBox | newClueBox()}
     */
    @query('webwriter-word-puzzles-cw-cluebox')
    private clueW: WwWordPuzzlesCwCluebox

    /**
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false})
    _cwContext: CwContext


    setWordsCluesChildren(wordsClues: WordClue[]) {
        //DEV: console.log("Setting words and clues in children.")
        DEV: console.log("gridW:")
        DEV: console.log(this.gridW)
        DEV: console.log("clueW:")
        DEV: console.log(this.clueW)
        this._wordsClues = wordsClues
        this.gridW._wordsClues = wordsClues
        this.clueW._wordsClues = wordsClues
        //DEV: console.log("this._wordsAndClues:")
        //DEV: console.log(this._wordsAndClues)
    }
    /**
     * Styles
     * 
     */
    static get styles() {
        return crossword_styles
    }

    // Registering custom elements
    static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "sl-alert": SlAlert,
        "sl-drawer": SlDrawer,
        "ww-word-puzzles-cw-grid": WwWordPuzzlesCwGrid,
        "ww-word-puzzles-cw-cluebox": WwWordPuzzlesCwCluebox,
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
        this.gridW.generateCrossword(this._wordsClues)
    }

    onPreviewToggle(newValue: boolean): boolean {
        //DEV: console.log("Preview toggled")
        this.clueW.onPreviewToggle(newValue)
        return newValue 
    }


    render() {
        this.gridW.grid = Array.from({ length: 8}, () => Array(8).fill(defaultCell()))
        this.gridW.newCrosswordGridDOM(document)
        this.setWordsCluesChildren(this._wordsClues)


        return (html`<div class="wrapper">
                <ww-word-puzzles-cw-grid></ww-word-puzzles-cw-grid>
                <ww-word-puzzles-cw-cluebox></ww-word-puzzles-cw-cluebox>
            </div>
            `)
    }
}
