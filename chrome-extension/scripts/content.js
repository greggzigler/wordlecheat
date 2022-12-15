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
const WORDLEN = 5;                   // length of every word
const MAXGUESSES = 6;                // maximum attempts

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
  let rindex = -1;
  let tindex = -1;
  let whiteCount = 0;
  let row = [];
  const tiles = document.getElementsByClassName(CLASS_TILE);
  Array.from(tiles).forEach((tile, i) => {
    if (i % WORDLEN === 0) {
      rindex += 1;
      tindex = -1;
      whiteCount = 0;
      row = [];
    }
    tindex += 1;
    const dataState = tile.getAttributeNode("data-state").value;
    const letter = tile.innerHTML;
    if (dataState !== DATASTATE_TBD && dataState !== DATASTATE_EMPTY) {
      row[tindex] = {
        letter: tile.innerHTML,
        color: dataStateToColorCode(dataState)
      };
    } else {
      whiteCount += 1;
    }

    if (tindex === WORDLEN - 1) {
      if (whiteCount) return; // this row is not fully evaluated
      tileProps[rindex] = row;
    }
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
  await makeConfession();
  await chrome.runtime.sendMessage(message);
}

async function listenForEnterClick() {
  const elements = document.getElementsByClassName(CLASS_KEY);
  const enterKey = elements[KEYINDEX_ENTER];
  enterKey.addEventListener("click", () => sendTilePropsMessage());
}

async function makeConfession() {
  const tileProps = getTileProps();
  const rowCount = tileProps.length;
  const isAllGreen = (rowCount === 0)
    ? false
    : tileProps[rowCount - 1].reduce((acc, item) => {
      return acc && (item.color === COLORCODE_GREEN);
    }, true);
  const isLastGuess = rowCount === MAXGUESSES;
  updateSubTitle((isAllGreen || isLastGuess)
    ? "I cheated!"
    : "I'm cheating!");
}

async function contentMain() {
  await sendTilePropsMessage();
  await listenForEnterClick();
}

contentMain();

chrome.runtime.onMessage.addListener(
  async function(message) {
    const { id } = message;
    if (id === "userClickedGuessInPopup") {
      updateNextGuess(message.guessWord);
    } else if (id === "userClickedEnterInPopup") {
      await clickEnterKey();
    }
  }
);

const keyboard = [
  'q', 'w', 'e', 'r', 't', 'y', 'u', 'i', 'o', 'p',
  'a', 's', 'd', 'f', 'g', 'h', 'j', 'k', 'l',
  'enter', 'z', 'x', 'c', 'v', 'b', 'n', 'm', 'back'
];

function updateNextGuess(guessWord) {
  const elements = document.getElementsByClassName(CLASS_KEY);
  const keyBack = elements[keyboard.indexOf('back')];
  for (let i = 0; i < WORDLEN; i += 1) {
    keyBack.click();
  }
  for (let i = 0; i < WORDLEN; i += 1) {
    const letterKey = elements[keyboard.indexOf(guessWord[i])];
    letterKey.click();
  }
}

async function clickEnterKey() {
  const elements = document.getElementsByClassName(CLASS_KEY);
  const keyEnter = elements[keyboard.indexOf('enter')];
  keyEnter.click();
  await sendTilePropsMessage();
}
