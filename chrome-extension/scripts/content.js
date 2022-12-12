const CLASS_TITLE = "AppHeader-module_title__6sqs-";
const CLASS_BOARD = "Board-module_board__lbzlf";
const CLASS_ROW = "Row-module_row__dEHfN";
const CLASS_TILE = "Tile-module_tile__3ayIZ";
const CLASS_KEY = "Key-module_key__Rv-Vp";
const KEYINDEX_ENTER = "19";         // wordle html does not have id for key
const DATASTATE_EMPTY = "empty";     // tile is empty (no letter, white background)
const DATASTATE_TBD = "tbd";         // tile has letter, but guess not submitted (white)
const DATASTATE_ABSENT = "absent";   // letter is absent from solution (black)
const DATASTATE_PRESENT = "present"; // letter is present but not in correct location (yellow)
const DATASTATE_CORRECT = "correct"; // letter is in correct location (green)
const COLORCODE_GREEN = "G";         // datastate is correct
const COLORCODE_YELLOW = "Y";        // datastate is present
const COLORCODE_BLACK = "B";         // datastate is absent (technically it is "gray")
const COLORCODE_WHITE = "W";         // datastate is tbd
const COLORCODE_EMPTY = "X";         // datastate is empty
const MAXATTS = 6;                   // maximum attempts

function updateSubTitle(text) {
  let subTitle = document.getElementById("confession");
  if (subTitle) {
    subTitle.innerHTML = text;
    subTitle.style.fontSize = "small";
  } else {
    const elements = document.getElementsByClassName(CLASS_TITLE);
    const title = elements[0];
    subTitle = document.createElement("div");
    subTitle.setAttribute("id", "confession");
    subTitle.innerHTML = text;
    subTitle.style.fontSize = "small";
    title.appendChild(subTitle);
  }
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

async function sendTilePropsMessage() {
  await sleep(2000); // TODO: replace sleep with event subscription
  const tileProps = getTileProps();
  const message = { id: "sendingTilePropsFromContent", tileProps };
  const response = await chrome.runtime.sendMessage(message);
  console.log('c70', response ? response.message : 'none');
  await makeConfession();
}

async function listenForEnterClick() {
  const elements = document.getElementsByClassName(CLASS_KEY);
  const enterKey = elements[KEYINDEX_ENTER];
  enterKey.addEventListener("click", () => sendTilePropsMessage());
}

function makeConfession() {
  const tileProps = getTileProps();
  const rowCount = tileProps.length;
  const isAllGreen = tileProps[rowCount - 1].reduce((acc, item) => {
    return acc && (item.color === COLORCODE_GREEN);
  }, true);
  const isLastGuess = rowCount === MAXATTS;
  updateSubTitle((isAllGreen || isLastGuess)
    ? "I cheated!"
    : "I'm cheating!");
}

async function contentMain() {
  makeConfession();
  await sendTilePropsMessage();
  await listenForEnterClick();
}

contentMain();

chrome.runtime.onMessage.addListener(
  async function(message, sender, sendResponse) {
    console.log('c90', message);
    sendResponse({ message: 'ack' });
    updateSubTitle(message.id); // proof of concept
  }
);
