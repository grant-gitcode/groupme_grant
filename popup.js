var baseURL = "https://api.groupme.com/v3";
var token = "?token=";

//Get the access token from the background page.
var access_token = chrome.extension.getBackgroundPage().access_token;
token = token.concat(access_token);

//Hides the alert.
var postAlert = document.getElementById('alertID');
$(postAlert).hide();

var bod = document.getElementById('bod');
var div = document.getElementById('divHide');

var name = "";
var id = "";
var text = "";

//Get the GUID from the background.js page.
var count = chrome.extension.getBackgroundPage().count;

//Get everything nice and ready.
$(document).ready(queryGroupIndex(readyGroupList));

var groupInput = document.getElementById('groupInput');
var groupList = document.getElementById('groupList');
var optionalMessage = document.getElementById('optionalMessage');

//Now bring the user's focus to the window.
groupInput.focus();

//Add event listeners to the GroupMe group datalist and the text box.
groupInput.addEventListener('keypress',checkKeyPress);
optionalMessage.addEventListener('change',callAsyncPost);


//Function to post "GET" request to get all group data.
function queryGroupIndex(callback) {

  $.get(baseURL + "/groups" + token,
    {"per_page" : 100},
    callback);
}

/*This function accepts the GroupMe respnse from a "GET" request which uses the "/group" string.
 *Use the queryGroupIndex function to get the result object.
 */
function readyGroupList(result) {

    var groupNames = [];
    var groups = result.response;

    groups.forEach(function(group) {
      groupNames.push(group.name);
  });

    groupNames.forEach(function(group) {
      var option = document.createElement('option');
      option.value = group;
      groupList.appendChild(option);
    });

}

/*This function accepts the GroupMe respnse from a "GET" request which uses the "/group" string.
 *Use the queryGroupIndex function to get the result object.
 */
function findGroup(result) {

    //Gets the input value from the datalist element.
    var group = groupInput.value;
    var groups = result.response;


    var isFound = groups.some(function(option) {
      id = option.id;
      name = option.name;
      return name === group;
    });

    if(isFound) {
      postText();
    }
    if(!isFound) {
      onGroupNotFound();
    }

}

function postText() {

  //If the message has content, append a new line to it; else, do nothing.
  text = optionalMessage.value;

  if(text != "" && text != null) {

    //Creates the url to be sent.
    var url = baseURL + "/groups/" + id + "/messages" + token;

    //Creates the JSON object which will go with the POST request.
    var data = {
      "message" : {
        "source_guid" : count,
        "text" : text
      }
    }

    //Posts to the groupMe chat specified.
    $.ajax({
      type : 'POST',
      url : url,
      data : JSON.stringify(data),
      statusCode : {201 : postLink},
      error : onBadPost,
      dataType : 'json',
      contentType : 'application/json; charset=utf-8'
    });

  }
  else {
    postLink();
  }
}

function postLink() {
  //Creates the url to be sent.
  var url = baseURL + "/groups/" + id + "/messages" + token;

  //Increments count to avoid collisions.
  count++;

  //Gets the URL to share.
  chrome.tabs.query({
    "active" : true,
    "currentWindow" : true
  },function(tabs) {

    //Get the URL of the tab. Name it something different to not confuse it with GroupMe url.
    var sharedURL = tabs[0].url;

    //Creates the JSON object which will go with the POST request.
    var data = {
      "message" : {
        "source_guid" : count,
        "text" : sharedURL
      }
    }

    //Posts to the groupMe chat specified.
    $.ajax({
      type : 'POST',
      url : url,
      data : JSON.stringify(data),
      statusCode : {201 : onGoodPost},
      error : onBadPost,
      dataType : 'json',
      contentType : 'application/json; charset=utf-8'
    });
  });
}

function callAsyncPost() {
  queryGroupIndex(findGroup);
}

function checkKeyPress(e) {
  var key = e.keyCode || e.which;
  if(key == 13) {
    callAsyncPost();
  }
}

function onGoodPost() {

  $(div).hide();
  $(bod).css('background-color','#4da6ff');
  postAlert.innerHTML = "Link shared with " + name + ". Hooray!";
  $(postAlert).show().delay(2000).fadeOut(500,function() {
    window.close();
  });

  //Update the GUID and send data back to the background.js page
  count++;
  chrome.runtime.sendMessage({"count" : count});

}

function onBadPost() {

  $(div).hide();
  $(bod).css('background-color','#ff3333');
  postAlert.innerHTML = "Something went wrong with your link share!";
  $(postAlert).show().delay(2000).fadeOut(500,function() {
    window.close();
  });

  console.log('Bad post.');
}

function onGroupNotFound() {

  $(div).hide();
  $(bod).css('background-color','#ffff66');
  postAlert.innerHTML = "The requested group does not exist!";
  $(postAlert).show().delay(2000).fadeOut(500,function() {
    window.close();
  });

  console.log('Group not found.');
}
