const WORDLE_URL = "https://www.nytimes.com/games/wordle/index.html";
const CLASS_TITLE = "AppHeader-module_title__6sqs-";
const CLASS_BOARD = "Board-module_board__lbzlf";
const CLASS_ROW = "Row-module_row__dEHfN";
const CLASS_TILE = "Tile-module_tile__3ayIZ";
const DATASTATE_EMPTY = "empty";     // tile is empty (no letter; white background)
const DATASTATE_TBD = "tbd";         // tile has letter; but guess not submitted (white)
const DATASTATE_CORRECT = "correct"; // letter is in correct location (green)
const DATASTATE_PRESENT = "present"; // letter is present but not in correct location (yellow)
const DATASTATE_ABSENT = "absent";   // letter is absent from solution (black)
const COLORCODE_EMPTY = "X";         // datastate is empty
const COLORCODE_WHITE = "W";         // datastate is tbd
const COLORCODE_GREEN = "G";         // datastate is correct
const COLORCODE_YELLOW = "Y";        // datastate is present
const COLORCODE_BLACK = "B";         // datastate is absent
const COLORTONE_EMPTY = "#f5793a";   // should never appear; indicates error
const COLORTONE_WHITE = "#fff";
const COLORTONE_GREEN = "#6aaa64";
const COLORTONE_YELLOW = "#c9b458";
const COLORTONE_BLACK = "#86888a";
const TEXT_BADGE = "?";              // overlay W icon in red
const WORDSET = 'english';           // set of words
const WORDLEN = 5;                   // length of every word
const MAXATTS = 6;                   // maximum attempts
const SHOWHELP = true;               // display help instructions
const SHOWHINT = true;               // display hints for common letters
const TODAY = null;                  // date override; format YYYY-MM-DD
const ALGORITHMS = {
  alpha: 'ordered alphabetically',
  hefty: 'weighted by letter frequency',
  rando: 'sorted randomly',
  shmoo: 'ranked by standard deviation smoothness'
};
  const X = 'indent this line, it is a hack for build.sh';