const fs = require('fs');
const initialList = fs.readFileSync(
  '../wordlists/random.5.txt', { encoding: 'utf8' }
  // './stdDev.5.00000.txt', { encoding: 'utf8' }
).split('\n');

const guessStats = initialList.map((string) => {
  const [ guess, sFail, sGuesses ] = string.split(' ');
  const fails = Number.parseInt(sFail);
  const guesses = Number.parseInt(sGuesses);
  const weight = (2315 * 6 * fails) + guesses;
  // const weight = Math.random();
  return { guess, fails, guesses, weight };
}).sort((a, b) => {
  return a.weight - b.weight;
});

guessStats.forEach(value =>
  // console.log(value.guess, 99999, 99999)
  console.log(value.guess, value.fails, value.guesses)
);
