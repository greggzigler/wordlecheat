
const Game = require('./game.js');

function testCtor(wordLength, rawList) {
  const game = new Game(wordLength, rawList);
  const [ guess, count ] = game.getGuess(1);
  if (guess !== rawList[0]) throw `bad guess ${guess}`;
  if (count !== rawList.length) throw `bad count ${count}`;
}

function testFilter(wordLength, rawList, response, expected) {
  const game = new Game(wordLength, rawList);
  const [ guess, count ] = game.getGuess(1);
  game.applyFilter(guess, response);
  if (JSON.stringify(game.wordList) !== JSON.stringify(expected.wordList))
    throw `bad wordlist ${game.wordList}`;
}

testCtor(2, ['on', 'no', 'oh']);

testFilter(2, ['on', 'no', 'oh'], 'GB', {
  guess: 'on',
  wordList: ['oh']
});

testFilter(2, ['on', 'no', 'oh'], 'YY', {
  guess: 'on',
  wordList: ['no']
});
