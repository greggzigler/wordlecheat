// offer guesses based wordle app word list
const fs = require('fs');
const prompt = require('prompt-sync')();
const Game = require('./game.js');

// game parameters
const {
  WORDSET, WORDLEN, MAXATTS, SHOWHELP, TODAY, SHOWHINT
} = require('./constants.js');

// wordle response category
const { GREEN } = require('./constants.js');

// execute program
main();

function main() {
  displayInstructions();

  const rawList = fs.readFileSync(
    `./wordlists/${WORDSET}.${WORDLEN}.txt`, { encoding: 'utf8' }
  ).split('\n');
  const game = new Game(TODAY, WORDLEN, rawList);
  displayHints(game.letterList);
  
  // prompt user for next guess until max attempts have been made
  for (let attempt = 1; attempt <= MAXATTS; attempt += 1) {
    const [ guess, count ] = game.getGuess(attempt);
    if (count === 0) {
      console.log('No matches in word list');
      break;
    }
    console.log('Wordle guess:', guess, `(${count})`);
    const response = prompt('Wordle response: ', { sigint: true });
    console.log('');

    // check for ctrl-C (null), exact match (all green), bad length
    if (response === null) break;
    if (response.toUpperCase() === GREEN.repeat(WORDLEN)) break;
    if (response.length !== WORDLEN) {
      console.log('invalid response length', response.length);
      break;
    }

    // filter word list based on response, and try again
    game.applyFilter(guess, response);
  }
}

function displayInstructions() {
  if (SHOWHELP) {
    console.log('Instructions:');
    console.log('1. Enter Guess letters onto Wordle website;');
    console.log('2. Enter Response colors onto command line; for example,');
    console.log('   enter BBGYG for black-black-green-yellow-green');
    console.log('');
  }
}

function displayHints(letterList) {
  if (SHOWHINT) {
    console.log('Hints: letters from most- to least-common:');
    for (let index = 0; index < letterList.length; index++) {
      const ranked = letterList[index].map(o => o.letter).join('');
      console.log(index + ': ' + ranked);
    }
    console.log('');
  }
}
