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

  COLORCODE_GREEN: "G",         // datastate is correct
  COLORCODE_YELLOW: "Y",        // datastate is present
  COLORCODE_WHITE: "W",         // datastate is tbd
  COLORCODE_EMPTY: "X",         // datastate is empty
  COLORCODE_BLACK: "B",         // datastate is absent, actually is "gray",
                                //   but "G" was already taken. :-)
  COLORTONE_GREEN: "#6aaa64",
  COLORTONE_YELLOW: "#c9b458",
  COLORTONE_WHITE: "#fff",
  COLORTONE_EMPTY: "#f5793a",   // should never appear, indicates error
  COLORTONE_BLACK: "#86888a",
};

export default exports;