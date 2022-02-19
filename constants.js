// game parameters
const LANG = 'english'; // language of word list
const WORDLEN = 5;      // length of every word
const MAXATTS = 6;      // maximum attempts
const SHOWHELP = true;  // display help instructions

// wordle response categories
const GREEN = 'G';      // right letter in right slot
const YELLOW = 'Y';     // right letter in wrong slot
const BLACK = 'B';      // wrong letter

module.exports = {
  LANG, WORDLEN, MAXATTS, SHOWHELP,
  GREEN, YELLOW, BLACK
};
