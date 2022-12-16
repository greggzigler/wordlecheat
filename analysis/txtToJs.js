const fs = require('fs');
const list = fs.readFileSync(
  './dataEval/random2.txt', { encoding: 'utf8' }
).split('\n');

const string = list.reduce((acc, item, index) => {
  const word = item.split(' ')[0];
  acc += ("'" + word + "'");
  if (index < list.length - 1) acc += ',';
  return acc;
}, 'export default [') + ']';

console.log(string);