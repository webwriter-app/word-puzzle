# WebWriter Word Puzzle Widget

This is a widget for [WebWriter](https://webwriter.app/), implemented as part of a Bachelor's thesis. It allows a user to generate a crossword puzzle based off of a list of words and clues that they provide. It also supports creating find-the-words puzzles. The structure of the widget was designed with extensibility in mind, to make it possible to eventually add other types of word puzzles.

It was developed using the [Lit](https://lit.dev/) framework.

## Source Folder Structure

- `src/`
    - `lib/crossword-gen.ts`
    - `styles/styles.ts`
    - `widgets/`
        - `webwriter-word-puzzle-cluebox-input.ts`
        - `webwriter-word-puzzle-cluebox.ts`
        - `webwriter-word-puzzle-grid.ts`
        - `webwriter-word-puzzle.ts`
        - `webwriter-word-puzzles.ts`

Under `src/lib/crossword-gen.ts` is a library containing the algorithm to generate the crossword puzzle, along with other utilities. These are used in the widget.

`src/styles/styles.ts` contains the styling for the components of the widget.

The code for the different components of the widget is under `src/widgets/`.
