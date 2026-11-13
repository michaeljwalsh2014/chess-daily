# Chess, daily

A private, browser-local chess trainer with adaptive, per-skill puzzle selection.

- Original `chess-daily` browser data is preserved. Earlier journal entries and unfinished drafts remain readable.
- Optional current game rating and a goal; unknown ratings start at puzzle target 650.
- Three puzzles per session, selected sequentially from unused positions. Targets adjust with measured active time, correctness, and hint use.
- Real legal moves, promotions, automatic opponent replies, mate-in-one alternatives, explanations, solution playback, saved reflections, rating history, weekly checklists, JSON backups.
- Game ratings and puzzle targets are separate. The adjustment is a transparent training heuristic, not an Elo estimator.
- Four local computer opponents with distinct search budgets: Deadfish, Little Fish, Big Fish, and Razor Teeth. Razor Teeth uses deeper alpha-beta search with iterative deepening, capture follow-up, move ordering, and a transposition table; its target is strong club play, not a certified 1700 Elo rating.
- Drag-and-drop or click-to-move on the board. During the computer's turn, queue one premove and cancel it before it executes.
- Move review uses the same local search for a suggested move, evaluation bar, and Best/Good/Decent/Mistake/Blunder labels.
- Records stay in browser localStorage. Backups move records across browsers. There is no cloud data synchronization.

## Puzzle bank

2,185 distinct positions selected from Lichess's public CC0 puzzle dataset on November 12, 2026. Original puzzle IDs, source links, ratings, themes, and winning lines are retained. The starting opponent move has already been applied to each stored FEN. Puzzles span roughly 400–2500 and cover forks, pins, checkmates, and calculation. Popularity, play count, and rating-deviation filters favor established puzzles. All solution moves and checkmate endings are checked with chess.js.

Sources:
- https://database.lichess.org/#puzzles
- https://huggingface.co/datasets/Lichess/chess-puzzles
- https://github.com/jhlywa/chess.js (v1.4.0, BSD-2-Clause; license included in dist/vendor)

New puzzle selection excludes seen puzzle IDs and piece-placement/side-to-move combinations. Journal review is intentional replay and never changes difficulty. Exhausted skills do not recycle automatically.

## Checks

Run `node --test tests/*.test.mjs`. The app is buildless; serve `dist/` as static files. Hosting identity is preserved in `.openai/hosting.json`.
