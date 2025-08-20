# Word,Puzzle (`@webwriter/word-puzzle@1.0.3`)
[License: MIT](LICENSE) | Version: 1.0.3

Crossword and word search puzzle creation tool featuring customizable grids, clues, and interactive solving.

## Snippets
[Snippets](https://webwriter.app/docs/snippets/snippets/) are examples and templates using the package's widgets.

| Name | Import Path |
| :--: | :---------: |
| Crossword Animals | @webwriter/word-puzzle/snippets/Crossword-Animals.html |
| Find The Words Fruits | @webwriter/word-puzzle/snippets/Find-The-Words-Fruits.html |



## `WebwriterWordPuzzle` (`<webwriter-word-puzzle>`)
Crossword element for word puzzle widget. Includes grid and clue panel elements.

### Usage

Use with a CDN (e.g. [jsdelivr](https://jsdelivr.com)):
```html
<link href="https://cdn.jsdelivr.net/npm/@webwriter/word-puzzle/widgets/webwriter-word-puzzle.css" rel="stylesheet">
<script type="module" src="https://cdn.jsdelivr.net/npm/@webwriter/word-puzzle/widgets/webwriter-word-puzzle.js"></script>
<webwriter-word-puzzle></webwriter-word-puzzle>
```

Or use with a bundler (e.g. [Vite](https://vite.dev)):

```
npm install @webwriter/word-puzzle
```

```html
<link href="@webwriter/word-puzzle/widgets/webwriter-word-puzzle.css" rel="stylesheet">
<script type="module" src="@webwriter/word-puzzle/widgets/webwriter-word-puzzle.js"></script>
<webwriter-word-puzzle></webwriter-word-puzzle>
```

## Fields
| Name (Attribute Name) | Type | Description | Default | Reflects |
| :-------------------: | :--: | :---------: | :-----: | :------: |
| `_wordsClues` (`_wordsClues`) | `WordClue[]` | The list of words grouped with their clues, direction, and word number. | - | ✓ |
| `_cwContext` | `CwContext` | Current crossword context; across and clue number | - | ✗ |
| `type` (`type`) | `'crossword' \| 'find-the-words'` | Type of word puzzle | `'crossword'` | ✓ |
| `grid` | - | - | - | ✗ |

*Fields including [properties](https://developer.mozilla.org/en-US/docs/Glossary/Property/JavaScript) and [attributes](https://developer.mozilla.org/en-US/docs/Glossary/Attribute) define the current state of the widget and offer customization options.*

## Editing config
| Name | Value |
| :--: | :---------: |
| `defining` | `true` |
| `isolating` | `true` |

*The [editing config](https://webwriter.app/docs/packages/configuring/#editingconfig) defines how explorable authoring tools such as [WebWriter](https://webwriter.app) treat the widget.*

*No public methods, slots, events, custom CSS properties, or CSS parts.*


---
*Generated with @webwriter/build@1.6.0*