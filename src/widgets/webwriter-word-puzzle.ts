/**
 * Main WebWriter Word Puzzles Widget.
 * 
 * @packageDocumentation
 * @module crossword
 */
import { html, LitElement, PropertyValues } from 'lit';
import { customElement, property, query } from 'lit/decorators.js';

import { WebwriterWordPuzzleGrid } from './webwriter-word-puzzle-grid';
import { WordClue, defaultCell } from '../lib/crossword-gen';
import { WebwriterWordPuzzleCluebox } from './webwriter-word-puzzle-cluebox';
import { WebwriterWordPuzzleClueboxInput } from './webwriter-word-puzzle-cluebox-input';

import { crossword_styles } from '../styles/styles'
import pencil_square from 'bootstrap-icons/icons/pencil-square.svg';
import check_circle from 'bootstrap-icons/icons/check-circle.svg';

import {localized, msg} from "@lit/localize"
import LOCALIZE from "../../localization/generated"

// Shoelace
// @ts-ignore
import "@shoelace-style/shoelace/dist/themes/light.css";

// Buttons
import { SlButton, SlIcon, SlAlert, SlDrawer, SlSelect, SlOption } from '@shoelace-style/shoelace';
import { LitElementWw } from '@webwriter/lit';
import { readData, writeData } from '../lib/data';


