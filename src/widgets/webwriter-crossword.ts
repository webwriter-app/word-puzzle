/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 * @mergeModuleWith webwriter-word-puzzles
 */
import { html, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { WebwriterWordPuzzles } from './webwriter-word-puzzles';
import { WebwriterCrosswordGrid } from './webwriter-crossword-grid';
import { WordClue, defaultCell } from '../lib/crossword-gen';
import { WebwriterCrosswordCluebox } from './webwriter-crossword-cluebox';
import { WebwriterCrosswordClueboxInput } from './webwriter-crossword-cluebox-input';

import { crossword_styles } from '../styles/styles'
import pencil_square from 'bootstrap-icons/icons/pencil-square.svg';
import check_circle from 'bootstrap-icons/icons/check-circle.svg';

import {localized, msg} from "@lit/localize"
import LOCALIZE from "../../localization/generated"

// Shoelace
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon, SlAlert, SlDrawer } from '@shoelace-style/shoelace';


declare global {interface HTMLElementTagNameMap {
        "webwriter-word-puzzles": WebwriterWordPuzzles;
        "webwriter-crossword": WebwriterCrossword;
        "webwriter-crossword-grid": WebwriterCrosswordGrid;
        "webwriter-crossword-cluebox": WebwriterCrosswordCluebox;
        "webwriter-crossword-cluebox-input": WebwriterCrosswordClueboxInput;
    }
}

function stopCtrlPropagation(event: KeyboardEvent): void {
    if (event.ctrlKey) {
        event.stopPropagation()
        //DEV: console.log("Prevented propagation of a single CTRL key sequence within widget")
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
 * Crossword element for word puzzle widget. Includes grid and clue panel elements.
 * @extends { WwWordPuzzles  }
 * @returns { void } Nothing, but renders the DOM element for the crossword puzzle
 */
@localized()
@customElement("webwriter-crossword")
export class WebwriterCrossword extends WebwriterWordPuzzles {

    public localize = LOCALIZE

    /**
     * @constructor
     * Constructor for the crossword puzzle
     * 
     * Sets the {@link WebwriterCrossword.width | width} and {@link WebwriterCrossword.height | height} attributes
     * Dispatches an event to generate the crossword grid
     */
    constructor(dimension: number = 8) {
        super()
        this.gridW = new WebwriterCrosswordGrid()
        this.clueW = new WebwriterCrosswordCluebox()
        this.clueInpW = new WebwriterCrosswordClueboxInput()
        this.gridW.grid = Array.from({ length: dimension}, () => Array(dimension).fill(defaultCell()))
        this.gridW.newCrosswordGridDOM(document)

        this.setWordsCluesChildren(this._wordsClues)

        this.addEventListener("keydown", stopCtrlPropagation )
        this.addEventListener("generateCw", this.generateCwHandler )
        this.addEventListener("set-context", this.setContextHandler)
        this.addEventListener("set-words-clues", (e: CustomEvent) => this.setWordsCluesChildren(e.detail))
    }

    generateCwHandler() {
        DEV: console.log("generateCw triggered")
        this.clueInpW._wordsClues = this.gridW.generateCrossword(this.clueInpW._wordsClues)
        this.clueW._wordsClues = this._wordsClues
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

    protected firstUpdated(_changedProperties: PropertyValues): void {
        //DEV: console.log("Within firstupdated, contenteditable is " + this.hasAttribute("contenteditable"))
        this.onPreviewToggle(this.hasAttribute("contenteditable"))
    }

    /**
     * The list of words grouped with their clues, direction, and word number.
     */
    @property({ type: Array, attribute: true, reflect: true})
    accessor _wordsClues: WordClue[]


    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterCrossword.newCrosswordGrid | newCrosswordGrid()}
     */
    @query('webwriter-crossword-grid')
    private gridW: WebwriterCrosswordGrid

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterCrossword.newClueBox | newClueBox()}
     */
    @query('webwriter-crossword-cluebox-input')
    private clueInpW: WebwriterCrosswordClueboxInput

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterCrossword.newClueBox | newClueBox()}
     */
    @query('webwriter-crossword-cluebox')
    private clueW: WebwriterCrosswordCluebox


    /**
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false})
    _cwContext: CwContext


    setWordsCluesChildren(wordsClues: WordClue[]) {
        //DEV: console.log("Setting words and clues in children.")
        this._wordsClues = wordsClues
        this.gridW._wordsClues = wordsClues
        this.clueW._wordsClues = wordsClues
        this.clueInpW._wordsClues = wordsClues
        this.clueInpW.reloadUnplacedMarkers(wordsClues);
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
        "webwriter-crossword-grid": WebwriterCrosswordGrid,
        "webwriter-crossword-cluebox": WebwriterCrosswordCluebox,
        "webwriter-crossword-cluebox-input": WebwriterCrosswordClueboxInput,
        "webwriter-word-puzzles-crossword": WebwriterCrossword
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
        this.clueInpW.onPreviewToggle(newValue)
        return newValue 
    }



    render() {
        this.setWordsCluesChildren(this._wordsClues)
        return (html`
            <div class="wrapper">
                <div class="cw-grid-wrapper">
                    ${this.gridW}
                    <div class="button-div">
                        ${this.hasAttribute("contenteditable") ? html`<sl-button id="edit-words" title="${msg("Edit words")}" class="crossword-button" variant="default" @click=${() => this.clueInpW.showDrawer()}>
                            <sl-icon slot="prefix" src=${pencil_square}></sl-icon>
                            <div class="button-content">
                                ${msg("Edit words")}
                            </div>
                        </sl-button>` : html``}
                        <sl-button id="answer-check" variant="success" title=${msg("Check answers")} class="crossword-button" variant="default" @click=${() => this.gridW.checkAnswers(this.gridW.grid, this.gridW.gridEl)}>
                            <sl-icon slot="prefix" src=${check_circle}></sl-icon>
                            <div class="button-content">
                                ${msg("Check answers")}
                            </div>
                        </sl-button>
                    </div>
                </div>

                <div class="cw-cluebox-wrapper">
                    ${this.clueInpW}${this.clueW}
                </div>
            </div>
            `)
    }
}
