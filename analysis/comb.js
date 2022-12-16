const fs = require('fs');

const lists = [];
for (let i = 1; i <= 5; i++) {
  lists[i] = fs.readFileSync(
    `../wordlists/random${i}.5.txt`, { encoding: 'utf8' }
    ).split('\n');
}
const hash = lists.reduce((acc, list) => {
  list.forEach(item => {
    const [ word, fails, guesses ] = item.split(' ');
    if (!acc[word]) acc[word] = { word, fails: 0, guesses: 0 };
    acc[word].fails += parseInt(fails);
    acc[word].guesses += parseInt(guesses);
  });
  return acc;
}, {});

Object.keys(hash).forEach((word) => {
  console.log(word, hash[word].fails, hash[word].guesses);
});
