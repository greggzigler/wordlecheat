# wordlecheat

Command line tool that uses the Wordle app word list to provide good guesses for the game

## Installation

Install node.js, get repository from GitHub, `cd` to repository directory, and run `npm install`.

## Usage

1. Open [Wordle](https://www.nytimes.com/games/wordle/index.html) in a browser.
2. On the command line run `npm run cheat`.
3. Enter the `Guess letters` onto the browser.
4. Enter the first letters of the browser `Response Colors` onto the command line.

### Example from February 19th, 2022

```text
$ npm run cheat

> wordlecheat@1.0.0 cheat
> node index.js

Instructions:
1. Enter Guess letters onto Wordle website;
2. Enter Response colors onto command line; for example,
   enter BBGYG for black-black-green-yellow-green

Wordle guess: teary (2315)
Wordle response: BBBBB

Wordle guess: solid (198)
Wordle response: GBYYB

Wordle guess: sling (6)
Wordle response: GYGBB

Wordle guess: spill (3)
Wordle response: GBGGG

Wordle guess: swill (2)
Wordle response: GGGGG
```