declare global {interface HTMLElementTagNameMap {
        "webwriter-word-puzzle": WebwriterWordPuzzle;
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
 */
@localized()
@customElement("webwriter-word-puzzle")
export class WebwriterWordPuzzle extends LitElementWw {
    static dataType = "application/json";

    protected localize = LOCALIZE
    readonly options = WebwriterWordPuzzle.options;
    readonly actions = WebwriterWordPuzzle.actions;

    static options: Record<string, any> = {
        type: {
            type: "select",
            group: "puzzle",
            label: { _: "Puzzle Type" },
            options: [
                { value: "crossword", label: { _: "Crossword" } },
                { value: "find-the-words", label: { _: "Find the words" } },
            ],
        },
    };

    static optionGroups: Record<string, any> = {
        puzzle: { label: { _: "Puzzle" }, collapsible: true, advanced: false },
    };

    static actions: Record<string, any> = {
        editWords: { label: { _: "Edit words" }, group: "puzzle", icon: "Edit", intent: "default" },
        checkAnswers: { label: { _: "Check answers" }, group: "puzzle", icon: "Check", intent: "default" },
    };

    editWords() { this.clueInpW.showDrawer(); }
    checkAnswers() { this.gridW.checkAnswers(this.gridW.grid, this.gridW.gridEl); }

    /**
     * @constructor
     * Constructor for the crossword puzzle
     * 
     * Sets the {@link WebwriterWordPuzzle.width | width} and {@link WebwriterWordPuzzle.height | height} attributes
     * Dispatches an event to generate the crossword grid
     */
    constructor(dimension: number = 8) {
        super()
        this._wordsClues = readData<{wordsClues: WordClue[]}>(this).wordsClues ?? [];
        this.gridW = new WebwriterWordPuzzleGrid(this)
        this.clueW = new WebwriterWordPuzzleCluebox(this)
        this.clueInpW = new WebwriterWordPuzzleClueboxInput(this)
        this.gridW.grid = Array.from({ length: dimension}, () => Array(dimension).fill(defaultCell()))
        this.gridW.newCrosswordGridDOM(document)

        this.setWordsCluesChildren(this._wordsClues, false)

        this.addEventListener("keydown", stopCtrlPropagation )
        this.addEventListener("generateCw", this.generateCwHandler )
        this.addEventListener("set-context", this.setContextHandler)
        this.addEventListener("set-words-clues", (e: CustomEvent) => this.setWordsCluesChildren(e.detail, true))
    }

    protected generateCwHandler() {
        DEV: console.log("generateCw triggered")
        this.setWordsCluesChildren(this.gridW.generateCrossword(this.clueInpW._wordsClues), true);
        (this.clueW as any).requestUpdate()
    }

    protected setContextHandler(e: CustomEvent) {
        if(e.detail.across)
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
    @property({ type: Array, attribute: false, state: true })
    accessor _wordsClues: WordClue[] = []


    /**
     * The DOM grid element of the crossword puzzle. Contains the cells
     * 
     * See the constructor {@link WebwriterWordPuzzle.newCrosswordGrid | newCrosswordGrid()}
     */
    @query('webwriter-word-puzzle-grid')
    private gridW: WebwriterWordPuzzleGrid

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterWordPuzzle.newClueBox | newClueBox()}
     */
    @query('webwriter-word-puzzle-cluebox-input')
    private clueInpW: WebwriterWordPuzzleClueboxInput

    /**
     * The panel element of the crossword puzzle, containing the words and clues. (WIP)
     * 
     * See the constructor {@link WebwriterWordPuzzle.newClueBox | newClueBox()}
     */
    @query('webwriter-word-puzzle-cluebox')
    private clueW: WebwriterWordPuzzleCluebox


    /**
     * Current crossword context; across and clue number
     */
    @property({ type: Object, state: true, attribute: false})
    _cwContext: CwContext
    

    /**
     * Type of word puzzle
     */
    @property({ type: String, attribute: true, reflect: true })
    public accessor type: 'crossword' | 'find-the-words' = 'crossword';


    protected setWordsCluesChildren(wordsClues: WordClue[], persist = false) {
        //DEV: console.log("Setting words and clues in children.")
        this._wordsClues = wordsClues
        if (persist) writeData(this, { wordsClues });
        this.gridW._wordsClues = wordsClues
        this.clueW._wordsClues = wordsClues
        this.clueInpW._wordsClues = wordsClues
        this.clueInpW.reloadUnplacedMarkers(wordsClues);
        //DEV: console.log("this._wordsAndClues:")
        //DEV: console.log(this._wordsAndClues)
    }

    dataChanged(text: string | null): void {
        if (!text) return;
        try {
            const data = JSON.parse(text);
            if (Array.isArray(data.wordsClues)) this.setWordsCluesChildren(data.wordsClues, false);
        } catch {
            // Leave malformed authored data untouched for repair in the document.
        }
    }
    /**
     * Styles
     * 
     */
    static get styles() {
        return crossword_styles
    }

    // Registering custom elements
    protected static get scopedElements() {
        return {
        "sl-button": SlButton,
        "sl-icon": SlIcon,
        "sl-alert": SlAlert,
        "sl-drawer": SlDrawer,
        'sl-select': SlSelect,
        'sl-option': SlOption,
        "webwriter-word-puzzle-grid": WebwriterWordPuzzleGrid,
        "webwriter-word-puzzle-cluebox": WebwriterWordPuzzleCluebox,
        "webwriter-word-puzzle-cluebox-input": WebwriterWordPuzzleClueboxInput
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

    protected onPreviewToggle(newValue: boolean): boolean {
        //DEV: console.log("Preview toggled")
        this.clueInpW.onPreviewToggle(newValue)
        return newValue 
    }

    protected updated(changedProperties: PropertyValues): void {
        if (!changedProperties.has("type")) return;
        (this.gridW as any)?.requestUpdate();
        (this.clueW as any)?.requestUpdate();
        (this.clueInpW as any)?.requestUpdate();
    }



    render() {
        this.setWordsCluesChildren(this._wordsClues, false)
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
                        ${this.type == "crossword" || this.hasAttribute("contenteditable") ? html`<sl-button id="answer-check" variant="success" title=${this.type == "crossword" ? msg("Check answers") : msg("Show answers")} class="crossword-button" variant="default" @click=${() => this.gridW.checkAnswers(this.gridW.grid, this.gridW.gridEl)}>
                            <sl-icon slot="prefix" src=${check_circle}></sl-icon>
                            <div class="button-content">
                                ${this.type == "crossword" ? msg("Check answers") : msg("Show answers")}
                            </div>
                        </sl-button>` : html``}
                    </div>
                </div>

                <div class="cw-cluebox-wrapper">
                    ${this.clueInpW}${this.clueW}
                </div>
            </div>
            `)
    }
}
