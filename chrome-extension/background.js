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

async function setBadge() {
  const isWordle = await currentTabIsWordle();
  if (isWordle) {
    chrome.action.setBadgeText({ text: "2315" });
    chrome.action.setBadgeBackgroundColor({ color: "#FF0000" });
  } else {
    chrome.action.setBadgeText({ text: "" });
    chrome.action.setBadgeBackgroundColor({ color: "#000000" });
  }
}

chrome.tabs.onActivated.addListener(setBadge);
chrome.tabs.onCreated.addListener(setBadge);
chrome.tabs.onUpdated.addListener(setBadge);
