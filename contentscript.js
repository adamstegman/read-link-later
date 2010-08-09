/**
 * Prepends a list item with a "Read Later" link to the given list element.
 *
 * @param {HTMLElement} listElement The ol or ul element to prepend the "Read
 *                                  Later" list item to.
 * @param {Integer} linkId (Optional) An id to add to the link.
 */
function prependReadLaterLinkTo(listElement, linkId) {
  // Create the Read Later link
  var link = document.createElement('a');
  if (linkId) link.id = linkId;
  link.href = "#";
  link.title = "Add to Instapaper";
  link.appendChild(document.createTextNode("Read Later"));
  link.onclick = sendAddToInstapaperRequest;
  
  var span = document.createElement('span');
  span.className = "read-tweet-later";
  span.appendChild(link);
  
  var li = document.createElement('li');
  li.appendChild(span);
  
  listElement.insertBefore(li, listElement.firstChild);
}

/**
 * Sends the request to the extension to add the URL to Instapaper.
 *
 * @param {Event} event The Event object sent by the onclick event.
 */
function sendAddToInstapaperRequest(event) {
  chrome.extension.sendRequest({'action': 'addToInstapaper',
                                'readLaterUrl': 'http://www.google.com/', // TODO
                                'senderId': event.target.id},
                               onInstapaperReturn);
  event.preventDefault();
}

/**
 * Handles the Instapaper return status. On success, changes the display of
 * the "Read Later" link to notify the user it worked. On failure, alerts the
 * user.
 *
 * @param {Object} response The response object sent by the event handler.
 */
function onInstapaperReturn(response) {
  console.log("response", response);
}

// Prepend a "Read Later" link to the action lists of tweets with URLs.
var tweets = document.getElementsByClassName('status-body'),
    tweetsLength = tweets.length;
for (var i = 0; i < tweetsLength; i++) {
  var statusBody = tweets[i];
  // Skip the status if it doesn't have a URL
  var links = statusBody.getElementsByClassName('tweet-url web');
  if (!links.length) continue;
  
  // Find the actions hover list (Reply, Retweet)
  var actionsHoverList = statusBody.getElementsByClassName('actions-hover');
  if (!actionsHoverList.length) continue;
  actionsHoverList = actionsHoverList[0];
  
  prependReadLaterLinkTo(actionsHoverList,
                         statusBody.parentNode.id.replace('status', 'read-tweet-later'));
}