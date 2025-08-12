/**
 * Styles for the webwriter word puzzle widget
 */
import { css } from "lit";

export const crossword_styles = css`
    :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
        display: none;
    }
    :host  {
        overflow-x: auto;
    }
    div.wrapper {
        aspect-ratio: 16 / 9;
        display: flex;
        justify-content: center;
        margin: 20px;
        gap: 0px;
        flex-wrap: wrap;
        gap: 5px;
    }
    div.cw-grid-wrapper {
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
        justify-content: center;
        min-width: 50%;
    }
    div.button-div {
        display: flex;
        justify-content: center;
        gap: 10px;
        margin-bottom: 10px;
        margin-top: 0px;
        width: 100%;
    }
    .button-div .crossword-button {
        width: 50%;
        display: flex;
    }
    sl-button[variant="success"]::part(base) {
        background-color: #97BD64;
    }
    .button-content {
        font-weight: bold;
    }
    #answer-check div{
        margin-top: 0;
    }
    webwriter-word-puzzle-cluebox {
        display:flex;
        flex-wrap:wrap;
        align-items: space-between;
        justify-content:space-between;
        margin-top: 10px;
    }
    webwriter-word-puzzle-cluebox-input {
        display:contents;
        flex-wrap:wrap;
        align-items: space-between;
        justify-content:space-between;
        margin-top: 10px;
    }
    div.cw-cluebox-wrapper {
        display: flex;
        flex-direction: column;
        align-items: center;
        flex-basis: 200px;
        flex-grow: 1;
    }

    .container {
        display: flex;
        height: max-content;
        border-width: 2px;
        border-style: solid;
        border-radius: 5px;
        border-color: #6a6a6a;
    }

    .sidebar {
        border: 1px solid #ccc;
        padding: 10px;
        box-sizing: border-box;
        display: flex;
        flex-direction: column;
        gap: 4px;
        height: max-content;
        z-index: 2;
    }
`

/**
 * Styles for the word-puzzle cluebox.
 */
export const cluebox_styles = css`
    [nopreview] {
        display: none;
    }
    .hide-preview {
        display: none;
    }
    table {
        max-width: 300px;
        border-radius: 0.25rem;
    }
    table.clueboxInput thead {
        position: sticky;
        top: 4px;
        z-index: 1000;
    }
    .tables-wrapper {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
        justify-content: center;
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
        font-size: smaller;
        color: var(--sl-color-gray-700);
        background-color: var(--sl-color-gray-100);
        table-layout: fixed;
        margin-left: auto;
        margin-right: auto;
        margin-bottom: 10px;
        /*flex-basis: content; */
    }
    .clue-column {
        width: 70%; /* Temporary width and height*/
    }
    .button-column {
        width: 0%; /* Temporary width and height*/
    }
    #button-drawer{
        position: absolute;
    }
    sl-drawer::part(title){
        font-size: 20px;
        font-weight: bold;
        margin: 10px;
        padding: 10 var(--header-spacing);
        color: var(--sl-color-gray-700);
    }
    sl-drawer::part(header-actions){
        padding: 10 var(--header-spacing);
    }
    sl-drawer::part(body){
        padding: 5 var(--body-spacing);
        display: flex;
        flex-direction: column;
        gap: 10px;
        align-items: center;
    }
    sl-drawer::part(footer){
        display: flex;
        flex-direction: column;
        gap: 20px;
        align-items: center
    }
    sl-drawer sl-button[variant="success"] {
        position: sticky;
        bottom: 10px;
    }
    sl-drawer sl-button[variant="success"]::part(base) {
        background-color: #97BD64;
        font-weight: bold;
        min-width: 200px;
    }
    .minus-button {
        display: flex;
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
        top: +0.5em;
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
    .cell-word-not-placed {
        background-color: var(--sl-color-danger-300);
    }
    
    div.button-cell-div {
        display: table-cell;
        vertical-align: middle;
        padding-bottom: 10%
    }
    td.button-cell sl-button::part(base) {
        transform: scale(0.80)
    }
    table.cluebox {
        min-width: 300px;
        height: fit-content;
        border: 2px solid var(--sl-color-gray-300);
        font-family: var(--sl-font-sans);
        font-size: smaller;
        color: var(--sl-color-gray-700);
        background-color: var(--sl-color-gray-100);
        table-layout: fixed;
        text-align: center;
        justify-content: center;
        margin-bottom: 5px;
        line-height: normal;
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
        height: 1em;
        width: 50%;
    }
    table.cluebox td[current] {
        background-color: #E7F1CD;
        font-weight: bold;
    }
`

/**
 * Styles for the word-puzzle grid.
 * clue-label based off of crossword-js
 */
export const grid_styles = css`
    :host(:not([contenteditable=true]):not([contenteditable=""])) .author-only {
            display: none;
        }
        :host  {
            overflow: auto;
        }
        td:focus {
            background-color: white;
        }
        div.grid {
            position: relative;
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
            border-radius: 0.25rem;
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
        div.cell[correct] {
            background-color: #E7F1CC;
        }
        div.cell[incorrect] {
            background-color: #ffcccc;
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
            user-select: none;
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
