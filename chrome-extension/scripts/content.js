const CLASS_TITLE = "AppHeader-module_title__6sqs-";
const CLASS_BOARD = "Board-module_board__lbzlf";
const CLASS_ROW = "Row-module_row__dEHfN";
const CLASS_TILE = "Tile-module_tile__3ayIZ";
const TILEPROP_LETTER = "innerText";
const TILEPROP_DATASTATE = "data-state";
const DATASTATE_EMPTY = "empty";     // tile is empty (no letter, white background)
const DATASTATE_TBD = "tbd";         // tile has letter, but guess not submitted (white)
const DATASTATE_ABSENT = "absent";   // letter is absent from solution (black)
const DATASTATE_PRESENT = "present"; // letter is present but not in correct location (yellow)
const DATASTATE_CORRECT = "correct"; // letter is in correct location (green)

function addSubTitle(text) {
  const elements = document.getElementsByClassName(CLASS_TITLE);
  const title = elements[0];

  const para = document.createElement("div");
  const node = document.createTextNode(JSON.stringify(text));
  para.style.fontSize = "small";
  para.appendChild(node);

  title.appendChild(para);
}

function getTileProps(tileProp) {
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
        tileProps[rindex][tindex] = (tileProp === TILEPROP_LETTER)
          ? tile.innerHTML
          : dataState;
      }
    });
  });
  return tileProps;
}

function contentMain() {
  const letters = getTileProps(TILEPROP_LETTER);
  const dataStates = getTileProps(TILEPROP_DATASTATE);
  addSubTitle("I'm cheating!");
  console.log(JSON.stringify(letters));
  console.log(JSON.stringify(dataStates));
}

contentMain();
