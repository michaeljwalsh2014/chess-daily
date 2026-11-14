# Chess, daily

A private, browser-local chess trainer with adaptive, per-skill puzzle selection.

- Original `chess-daily` browser data is preserved. Earlier journal entries and unfinished drafts remain readable.
- Optional current game rating and a goal; unknown ratings start at puzzle target 650.
- Three puzzles per session, selected sequentially from unused positions. Targets adjust with measured active time, correctness, and hint use.
- Real legal moves, promotions, automatic opponent replies, mate-in-one alternatives, explanations, solution playback, saved reflections, rating history, weekly checklists, JSON backups.
- Game ratings and puzzle targets are separate. The adjustment is a transparent training heuristic, not an Elo estimator.
- Five local computer opponents with distinct search budgets: Deadfish (~500), Little Fish (~700), Big Fish (~1000), Razor Teeth (~1800), and Cyber Tank (rating hidden). The displayed Elo values are approximate targets, not measured ratings. Razor Teeth uses bundled Stockfish 17.1 Lite at UCI Elo 1800; Cyber Tank targets UCI Elo 2100 and can think for six seconds with enough clock remaining. Both use full strength against a bare king to finish basic mates. These engine settings are not measured human ratings. Short clocks reduce the search budget; Bot Arena uses the same clock allocation. Stockfish source and GPLv3 license are linked in the app footer.
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

Hyper Bullet Bot 3.0 uses unrestricted bundled Stockfish: up to 800 ms above 30 seconds, 120–240 ms between 15 and 30 seconds, and 5–35 ms below 15 seconds. It has no artificial delay. Hyper Bullet Bot 2.0 retains the original local engine.

Auto uses recent move quality to adjust its challenge gradually within each game. Two short unrestricted Stockfish searches estimate the opponent's latest move loss, then a smoothed adjustment controls selection among eight candidate replies. Accurate play raises the challenge and repeated mistakes ease it; no win rate or rating is guaranteed. The adjustment is saved with unfinished player games, kept separately by color in Arena, and resets for a new game. With very short search budgets Auto skips the extra assessment and retains its current setting. The selector reads “Automatically adjusts to your level”.
