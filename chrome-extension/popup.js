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
    await chrome.tabs.reload(tab.id);
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
  const result = await chrome.storage.session.get(["tileProps"]);
  if (!result || !result.tileProps) {
    console.log('p37', 'did not get tileProps; hack by refreshing browser');
    return { isAllGreen: undefined, previousGuessCount: undefined };
  }

  let isAllGreen = true;
  const gTemplate = document.getElementById("guess_template");
  const lTemplate = document.getElementById("letter_template");

  const guessSet = new Set();
  result.tileProps.forEach(row => {
    const letterSet = new Set();
    isAllGreen = true; // the last row is the only one that matters
    row.forEach(tile => {
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

async function addProposedGuesses() {
  const descs = constants.ALGORITHMS;
  const guessSet = new Set();
  const tTemplate = document.getElementById("tablerow_template");
  const result = await chrome.storage.session.get(["wordCount", "nextGuess"]);
  if (!result || !result.wordCount || !result.nextGuess) return;

  let firstAlgorithm = true;
  for (const algorithm of Object.keys(descs)) {
    if (firstAlgorithm) {
      firstAlgorithm = false;
      const countText = `Possible Solutions: ${result.wordCount}`;
      document.querySelector(".count_class").textContent = countText;
      document.querySelector(".subtitle_class").textContent = 'Proposed Guesses';
    }
    const tElement = tTemplate.content.firstElementChild.cloneNode(true);
    const spanner = tElement.querySelector(".span_class");
    const button = tElement.querySelector(".button_class");
    spanner.textContent = algorithm;
    spanner.setAttribute("data-hover", descs[algorithm]);
    button.textContent = result.nextGuess[algorithm];
    console.log('p75', algorithm, result.nextGuess[algorithm]);
    guessSet.add(tElement);
  }
  document.querySelector("table").append(...guessSet);
}

function removeWordleOnly() {
  const wordleOnly = document.querySelectorAll(".wordle_only");
  for (const node of wordleOnly) {
    node.remove();
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
  const para = document.createElement("div");
  const gotoButton = document.createElement("button");
  gotoButton.addEventListener("click", listener);
  gotoButton.setAttribute("class", "goto-button");
  gotoButton.innerHTML = label;
  para.appendChild(gotoButton);
  bottom.appendChild(para);
}

function addGotoButton() {
  addButton("Go To Wordle", activateWordleTab);
}

function addEnterButton() {
  addButton("Enter", () => {
    const message = { id: "userPressedEnterInPopup" };
    chrome.runtime.sendMessage(message);
  });
}

async function popupMain() {
  console.log('p107', Date.now());
  const isWordle = await currentTabIsWordle();
  if (isWordle) {
    const { isAllGreen, previousGuessCount } = await addPreviousGuesses();
    if (isAllGreen) {
      await addCongratulations();
    } else if (previousGuessCount === constants.MAXATTS) {
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
