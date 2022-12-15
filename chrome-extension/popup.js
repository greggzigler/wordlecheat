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
  const url = constants.WORDLE_URL;
  const [tab] = await chrome.tabs.query({ url });
  if (tab) {
    await chrome.tabs.reload(tab.id);
    await chrome.tabs.update(tab.id, { active: true, highlighted: true });
  } else {
    await chrome.tabs.create({ active: true, url });
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
  const result = await chrome.storage.session.get(["tileProps"]);
  if (!result || !result.tileProps) {
    console.log('did not get tileProps; hack by refreshing browser');
    return { isAllGreen: undefined, previousGuessCount: undefined };
  }

  let isAllGreen = !!result.tileProps.length;
  const gTemplate = document.getElementById("guess_template");
  const lTemplate = document.getElementById("letter_template");

  const guessSet = new Set();
  result.tileProps.forEach((row, rindex) => {
    const letterSet = new Set();
    isAllGreen = true; // the last row is the only one that matters
    row.forEach((tile, tindex) => {
      console.log('addPreviousGuesses', rindex, tindex, tile);
      if (tile.color !== constants.COLORCODE_GREEN) isAllGreen = false;
      const letterEl = lTemplate.content.firstElementChild.cloneNode(true);
      letterEl.textContent = tile.letter.toUpperCase();
      letterEl.style.background = colorCodeToColorTone(tile.color);
      letterSet.add(letterEl);
    });
    const guessEl = gTemplate.content.firstElementChild.cloneNode(true);
    guessEl.querySelector(".guess_class").append(...letterSet);
    guessSet.add(guessEl);
  });
  document.querySelector("ul").append(...guessSet);
  return { isAllGreen, previousGuessCount: guessSet.size };
}

function getUniqueWords(nextGuess) {
  const algDescs = constants.ALGORITHMS;
  const algorithms = Object.keys(algDescs);
  const algCount = algorithms.length;
  const { MAXBUTTONS } = constants;

  const uniqueWords = {};
  for (let i = 0; ; i += 1) {
    if (Object.keys(uniqueWords).length === MAXBUTTONS) break;
    const algorithm = algorithms[i % algCount];
    if (nextGuess[algorithm].length === 0) break;
    const guessWord = nextGuess[algorithm].shift();
    if (!uniqueWords[guessWord]) {
      uniqueWords[guessWord] = algorithm;
    }
  }
  return uniqueWords;
}

async function addProposedGuesses() {
  const trTemplate = document.getElementById("tablerow_template");
  const rdTemplate = document.getElementById("rowdata_template");
  const wcResult = await chrome.storage.session.get(["wordCount"]);
  const ngResult = await chrome.storage.session.get(["nextGuess"]);
  if (!wcResult || !wcResult.wordCount) return;
  if (!ngResult || !ngResult.nextGuess) return;

  const countText = `Possible Solutions: ${wcResult.wordCount}`;
  document.querySelector(".count_class").textContent = countText;
  document.querySelector(".subtitle_class").textContent = 'Proposed Guesses:';

  const guessSet = new Set();
  const uniqueWords = getUniqueWords(ngResult.nextGuess);
  const totalWords = Object.keys(uniqueWords).length;
  let tableRow = null;
  for (let i = 0; i < totalWords && i < constants.MAXBUTTONS; i += 1) {
    if (i % 2 === 0) {
      tableRow = trTemplate.content.firstElementChild.cloneNode(true);
    }
    const guessWord = Object.keys(uniqueWords)[i];
    const algorithm = uniqueWords[guessWord];

    const rowData =rdTemplate.content.firstElementChild.cloneNode(true);
    const buttons = rowData.getElementsByClassName("button_class");
    const button = buttons[0];
    button.textContent = guessWord;
    button.addEventListener("click", () => {
      const message = {
        id: "userClickedGuessInPopup",
        algorithm,
        guessWord
      };
      chrome.runtime.sendMessage(message);
      console.log(`clicked button ${algorithm} ${guessWord}`);
    });

    // each row can have up to 2 buttons
    tableRow.appendChild(rowData);
    if (i % 2 === 1) {
      guessSet.add(tableRow);
      tableRow = null;
    }
  }

  // if odd number of words, last row has only one word, so center it
  if (tableRow) {
    const rowCells = tableRow.getElementsByClassName("rowdata_class");
    const rowData = rowCells[0];
    rowData.setAttribute("colspan", "2");
    guessSet.add(tableRow);
  }
  document.querySelector("table").append(...guessSet);
}

function removeWordleOnly() {
  while (document.querySelectorAll(".wordle_only").length) {
    document.querySelectorAll(".wordle_only")[0].remove();
  }
}

async function clearWordleOnly() {
  const buttons = document.getElementsByClassName("popup-button");
  if (buttons.length) buttons[0].remove();

  while (document.getElementsByClassName("tablerow_class").length) {
    document.getElementsByClassName("tablerow_class")[0].remove();
  }

  while (document.getElementsByClassName("li_class").length) {
    document.getElementsByClassName("li_class")[0].remove();
  }
}

async function addFinalMessage(text) {
  const div = document.createElement("div");
  div.setAttribute("style", "text-align: center;");
  div.innerHTML = text;
  const bottom = document.getElementById("bottom_id");
  bottom.appendChild(div);
}

async function addCongratulations() {
  removeWordleOnly();
  const result = await chrome.storage.session.get(["tileProps"]);
  if (!result || !result.tileProps) return;
  const guessCount = result.tileProps.length;
  const text = `Congratulations! You solved it in ${guessCount} guesses!`;
  await addFinalMessage(text);
}

async function addConsolations() {
  const result = await chrome.storage.session.get(["wordCount"]);
  if (!result || !result.wordCount) return;
  const wordCount = result.wordCount;
  const text = wordCount === 1
    ? `Too bad! There was still 1 possible solution!`
    : `Too bad! There were still ${wordCount} possible solutions!`;
  await addFinalMessage(text);
}

function addButton(label, listener) {
  const bottom = document.getElementById("bottom_id");
  const div = document.createElement("div");
  const popupButton = document.createElement("button");
  popupButton.addEventListener("click", listener);
  popupButton.setAttribute("class", "popup-button");
  popupButton.innerHTML = label;
  div.appendChild(popupButton);
  bottom.appendChild(div);
}

function addGotoButton() {
  addButton("Go To Wordle", activateWordleTab);
}

const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds));
};

function addEnterButton() {
  addButton("Enter", async () => {
    const message = { id: "userClickedEnterInPopup" };
    chrome.runtime.sendMessage(message);

    await sleep(1000);  // TODO: replace sleep with event subscription
    clearWordleOnly();
    await sleep(3000);  // TODO: replace sleep with event subscription
    await popupMain();
  });
}

async function popupMain() {
  const isWordle = await currentTabIsWordle();
  if (isWordle) {
    const { isAllGreen, previousGuessCount } = await addPreviousGuesses();
    if (isAllGreen) {
      await addCongratulations();
    } else if (previousGuessCount === constants.MAXGUESSES) {
      await addConsolations();
    } else {
      await addProposedGuesses();
      addEnterButton();
    }
  } else {
    removeWordleOnly();
    addGotoButton();
  }
};

await popupMain();
