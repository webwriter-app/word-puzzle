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
import { WebwriterWordPuzzlesCrosswordGrid } from './crossword-grid';
import { WebwriterWordPuzzlesCrosswordCluebox } from './crossword-cluebox';


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
        "webwriter-word-puzzles-crossword": WebwriterWordPuzzlesCrossword;
        "webwriter-word-puzzles-crossword-grid": WebwriterWordPuzzlesCrosswordGrid;
        "webwriter-word-puzzles-crossword-cluebox": WebwriterWordPuzzlesCrosswordCluebox;
    }
}



// NOTE Almost all methods within this class are from / based on the crosswords-js module

/**
 * Cell object for the crossword grid. 
 * Maybe use this for the logic eventually
 */
interface Cell {
    white: boolean;
    answer: string; // Correct letter
    number: number; // Clue number
    direction: string; // Down, across, both, or null
}

/**
 * Function to create a default cell object.
 */
function defaultCell(): Cell {
    return {
        white: false,
        answer: null,
        number: null,
        direction: null
    }
}

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
     * Current context; true = across, false = down.
     */
    @property({ type: Boolean, state: true })
    across: true // @type {boolean}


    /**
     * @constructor
     * Constructor for the crossword puzzle
     * 
     * Sets the {@link WebwriterWordPuzzlesCrossword.width | width} and {@link WebwriterWordPuzzlesCrossword.height | height} attributes
     * Dispatches an event to generate the crossword grid
     */
    constructor(dimension: number = 9) {
        super()
        this.gridWidget = new WebwriterWordPuzzlesCrosswordGrid
        this.gridWidget.dimensions = dimension
        this.gridWidget.grid = Array.from({ length: dimension}, () => Array(dimension).fill(defaultCell()))
        this.gridWidget.newCrosswordGrid(document)
        this.clueWidget = new WebwriterWordPuzzlesCrosswordCluebox
        this.clueWidget.newClueBox(document)
        this.addEventListener("generateCw", () => {
            DEV: console.log("generateCw received with ")
            for(let word of this.clueWidget.wordList) {
                DEV: console.log(word)
            }
            this.gridWidget.generateCrossword(this.clueWidget.wordList)})
        //this.querySelector('#generateCwButton').addEventListener('click', () => {
        //     this.gridWidget.generateCrossword(this.clueWidget.getWords())
        //}
        //)
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

    /**
     * Generates crossword puzzle based off of words in the clue box and 
     * writes it to the DOM.
     * 
     * Based off of Agarwal and Joshi 2020
     */
    protected generateCrossword() {
        // Initialization
        let wordsOG = this.clueWidget.getNewWords()
        this.gridWidget.generateCrossword(wordsOG)
        DEV: console.log(wordsOG)
    }


    render() {
        return (html`<div class="wrapper">
                ${this.gridWidget}
                ${this.clueWidget}
            </div>
            `)
    }
}

