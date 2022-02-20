const fs = require('fs');
const Game = require('./game.js');

// #######################################
function testCtor(dateOverride, wordLength, rawList) {
  const game = new Game(dateOverride, wordLength, rawList);
  const [ guess, count ] = game.getGuess(1);
  if (guess !== rawList[0]) throw `bad guess ${guess}`;
  if (count !== rawList.length) throw `bad count ${count}`;
  console.log('pass', rawList, wordLength);
}

testCtor(null, 2, ['on', 'no', 'oh']);

// #######################################
function testFilter(wordLength, rawList, response, expected) {
  const game = new Game(null, wordLength, rawList);
  const [ guess, count ] = game.getGuess(1);
  game.applyFilter(guess, response);
  if (JSON.stringify(game.wordList) !== JSON.stringify(expected.wordList)) {
    throw `bad wordlist ${game.wordList}`;
  }
  console.log('pass', rawList, response);
}

testFilter(2, ['on', 'no', 'oh'], 'GB', {
  guess: 'on',
  wordList: ['oh']
});

testFilter(2, ['on', 'no', 'oh'], 'YY', {
  guess: 'on',
  wordList: ['no']
});

// #######################################
const wordSet = 'english';
const wordLength = 5;
const rawList = fs.readFileSync(
  `./wordlists/${wordSet}.${wordLength}.txt`, { encoding: 'utf8' }
).split('\n');

function testMultiTurn(dateOverride, solution, expected) {
  const game = new Game(dateOverride, wordLength, rawList);
  const attempts = expected.guesses.length;
  for (let attempt = 1; attempt < attempts + 1; attempt += 1) {
    const eGuess = expected.guesses[attempt - 1];
    const eCount = expected.counts[attempt - 1];
    const eResponse = expected.responses[attempt - 1];
    const [ guess, count ] = game.getGuess(attempt);
    if (guess !== eGuess) throw `unexpected guess ${guess} not equal ${eGuess}`;
    if (count !== eCount) throw `unexpected count ${count} not equal ${eCount}`;
    game.applyFilter(guess, eResponse);
  }
  if (game.wordList[0] !== solution) {
    throw `final word ${game.wordList[0]} does not match ${solution}`;
  }
  console.log('pass', dateOverride, solution);
}

testMultiTurn('2022-02-01', 'those', {
  guesses: [ 'stare', 'those' ],
  counts: [ 2315, 3 ],
  responses: [ 'YYBBG', 'GGGGG' ]
});

testMultiTurn('2022-02-08', 'frame', {
  guesses: [ 'irate', 'crane', 'drape', 'frame' ],
  counts: [ 2315, 15, 10, 6 ],
  responses: [ 'BGGBG', 'BGGBG', 'BGGBG', 'GGGGG' ]
});

testMultiTurn('2022-02-14', 'cynic', {
  guesses: [ 'store', 'daily', 'cynic' ],
  counts: [ 2315, 246, 1 ],
  responses: [ 'BBBBB', 'BBYBY', 'GGGGG' ]
});

testMultiTurn('2022-02-17', 'shake', {
  guesses: [ 'crane', 'slate', 'shade', 'shape', 'shame', 'shake' ],
  counts: [ 2315, 44, 7, 4, 3, 2 ],
  responses: [ 'BBGBG', 'GBGBG', 'GGGBG', 'GGGBG', 'GGGBG', 'GGGGG' ]
});

// #######################################
