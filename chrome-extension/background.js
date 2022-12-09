import constants from "/constants.js";
import { Game } from "/game.js";
import alpha from "/wordlists/alpha.js";
import hefty from "/wordlists/hefty.js";
import rando from "/wordlists/rando.js";
import shmoo from "/wordlists/shmoo.js";

function getFullWordlist(algorithm) {
  let wordList = null;
  switch(algorithm) {
    case 'alpha': wordList = alpha; break;
    case 'hefty': wordList = hefty; break;
    case 'rando': wordList = rando; break;
    case 'shmoo': wordList = shmoo; break;
    default: wordList = ['error']; break;
  }
  console.log('b18', algorithm, wordList[0]);
  return wordList;
}

function getRemainingWordlist(algorithm, tileProps) {
  const { TODAY, WORDLEN } = constants;
  const fullWordlist = getFullWordlist(algorithm);
  const game = new Game(TODAY, WORDLEN, fullWordlist);
  tileProps.forEach(row => {
    const guess = row.map(tile => tile.letter.toLowerCase()).join('');
    const response = row.map(tile => tile.color).join('');
    game.applyFilter(guess, response);
  });
  console.log('b30', algorithm, game.wordList[0]);
  return game.wordList;
}

async function currentTabIsWordle() {
  const queryOptions = {
    active: true,
    lastFocusedWindow: true,
    url: constants.WORDLE_URL
  };
  const [tab] = await chrome.tabs.query(queryOptions);
  return !!tab;
}

async function setBadge() {
  const isWordle = await currentTabIsWordle();
  if (isWordle) {
    chrome.action.setBadgeText({ text: "Cheat" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
  } else {
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
  }
}

chrome.tabs.onActivated.addListener(setBadge);
chrome.tabs.onCreated.addListener(setBadge);
chrome.tabs.onUpdated.addListener(setBadge);

chrome.runtime.onMessage.addListener(
  async function(tileProps, sender, sendResponse) {
    sendResponse({
      message: `tiles:${tileProps.length}, tab:"${sender.tab.title}"`
    });
    // await chrome.storage.session.clear();

    let wordCount = -1;
    const nextGuess = {};
    Object.keys(constants.ALGORITHMS).forEach(algorithm => {
      const wordList = getRemainingWordlist(algorithm, tileProps);
      if (wordCount === -1) wordCount = wordList.length;
      nextGuess[algorithm] = wordList[0]; 
    });
    await chrome.storage.session.set({ tileProps });
    await chrome.storage.session.set({ wordCount });
    await chrome.storage.session.set({ nextGuess });
    console.log('b75', wordCount, JSON.stringify(nextGuess));
  }
);