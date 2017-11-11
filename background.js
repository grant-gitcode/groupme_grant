var count;
var access_token;

init();

function init() {
  count = 0;
}

//Receive a message from the popup.js file to increment the count variable.
chrome.runtime.onMessage.addListener(function(message,sender,sendResponse) {
  count = message.count;
});

//On start up, check to see if the user has already signed in; if not, go ahead and have them do so.
chrome.storage.sync.get("groupme_token", function(result) {

  if(!result.groupme_token) {
    chrome.identity.launchWebAuthFlow(
      {
      'url': 'https://oauth.groupme.com/oauth/authorize?client_id=ZkKPOxsolzZrPWNKW1U0pV8jT4cJg77cfdZABncXqU9NgMqB&redirect_uri=https://https://iekedbfkafeemmokeckbgdllkcbnmhoc.chromiumapp.org/&response_type=token',
      'interactive': true
      },
      function(redirect_url) {
        var token = redirect_url.split("=")[1];
        chrome.storage.sync.set({"groupme_token" : token});
        access_token = token;
      }
    );
  } else {
    //Receives the token message from the background.js page from the user's authentication.
    chrome.storage.sync.get("groupme_token", function(result) {
      access_token = result.groupme_token;
    });
  }
});
