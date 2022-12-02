let exports = {
  WORDLE_URL: "https://www.nytimes.com/games/wordle/index.html",

  CLASS_TITLE: "AppHeader-module_title__6sqs-",
  CLASS_BOARD: "Board-module_board__lbzlf",
  CLASS_ROW: "Row-module_row__dEHfN",
  CLASS_TILE: "Tile-module_tile__3ayIZ",

  DATASTATE_EMPTY: "empty",     // tile is empty (no letter, white background)
  DATASTATE_TBD: "tbd",         // tile has letter, but guess not submitted (white)
  DATASTATE_ABSENT: "absent",   // letter is absent from solution (black)
  DATASTATE_PRESENT: "present", // letter is present but not in correct location (yellow)
  DATASTATE_CORRECT: "correct", // letter is in correct location (green)
};

export default exports;