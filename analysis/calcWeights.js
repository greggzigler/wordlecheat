// Evaluate algorithms used to weigh each guess before sorting.
// The Game class has a built-in algorithm, but it may not be the best.
// Allow experimentation with alternatives.

const fs = require('fs');
const Game = require('./game.js');

const {
  WORDSET, WORDLEN, MAXGUESSES, GREEN, YELLOW, BLACK
} = require('./constants.js');

// ############################
const rawList = fs.readFileSync(
  `./wordlists/${WORDSET}.${WORDLEN}.txt`, { encoding: 'utf8' }
).split('\n');

let bestGuess = null;
let minAttempts = Number.MAX_VALUE;
let minFails = Number.MAX_VALUE;

// this takes a long time to run, so just test one weigher algorithm at a time
let weigher = uniqueLetters;
for (let offset = 0; offset < rawList.length; offset += 1) {
  const [ firstGuess, attempts, fails ] = evaluate(weigher, offset);

  // treat number of fails as more important than number of attempts
  let flag = '';
  if (fails < minFails) {
    bestGuess = firstGuess;
    minFails = fails;
    flag += '*';
  }
  if (fails === minFails && attempts < minAttempts) {
    bestGuess = firstGuess;
    minAttempts = attempts;
    flag += '!';
  }
  console.log(offset, firstGuess, attempts/rawList.length, fails, flag);
}

let avg = (minFails === 0) ? minAttempts/rawList.length : 'n/a';
console.log(`final: guess=${bestGuess}, avg=${avg}, fails=${minFails}`);

// ############################
// results
//  alphabetical: dealt=3.89, slate, alert, renal, slant
//  random: honey=4.04
//  uniqueLetter: stare=3.71, slate, arose, saner, raise
//  everyLetter: tease=4.18, erase, stare, lease, eater
//  graduated: stare=3.73, slate, arose, raise, saner

// ############################
function evaluate(weigher, offset) {
  let attempts = 0;
  let firstGuess = null;
  let fails = 0;
  const game = new Game(null, WORDLEN, rawList, weigher);

  // how good is this weigher algorithm for every possible solution?
  for (let i = 0; i < rawList.length; i += 1) {
    const solution = rawList[i];
    game.sortWordlist(WORDLEN, rawList, weigher);

    // how fast can each first guess find the right solution?
    for (let attempt = 1; attempt <= MAXGUESSES; attempt += 1) {
      attempts += 1;
      // game.sortWordlist(WORDLEN, game.wordList, weigher, attempt);

      // use the offset to find the first guess
      const index = offset < game.wordList.length ? offset : game.wordList.length - 1;
      const guess = game.wordList[index];
      if (attempt == 1) firstGuess = guess;

      // compare the guess to the secret solution and filter for next iteration
      let response = Game.calculateResponse(guess, solution);
      if (response.toUpperCase() === GREEN.repeat(WORDLEN)) break;
      game.applyFilter(guess, response);

      // keep track of whether this first word finds the right solution
      if (attempt == MAXGUESSES) {
        fails += 1;
      }
    }
  }
  return [ firstGuess, attempts, fails ];
}

// ############################
// weighWords alternatives
// ############################
function alphabetical(weights, rawList, attempt=0) {
  const weightedObjects = [];
  rawList.forEach(word => {
    const weight = 0; // effectively alphabetical
    weightedObjects.push({ word, weight });
  });
  return weightedObjects;
}

function random(weights, rawList, attempt=0) {
  const weightedObjects = [];
  rawList.forEach(word => {
    const weight = Math.random();
    weightedObjects.push({ word, weight });
  });
  return weightedObjects;
}

function uniqueLetters(weights, rawList, attempt=0) {
  const weightedObjects = [];
  const anyPos = Game.getAnyPosIndex();
  rawList.forEach(word => {
    // weigh based on unique letters in word
    let weight = 0;
    const letters = [...new Set(word.split(''))];
    letters.forEach((letter, index) => {
      const exactPos = Game.getExactPosIndex(index);
      weight += weights[anyPos][letter];
      weight += weights[exactPos][letter];
    });
    weightedObjects.push({ word, weight });
  });
  return weightedObjects;
}

function everyLetter(weights, rawList, attempt=0) {
  const weightedObjects = [];
  const anyPos = Game.getAnyPosIndex();
  rawList.forEach(word => {
    // weigh based on every letter in word
    let weight = 0;
    const letters = word.split('');
    letters.forEach((letter, index) => {
      const exactPos = Game.getExactPosIndex(index);
      weight += weights[anyPos][letter];
      weight += weights[exactPos][letter];
    });
    weightedObjects.push({ word, weight });
  });
  return weightedObjects;
}

function graduated(weights, rawList, attempt=0) {
  const weightedObjects = [];
  const anyPos = Game.getAnyPosIndex();
  rawList.forEach(word => {
    // weigh based on every letter in word
    // but duplicate letters are weighted more, the later the attempt
    const already = new Set();
    let weight = 0;
    const letters = word.split('');
    letters.forEach((letter, index) => {
      const exactPos = Game.getExactPosIndex(index);
      const fullWeight = weights[anyPos][letter] + weights[exactPos][letter];
      const factor = already.has(letter) ? (attempt/MAXGUESSES) : 1;
      weight += Math.ceil(fullWeight * factor);
      already.add(letter);
    });
    weightedObjects.push({ word, weight });
  });
  return weightedObjects;
}

// ############################
