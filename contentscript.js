/**
 * Parses the page's DOM for tweet elements containing URLs and returns an
 * Array of their action lists. Each element of the return Array can have a
 * "Read Later" link inserted.
 *
 * @return Array of Node, ul.actions-hover, for tweets with URLs.
 */
function findActionsForTweetsWithUrls() {
  var timeline = document.getElementById("timeline");
  if (!timeline) return; // need a timeline
  var actionsForStatusesWithUrls = new Array();
  var statuses = timeline.getElementsByClassName('status');
  var statusesLength = statuses.length;
  for (var s = 0; s < statusesLength; s++) {
    var status = statuses[s];
    
    // Find the status body
    var statusBody = status.getElementsByClassName('status-body');
    if (!statusBody.length) continue;
    statusBody = statusBody[0];
    
    // TODO: Skip the status if it doesn't have a URL
    
    // Find the actions hover list (Reply, Retweet)
    var actionsHoverList = statusBody.getElementsByClassName('actions-hover');
    if (!actionsHoverList.length) continue;
    actionsHoverList = actionsHoverList[0];
    
    actionsForStatusesWithUrls.push(actionsHoverList);
  }
  return actionsForStatusesWithUrls;
}

/**
 * Prepends a list item with a "Read Later" link to the given list element.
 *
 * @param {HTMLElement} listElement The ol or ul element to prepend the "Read
 *                                  Later" list item to.
 */
function prependReadLaterLinkTo(listElement) {
  // Create the Read Later link
  var link = document.createElement('a');
  link.href = "#";
  link.title = "Add to Instapaper";
  link.appendChild(document.createTextNode("Read Later"));
  link.onclick = sendAddToInstapaperRequest;
  
  var span = document.createElement('span');
  span.className = "read-tweet-later";
  span.appendChild(link);
  
  var li = document.createElement('li');
  li.appendChild(span);
  
  // FIXME
  listElement.insertBefore(li, listElement.firstChild);
}

/**
 * Sends the request to the extension to add the URL to Instapaper.
 *
 * @param {Event} event The Event object sent by the onclick event.
 */
function sendAddToInstapaperRequest(event) {
  chrome.extension.sendRequest({'action' : 'addToInstapaper',
                                'url' : "http://www.google.com/", // TODO
                                'element' : event.target},
                               onInstapaperReturn);
}

/**
 * Handles the Instapaper return status. On success, changes the display of
 * the "Read Later" link to notify the user it worked. On failure, alerts the
 * user.
 *
 * @param {Integer} status The HTTP status Instapaper returned.
 * @param {HTMLElement} element The HTMLElement to modify based on status.
 */
function onInstapaperReturn(status, element) {
  // TODO
}

// Prepend a "Read Later" link to the action lists of tweets with URLs.
findActionsForTweetsWithUrls().forEach(function (list) {
  prependReadLaterLinkTo(list);
});