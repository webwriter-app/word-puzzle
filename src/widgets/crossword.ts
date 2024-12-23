import { html, css } from 'lit';
import { LitElementWw, option } from '@webwriter/lit';
import { customElement, property, query, queryAssignedElements } from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';

// TODO add 
// NOTE Almost all methods within this class are from the crosswords-js module

// Interface for cell objects

/**
 * Cell object for the crossword grid
 * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
 * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
 * @returns {HTMLDivElement} the DOM element for the _cell_
 */
type Cell =  {
    black: boolean;
    char: string;
    answer: string;
}

@customElement("webwriter-word-puzzles-crossword")
export class WebwriterWordPuzzlesCrossword extends LitElementWw {
    // All methods have the same names as in crosswords-js

    // TODO Add a skeleton for the grid while the crossword is being created?

    @property({type: Array, state: true})
    protected oldgrid: Cell[][]

    @property({type: Number, state: true})
    width: number

    @property({type: Number, state: true})
    height: number

    constructor(width: number, height: number) {
        super()
        this.width = width
        this.height = height
    }

    static get styles() {
        return css`
        div.wrapper {
            aspect-ratio: 1;
            width: 100%;
            align-content: left;
        }
        div.gridWrapper {
            display: flexbox;
            width: auto;
        }
        div.grid {
            display: grid;
            grid-template-columns: auto;
            grid-template-rows: auto;
            background-color: pink;
            justify-content: center;
            align-content: center;
            box-sizing: border-box;
            border: 2px;
            border-color: black;
        }
        div.cell {
            aspect-ratio: 1;
            height: 100%;
            width: 100%;
            min-width: 40px;
            min-height: 40px;
            border: 1px solid black;
            max-width: 40px;
            max-height: 40px;
            position: relative;
            background-color: red;
            align-items: center;
            text-align: center;
        }
        div.cell[black] {
            background-color: grey;
        }
        `
    }


    initializeCrosswordModel() {
       if (
            this.width === undefined ||
            this.width === null ||
            this.width < 0 ||
            this.height === undefined ||
            this.height === null ||
            this.height < 0
        ) {
            throw new Error('The crossword dimensions are invalid.');
        }
    }

    /**
     * Build a crossword grid _cell_ DOM element with child elements.
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
     * @returns {HTMLDivElement} the DOM element for the _cell_
     * Source: crosswords-js
     */
    newCrossword(document) {
        let wrapper = document.createElement('div')
        let gridWrapper = this.newCrosswordGrid
        wrapper.appendChild(gridWrapper)
        return wrapper
    }

    /**
     * Build a crossword grid _cell_ DOM element with child elements.
     * @param {Document} document the root node of the [DOM](https://en.wikipedia.org/wiki/Document_Object_Model#DOM_tree_structure)
     * eventual @param {HTMLDivElement} modelCell the representation of this grid cell in the  _crosswordModel_.
     * @returns {HTMLDivElement} the DOM element for the _cell_
     * Source: crosswords-js
     */
    newCrosswordGrid(document) {
        this.width = 9
        this.height = 9
        let grid = document.createElement('div');
        grid.classList.add('grid')
        let gridWrapper = document.createElement('div');
        gridWrapper.appendChild(grid);
        gridWrapper.classList.add('wrapper')
        for (let y = 1; y <= this.height; y += 1) {
            for (let x = 1; x <= this.width; x += 1) {
            //  Build the cell element and place cell in grid element
            grid.appendChild(this.newCell(document, x, y));
            DEV: console.log("added a cell, hopefully") 
            }
        }
        return gridWrapper
    }

    protected newCell(document: Document, x: number, y: number) {
        const cellDOM: HTMLElement = document.createElement('div');
        cellDOM.classList.add('cell')
        // TODO Add variables for the style to use only in the style part
        cellDOM.style.display = 'grid'
        cellDOM.style.gridColumnStart = (x).toString()
        cellDOM.style.gridRowStart = (y).toString()
        cellDOM.setAttribute("black", "")
        cellDOM.setAttribute("answer", "0")
        cellDOM.innerText = x.toString() + ", " + y.toString()
        return cellDOM
    }

    // TODO Add event listeners

    render() {
        return html`<div>${this.newCrosswordGrid(this.shadowRoot)}</div>
        <p>WE LOVE YOU GOLDEN MOLE</p>`

    }

}

