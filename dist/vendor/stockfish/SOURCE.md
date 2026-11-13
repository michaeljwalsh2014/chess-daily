# Stockfish engine attribution and source

Very Hard uses the unmodified Stockfish.js 19 lite single-threaded WebAssembly engine from npm `stockfish@19.0.1`, by Nathan Rugg, Chess.com LLC, and Stockfish contributors. This compact neural-network build is used for browser compatibility. The game does not impose a Skill Level or Elo handicap.

License: GNU GPL version 3; see [COPYING.txt](COPYING.txt).

Exact corresponding source and build scripts: [stockfish.js v19.0.1](https://github.com/nmrugg/stockfish.js/tree/0d5dd7944f88c817c07a26bc4fb1905d5f9c46d6).

Download source: [v19.0.1 source archive](https://github.com/nmrugg/stockfish.js/archive/0d5dd7944f88c817c07a26bc4fb1905d5f9c46d6.tar.gz).

The source's build instructions include neural network retrieval and the `build-single-lite` target. Engine files are distributed without modification. The engine communicates with the application through the UCI protocol in a separate worker.

The unchanged WebAssembly bytes are stored as base64 text for hosting compatibility. The adapter decodes them into an application/wasm Blob and provides its URL through the official loader’s supported URL fragment.

Engine bytes are losslessly gzip compressed before base64 encoding to reduce the hosted download. The browser decompresses them before compilation.

The website loads the pinned WebAssembly asset from https://unpkg.com/stockfish@19.0.1/bin/stockfish-19-lite-single.wasm and verifies SHA-256 ee4f115bdb2d32cadf96cada104a05b5ec257d7ad6f57582190b49bc71f096de before compilation. The same bytes are preserved in the repository under engine-source/.
