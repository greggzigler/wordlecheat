import constants from "/constants.js";

async function currentTabIsWordle() {
  let queryOptions = {
    active: true,
    lastFocusedWindow: true,
    url: constants.WORDLE_URL
  };
  let [tab] = await chrome.tabs.query(queryOptions);
  return !!tab;
}

async function activateWordleTab() {
  const [tab] = await chrome.tabs.query({ url: constants.WORDLE_URL });
  if (tab) {
    await chrome.tabs.update(tab.id, { active: true, highlighted: true });
  } else {
    await chrome.tabs.create({ active: true, url: constants.WORDLE_URL });
  }
}

function colorCodeToColorTone(colorCode) {
  switch (colorCode) {
    case constants.COLORCODE_BLACK: return constants.COLORTONE_BLACK;
    case constants.COLORCODE_GREEN: return constants.COLORTONE_GREEN;
    case constants.COLORCODE_EMPTY: return constants.COLORTONE_EMPTY;
    case constants.COLORCODE_YELLOW: return constants.COLORTONE_YELLOW;
    case constants.COLORCODE_WHITE: return constants.COLORTONE_WHITE;
    default: console.log(`bad color code: ${colorCode}`); return null;
  }
}

async function addPreviousGuesses() {
  const data = await chrome.storage.local.get(["tileProps"]);
  const gTemplate = document.getElementById("guess_template");
  const lTemplate = document.getElementById("letter_template");

  const guessSet = new Set();
  data.tileProps.forEach(row => {
    const letterSet = new Set();
    row.forEach(tile => {
      const letterEl = lTemplate.content.firstElementChild.cloneNode(true);
      letterEl.textContent = tile.letter.toUpperCase();
      letterEl.style.background = colorCodeToColorTone(tile.color);
      letterSet.add(letterEl);
    });
    const guessEl = gTemplate.content.firstElementChild.cloneNode(true);
    guessEl.querySelector(".gclass").append(...letterSet);
    guessSet.add(guessEl);
  });
  document.querySelector("ul").append(...guessSet);
}

function addProposedGuesses() {
  const para = document.createElement("div");
  const node = document.createTextNode("TODO: addProposedGuesses");
  para.appendChild(node);
  document.body.appendChild(para);
}

function addGotoButton() {
  const title = document.getElementById("title");
  const para = document.createElement("div");
  const gotoButton = document.createElement("button");
  gotoButton.addEventListener("click", activateWordleTab);
  gotoButton.setAttribute("class", "goto-button");
  gotoButton.innerHTML = "Go To Wordle";
  para.appendChild(gotoButton);
  title.appendChild(para);
}

async function popupMain() {
  const isWordle = await currentTabIsWordle();
  if (isWordle) {
    await addPreviousGuesses();
    addProposedGuesses();
  } else {
    addGotoButton();
  }
};

await popupMain();
