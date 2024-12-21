import {html, css} from 'lit';
import {LitElementWw, option} from '@webwriter/lit';
import {customElement, property, query, queryAssignedElements} from 'lit/decorators.js';
import { WebwriterWordPuzzles } from './webwriter-word-puzzles';

// TODO add 

@customElement("webwriter-word-puzzles-crossword")
export class WebwriterWordPuzzlesCrossword extends LitElementWw {
    
    render() {
        return html`<span>wasup lol. i hav changed</span>
        <p>WE LOVE YOU GOLDEN MOLE</p>`
    }

}

// TODO Add a skeleton for the grid while the crossword is being created?
