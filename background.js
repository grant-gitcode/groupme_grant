var count;

init();

function init() {
  count = 0;
}

//Receive a message from the popup.js file to increment the count variable.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse) {
  count = message.count;
});

chrome.windows.onCreated.addListener(function(window) {
  chrome.runtime.sendMessage({msg: "new tab"});
});
