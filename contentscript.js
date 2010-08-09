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
  link.onmouseover = replaceBackgroundWithUnstarred;
  link.onmouseout = replaceBackgroundWithFadedUnstarred;
  
  var iconSpan = document.createElement('span');
  iconSpan.className = "read-tweet-later-icon icon";
  iconSpan.style.backgroundImage = "url(" + chrome.extension.getURL("unstarred-faded.png") + ")";
  
  var span = document.createElement('span');
  span.className = "read-tweet-later";
  span.appendChild(iconSpan);
  span.appendChild(link);
  
  var li = document.createElement('li');
  li.appendChild(span);
  
  listElement.insertBefore(li, listElement.firstChild);
}

/**
 * Replaces the background of the previous element with the regular unstarred
 * image.
 *
 * @param {Event} event The Event object sent by the onmouseover event.
 */
function replaceBackgroundWithUnstarred(event) {
  var iconSpan = event.target.previousSibling;
  iconSpan.style.backgroundImage = "url(" + chrome.extension.getURL("unstarred.png") + ")";
}

/**
 * Replaces the background of the previous element with the faded unstarred
 * image.
 *
 * @param {Event} event The Event object sent by the onmouseout event.
 */
function replaceBackgroundWithFadedUnstarred(event) {
  var iconSpan = event.target.previousSibling;
  iconSpan.style.backgroundImage = "url(" + chrome.extension.getURL("unstarred-faded.png") + ")";
}

/**
 * Sends the request to the extension to add the URL to Instapaper.
 *
 * @param {Event} event The Event object sent by the onclick event.
 */
function sendAddToInstapaperRequest(event) {
  event.preventDefault();
  
  // Find URLs in tweet
  // span.status-body > ul.actions-hover > li > span.read-tweet-later > a
  var links = event.target.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('tweet-url web'),
      linksLength = links.length;
  if (!linksLength) return;
  for (var i = 0; i < linksLength; i++) {
    chrome.extension.sendRequest({'action': 'addToInstapaper',
                                  'readLaterUrl': links[i].href,
                                  'senderId': event.target.id},
                                 onInstapaperReturn);
  }
}

/**
 * Handles the Instapaper return status. On success, changes the display of
 * the "Read Later" link to notify the user it worked. On failure, alerts the
 * user.
 *
 * @param {Object} response The response object sent by the event handler.
 */
function onInstapaperReturn(response) {
  if (response && response.status && response.status == 200 && response.senderId) {
    var link = document.getElementById(response.senderId);
    link.onclick = null;
    link.onmouseover = null;
    link.onmouseout = null;
    link.previousSibling.style.backgroundImage = "url(" + chrome.extension.getURL("starred.png") + ")";
  }
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