// figure out how frequently an ordered wordlist
// fails to find the solution within 6 turns for
// each possible first guess

const fs = require('fs');
const Game = require('./game.js');

const { GREEN } = require('./constants');

// initialize and write to disk
const FOLDER = './wordLists';
const WORDSET = 'stdDev';
const WORDLEN = 5;
const MAXATTS = WORDLEN + 1;
const MAXVALUE = 99999999;

let bestEver = {
  firstGuess: null,
  fails: MAXVALUE,
  guesses: MAXVALUE
};
let iterationId = 0;
let currentIdx = 0;

// read the initial list of input words
// may have words only, or may also have stats from previous run
const initialList = fs.readFileSync(
  `${FOLDER}/${WORDSET}.${WORDLEN}.txt`, { encoding: 'utf8' }
).split('\n');
const wordCount = initialList.length;

let guessStats = initialList.map((string, index) => {
  const [ firstGuess, sFail, sGuess, currentFlag ] = string.split(' ');
  const fails = Number.parseInt(sFail);
  const guesses = Number.parseInt(sGuess);
  if (currentFlag === '*') currentIdx = index;
  const current =  { firstGuess, fails, guesses };
  if (currentIdx == 0) {
    bestEver = getBetter(bestEver, current);
  }
  return {
    firstGuess,
    fails: fails || MAXVALUE,
    guesses: guesses || MAXVALUE,
    unguessed: []
  };
});

let improved = guessStats[0].fails !== MAXVALUE &&
  guessStats[guessStats.length - 1].fails === MAXVALUE;

writeToDisk(iterationId, guessStats, currentIdx);

// repeat until no improvement over previous iteration
while (true) {
  // simulate using this ordered word list to find each possible solution
  for (let guessIdx = currentIdx; guessIdx < wordCount; guessIdx += 1) {
    const guess = guessStats[guessIdx];
    let fails = 0;
    let guesses = 0;
    let unguessed = [];
    for (let solutionIdx = 0; solutionIdx < wordCount; solutionIdx += 1) {
      const solution = guessStats[solutionIdx].firstGuess;
      const result = findSolution(guessStats, guess.firstGuess, solution);
      if (result < 0) {
        fails += 1;
        unguessed.push(solution);
      } else guesses += result;
    }
    guessStats[guessIdx].fails = fails;
    guessStats[guessIdx].guesses = guesses;
    guessStats[guessIdx].unguessed = unguessed;

    // check for guess-specific improvement, and best-ever improvement
    const current = { firstGuess: guess.firstGuess, fails, guesses };
    improved = isAnImprovement(guess, current) ? true : improved;
    bestEver = getBetter(bestEver, current);

    if (guessIdx % 5 === 0) {
      progressBar(iterationId, guessIdx, bestEver);
      writeToDisk(iterationId, guessStats, guessIdx);
    }
  }
  writeToDisk(iterationId, guessStats, wordCount - 1);

  // if no improvement from previous iteration, exit loop
  if (!improved) break;

  // sort by fails-guesses, exit loop if it is worse
  const sorted = guessStats.sort((a, b) => {
    const maxGuesses = wordCount * MAXATTS;
    const aValue = (maxGuesses * a.fails) + a.guesses;
    const bValue = (maxGuesses * b.fails) + b.guesses;
    return aValue - bValue;
  });
  if (gotWorse(guessStats[0], sorted[0])) break;

  // write newly-sorted word list to disk
  iterationId += 1;
  improved = false;
  currentIdx = 0;
  bestEver = {
    firstGuess: null,
    fails: MAXVALUE,
    guesses: MAXVALUE
  };
  guessStats = sorted;
  writeToDisk(iterationId, guessStats, currentIdx);
}

function gotWorse(prev, curr) {
  return ((curr.fails > prev.fails) ||
          (curr.fails === prev.fails && curr.guesses > prev.guesses));
}

function isAnImprovement(prev, curr) {
  return ((curr.fails < prev.fails) ||
          (curr.fails === prev.fails && curr.guesses < prev.guesses));
}

function getBetter(best, curr) {
  return ((curr.fails < best.fails) ||
          (curr.fails === best.fails && curr.guesses < best.guesses)) ?
    curr : best;
}

function writeToDisk(iterationId, guessStats, currentIdx=0) {
  const places = 5;
  const zeroPadded = String(iterationId).padStart(places, '0');
  const outFile = `./${WORDSET}.${WORDLEN}.${zeroPadded}.txt`;
  const strings = guessStats.map((v, i) => {
    let string = `${v.firstGuess} ${v.fails} ${v.guesses}`;
    if (i === currentIdx) string += ' *';
    if (v.unguessed.length) string += ` ${v.unguessed[0]}`;
    return string;
  });
  fs.writeFileSync(outFile, strings.join('\n'));
}

function progressBar(iterationId, guessIdx, best) {
  console.clear();
  console.log(iterationId, guessIdx, 'best: ',
    best.firstGuess, best.fails, best.guesses);
}

function findSolution(guessStats, firstGuess, solution) {
  let guesses = 0;
  const wordList = guessStats.map(tuple =>tuple.firstGuess);
  const game = new Game(null, WORDLEN, wordList, weigher);
  for (let attempt = 1; attempt <= MAXATTS; attempt += 1) {
    guesses += 1;
    const guess = (attempt == 1) ? firstGuess : game.wordList[0];

    // compare the guess to the secret solution and filter for next iteration
    let response = Game.calculateResponse(guess, solution);
    if (response.toUpperCase() === GREEN.repeat(response.length)) break;
    game.applyFilter(guess, response);

    if (attempt == MAXATTS) {
      return -1;
    }
  }
  return guesses;
}

function weigher(weights, words) {
  return words.map((word, index) => {
    // do not sort, use current index as weight
    return { word, weight: index };
  });
}
