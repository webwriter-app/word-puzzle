# Word Puzzles Widget

## Proposed structure

I've been told I shouldn't abstract things yet, but rather that I should implement the puzzles separately and then try to simplify things.

Nonetheless here's what I think it might look like later:

```mermaid
classDiagram
    LitElementWw <|-- Puzzle
    Puzzle <|-- Crossword
    Puzzle <|-- WordSearch
    Puzzle ..> Grid
    Grid o-- Cell
    Cell <|-- CrossCell
    Cell <|-- FindCell
    
    
    class LitElementWw

    class Puzzle{
        <<abstract>>
      +Grid grid
      +? dictionary
      +addInput()
      +generate(PuzzleType, Options)
    }

    Puzzle <.. Dictionary
    
    class Crossword{
    +? panel
      -generate(Options)
    }

    note for Dictionary "Also clues. Optional for find thew ord"
    class Dictionary{
        +(String, String)\ \ (word, definition)
    }

    class WordSearch{
      -generate(Options)
    }

    namespace puzzleGrid {
    %% For crossword / find the word puzzle
    class Grid {
        +Cell cell[][]
    }

    class Cell {
        +char letter
        bool selected
        bool answer
    }

    class CrossCell {
        bool unused
    }
    class FindCell {
    }

    }
```