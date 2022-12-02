import constants from "/constants.js";

chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
    console.log(`divCount: ${request.divCount}`);
    console.log(sender.tab ?
      "from a content script:" + sender.tab.url :
      "from the extension");
    sendResponse({farewell: "goodbye"});
  }
);
console.log("hello from popup.js");
console.log(constants.DATASTATE_EMPTY);

async function activateWordleTab() {
  const [tab] = await chrome.tabs.query({ url: constants.WORDLE_URL });
  if (tab) {
    await chrome.tabs.update(tab.id, { active: true, highlighted: true });
  } else {
    await chrome.tabs.create({ active: true, url: constants.WORDLE_URL });
  }
}

const gotoButton = document.querySelector("button");
gotoButton.addEventListener("click", activateWordleTab);
