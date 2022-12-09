# wordlecheat

Using the list of all possible Wordle solutions, this application helps you reduce the number of guesses to find today's solution. This application provides two user interfaces: a **command-line tool** and a **chrome extension**.

## Command-line Tool

### Tool Setup

Install node.js, then:
```
$ git clone https://github.com/greggzigler/wordlecheat.git
$ cd wordlecheat
$ npm install
$ npm run build
```

### Tool Test

`$ npm run test`

### Tool Usage

1. Open [Wordle](https://www.nytimes.com/games/wordle/index.html) in a browser.
2. On the command line run `npm run cheat`.
3. Enter the `Guess letters` onto the browser.
4. Enter the first letters of the browser `Response Colors` onto the command line.

#### Example from February 19th, 2022

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

## Chrome Extension

### Extension Setup

Open the Chrome browser, then:

1. open a tab at `chrome://extensions/`
1. click the `Load unpacked` button
1. select the `wordlecheat/chrome-extension` folder
1. click the `Extensions` icon in the top right corner
1. click the Pin icon by the `WordleCheat` entry
1. click the `W` icon and see the popup dialog
1. click the `Go To Wordle` button

You should see the normal `Wordle` page, except now there's an `I'm cheating!` confession near the top.

### Extension Test

No tests written yet

### Extension Usage

Work-in-progress
