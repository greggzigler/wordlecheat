const CLASS_TITLE = "AppHeader-module_title__6sqs-";
const CLASS_BOARD = "Board-module_board__lbzlf";
const CLASS_ROW = "Row-module_row__dEHfN";
const CLASS_TILE = "Tile-module_tile__3ayIZ";
const DATASTATE_EMPTY = "empty";     // tile is empty (no letter, white background)
const DATASTATE_TBD = "tbd";         // tile has letter, but guess not submitted (white)
const DATASTATE_ABSENT = "absent";   // letter is absent from solution (black)
const DATASTATE_PRESENT = "present"; // letter is present but not in correct location (yellow)
const DATASTATE_CORRECT = "correct"; // letter is in correct location (green)
const COLORCODE_GREEN = "G";         // datastate is correct
const COLORCODE_YELLOW = "Y";        // datastate is present
const COLORCODE_BLACK = "B";         // datastate is absent
const COLORCODE_WHITE = "W";         // datastate is tbd
const COLORCODE_EMPTY = "X";         // datastate is empty

function addSubTitle(text) {
  const elements = document.getElementsByClassName(CLASS_TITLE);
  const title = elements[0];

  const para = document.createElement("div");
  const node = document.createTextNode(JSON.stringify(text));
  para.style.fontSize = "small";
  para.appendChild(node);

  title.appendChild(para);
}

function dataStateToColorCode(dataState) {
  switch (dataState) {
    case DATASTATE_ABSENT: return COLORCODE_BLACK;
    case DATASTATE_CORRECT: return COLORCODE_GREEN;
    case DATASTATE_EMPTY: return COLORCODE_EMPTY;
    case DATASTATE_PRESENT: return COLORCODE_YELLOW;
    case DATASTATE_TBD: return COLORCODE_WHITE;
    default: console.log(`bad ds: ${dataState}`); return null;
  }
}

function getTileProps() {
  const tileProps = [];
  let elements = document.getElementsByClassName(CLASS_BOARD);
  const board = elements[0];
  const rows = board.querySelectorAll(`.${CLASS_ROW}`);
  rows.forEach((row, rindex) => {
    const tiles = row.querySelectorAll(`.${CLASS_TILE}`);
    tiles.forEach((tile, tindex) => {
      const dataState = tile.getAttributeNode("data-state").value;
      if (dataState !== DATASTATE_EMPTY) {
        if (!tileProps[rindex]) tileProps[rindex] = [];
        tileProps[rindex][tindex] = {
          letter: tile.innerHTML,
          color: dataStateToColorCode(dataState)
        };
      }
    });
  });
  return tileProps;
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

async function contentMain() {
  addSubTitle("I'm cheating!");
  // TODO: instead of using sleep, figure out which event to subscribe to
  await sleep(2000);
  const tileProps = getTileProps();
  const response = await chrome.runtime.sendMessage(tileProps);
  console.log('c72', response.message);
}

contentMain();
