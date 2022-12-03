// Hypothesis: Words with the fewest peaks and valleys
// among all possible response subset sizes are better
// guesses.
//
// Background: There are 243 possible black-yellow-green
// responses (a.k.a. "patterns") for any guess. Applying
// a response to a word list creates a subset with a
// specific size (i.e. number of words).
//
// Results:
//   Appears similar to "unique" and "graduated" output
//   Best scores:
//     raise 243 0 168 22.144547223534197
//     arise 243 0 168 22.723112011165227
//     irate 243 0 194 22.734337631384943
//     arose 243 0 183 23.199313184427744
//     alter 243 0 196 24.000735253799924
//     saner 243 0 219 24.02729724475065
//     later 243 0 196 24.04664330088229
//     snare 243 0 219 24.219212872157115
//     stare 243 0 227 24.25792273375317
//     slate 243 0 221 24.312486938157043
// 

const fs = require('fs');
const Game = require('./game.js');
const { GREEN, YELLOW, BLACK } = require('./constants');
const { count } = require('console');
const FOLDER = './wordLists';
const WORDSET = 'english1';
const WORDLEN = 5;

// console.log(getPossiblePatterns(WORDLEN));
main();

function main() {
  const wordlist = fs.readFileSync(
    `${FOLDER}/${WORDSET}.${WORDLEN}.txt`,
    { encoding: 'utf8' }
  ).split('\n');

  const stats =[];
  let best = { stddev: Number.MAX_VALUE };
  const patterns = getPossiblePatterns(WORDLEN);
  for (let i = 0; i < wordlist.length; i += 1) {
    const guess = wordlist[i];
    stats[i] = calculateStats(guess, wordlist, patterns);
    best = printProgress(i, stats, best);
  }
  printBest(best);
  const sorted = sortStats(stats);
  printList(sorted);
}

function printProgress(i, stats, best) {
  if (stats[i].stddev < best.stddev) {
    best = stats[i];
  }
  if (i % 25 === 0) {
    console.log(i, 
      stats[i].guess, '(current)', '-',
      best.guess, best.stddev, '(best)');
  }
  return best;
}

function printBest(best) {
  console.log(best);
}

function getPossiblePatterns(nchars) {
  if (nchars === 0) return [ '' ];
  let index = 0;
  const patterns = [];
  const shorter = getPossiblePatterns(nchars - 1);
  [ BLACK, YELLOW, GREEN ].forEach((color) => {
    shorter.forEach((pattern) => {
        patterns[index] = `${color}${pattern}`;
        index += 1;
    });
  });
  return patterns;
}

function getStandardDeviation(array) {
  const n = array.length;
  const mean = array.reduce((a, b) => a + b) / n;
  return Math.sqrt(array.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / n);
}

function printList(items) {
  items.forEach((item) => {
    const { guess, n, min, max, stddev } = item;
    console.log(guess, n, min, max, stddev);
  });
}

function sortStats(stats) {
  return stats.sort((a, b) => {
    return a.stddev - b.stddev;
  });
}

function calculateStats(guess, wordlist, patterns) {
  const counts = [];
  patterns.forEach((pattern, index) => {
    const regex = Game.getFilter(guess, pattern);
    let matches = 0;
    wordlist.forEach((word) => {
      if (word.match(regex.bad)) return;
      if (!word.match(regex.reqd)) return;
      if (!word.match(regex.exact)) return;
      if (!word.match(regex.wrong)) return;
      matches += 1;
    });
    counts[index] = matches;
  });

  return {
    guess,
    n: counts.length,
    min: Math.min(...counts),
    max: Math.max(...counts),
    stddev: getStandardDeviation(counts),
    raw: counts
  };
}
