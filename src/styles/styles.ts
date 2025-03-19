/**
 * Styles for the webwriter word puzzle widget
 */
import { css } from "lit";

/**
 * Styles for the crossword cluebox.
 */
export const cluebox_styles = css`
    div {
        display:flex;
        flex-wrap:wrap;
        align-items: space-between;
        justify-content:space-between;
        margin-top: 10px;
        width: 100%;
    }
    div.cw-cluebox-wrapper {
            display:flex;
            flex-wrap:wrap;
            align-items: space-between;
            justify-content:center;
            margin-top: 20px;
            width: 100%;
        }
    table.clueboxInput {
        /*Temporary width and height*/
        /*min-width: 200px;*/
        width: 48%;
        min-width: 300px;
        min-height: 200px;
        height: fit-content;
        border: 2px solid var(--sl-color-gray-300);
        font-family: var(--sl-font-sans);
        color: var(--sl-color-gray-700);
        background-color: var(--sl-color-gray-100);
        table-layout: fixed;
        margin-left: auto;
        margin-right: auto;
        /*flex-basis: content; */
    }
    .word-column {
        width: 30%; /* Temporary width and height*/
    }
    .clue-column {
        width: 70%; /* Temporary width and height*/
    }
    .button-column {
        width: 0%; /* Temporary width and height*/
    }
    #button-drawer{
        position: absolute;
        margin-top: -0.6em;
    }
    .minus-button {
        font-size: 10px;
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
    table.clueboxInput > tbody {
        border: 3px solid var(--sl-color-gray-200);
    }
    table.clueboxInput > tbody > tr {
        font-family: var(--sl-font-sans);
        color: var(--sl-color-gray-900);
        word-wrap: break-word;
        overflow-wrap: anywhere;
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
    }
    table.clueboxInput td {
        justify-content: left;
        min-height: 20px;
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
    table.clueboxInput th.button-header-cell {
        width: 0px;
        border: 0px;
        padding: 0px;
        justify-content: left;
        float: right;
        margin-right: +0.95em;
    }
    th.button-header-cell sl-button::part(base) {
        transform: scale(0.80)
    }
    table.clueboxInput div.plus-button-div {
        display:table-cell;
        position: relative;
        top: +1.4em;
        padding-bottom: 10%
    }
    table.clueboxInput sl-button {
        height: auto;
        text-align: center;
        justify-content: center;
        align-content: center;
        vertical-align: middle;
    }
    table.clueboxInput sl-icon {
        size: 100px;
        font-size: 16px;
        text-align: center;
        padding: 0px;
        justify-content: center;
        color: var(--sl-color-gray-400);
        align-content: center;
        vertical-align: middle;
    }
    table.clueboxInput td.button-cell {
        width: 0px;
        height: 100%;
        border: 0px;
        padding: 0px;
        justify-content: left;
        float: right;
        margin-right: +0.80em;
    }
    
    div.button-cell-div {
        display: table-cell;
        vertical-align: middle;
        padding-bottom: 10%
    }
    div.sl-icon-div {
        margin-top: 40%;
    }
    td.button-cell sl-button::part(base) {
        transform: scale(0.80)
    }
    table.cluebox {
        width: 48%;
        min-width: 300px;
        height: fit-content;
        border: 2px solid var(--sl-color-gray-300);
        font-family: var(--sl-font-sans);
        color: var(--sl-color-gray-700);
        background-color: var(--sl-color-gray-100);
        table-layout: fixed;
        text-align: center;
        justify-content: center;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 5px;
    }
    table.cluebox col {
        width: 50%;
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
    table.cluebox > tbody {
        border: 3px solid var(--sl-color-gray-200);
    }
    table.cluebox > tbody > tr {
        font-family: var(--sl-font-sans);
        color: var(--sl-color-gray-900);
        word-wrap: break-word;
        overflow-wrap: anywhere;
    }
    table.cluebox td {
        text-align: left;
        font-family: var(--sl-font-sans);
        color: var(--sl-color-gray-900);
        border-right: 1px solid var(--sl-color-gray-200);
        border-left: 1px solid var(--sl-color-gray-200);
        border-bottom: 2px solid var(--sl-color-gray-200);
        border-collapse: collapse;
        padding: 10px;
        word-wrap: break-word;
        overflow-wrap: anywhere;
        height: 30px;
        width: 50%;
    }
    table.cluebox td[current] {
        background-color: #E7F1CD;
        font-weight: bold;
    }
`

/**
 * Styles for the crossword grid.
 * clue-label based off of crossword-js
 */
export const grid_styles = css`
    :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
            display: none;
        }
        // TODO Add different CSS for when a row / column is in focus
        td:focus {
            background-color: white;
        }
        div.grid {
            display: grid;
            flex-basis: content;
            grid-template-columns: auto;
            grid-template-rows: auto;
            justify-content: center;
            align-content: center;
            box-sizing: border-box;
            width: max-content;
            height: max-content;
            border: 2px solid var(--sl-color-gray-400);
        }
        div.cell {
            display: grid;
            grid-template-columns: repeat(3, 25%, [col-start]);
            grid-template-rows: [row1-start] 25% [row1-end row2-start] 75% [row2-end];
            aspect-ratio: 1;
            height: 100%;
            width: 100%;
            min-width: 40px;
            min-height: 40px;
            border: 1px solid var(--sl-color-gray-400);
            max-width: 40px;
            max-height: 40px;
            position: center;
            align-items: center;
            text-align: center;
            font-size: 18pt;
            caret-color: transparent;
        }
        div.cell[black] {
            background-color: var(--sl-color-gray-400);
        }
        div.cell:focus {
            background-color: lightblue;
        }
        div.focus-clue {
            background-color: lightskyblue;
        }
        .cell-letter {
            grid-column-start: 1;
            grid-column-end: span 100%;
            grid-row-start: row1-start;
            grid-row-end: span 100%;
            height: 100%;
            width: 100%;
            position: center;
            font-size: 18pt;
        }
        .clue-label {
            grid-column-start: 1;
            grid-column-end: span 25%;
            grid-row-start: row1-start;
            grid-row-end: span row1-end;
            position: absolute;
            margin: 1px 0px 0px 1px;
            font-size: 8pt;
            place-self: start;
            pointer-events: none;
        }
`