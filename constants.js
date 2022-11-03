// game parameters
const WORDSET = 'english'; // set of words
const WORDLEN = 5;         // length of every word
const MAXATTS = 6;         // maximum attempts
const SHOWHELP = true;     // display help instructions
const SHOWHINT = true;     // display hints for common letters
const TODAY = null;        // date override, format YYYY-MM-DD

// wordle response categories
const GREEN = 'G';         // right letter in right slot
const YELLOW = 'Y';        // right letter in wrong slot
const BLACK = 'B';         // wrong letter

module.exports = {
  WORDSET, WORDLEN, MAXATTS, SHOWHELP, SHOWHINT, TODAY,
  GREEN, YELLOW, BLACK
};
