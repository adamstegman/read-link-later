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
  if (linkId) link.id = 'read-link-later-' + linkId;
  link.className = "read-link-later";
  link.href = "#";
  link.title = "Add to Instapaper";
  link.onclick = sendAddToInstapaperRequest;
  link.onmouseover = replaceBackgroundWithUnstarred;
  link.onmouseout = replaceBackgroundWithFadedUnstarred;
  
  var icon = document.createElement('i');
  icon.style.backgroundImage = "url(" + chrome.extension.getURL("images/unstarred-faded.png") + ")";
  
  var text = document.createElement('b');
  text.appendChild(document.createTextNode("Read Later"));
  
  var span = document.createElement('span');
  span.appendChild(icon);
  span.appendChild(text);
  
  link.appendChild(span);
  listElement.insertBefore(link, listElement.firstChild);
}

/**
 * Replaces the background of the previous element with the regular unstarred
 * image.
 *
 * @param {Event} event The Event object sent by the onmouseover event.
 */
function replaceBackgroundWithUnstarred(event) {
  var iconSpan = event.target.previousSibling;
  iconSpan.style.backgroundImage = "url(" + chrome.extension.getURL("images/unstarred.png") + ")";
}

/**
 * Replaces the background of the previous element with the faded unstarred
 * image.
 *
 * @param {Event} event The Event object sent by the onmouseout event.
 */
function replaceBackgroundWithFadedUnstarred(event) {
  var iconSpan = event.target.previousSibling;
  iconSpan.style.backgroundImage = "url(" + chrome.extension.getURL("images/unstarred-faded.png") + ")";
}

/**
 * Sends the request to the extension to add the URL to Instapaper.
 *
 * @param {Event} event The Event object sent by the onclick event.
 */
function sendAddToInstapaperRequest(event) {
  event.preventDefault();
  
  // Find URLs in tweet
  // span.status-body > ul.actions-hover > li > span.read-link-later > a
  var links = event.target.parentNode.parentNode.parentNode.parentNode.getElementsByClassName('tweet-url web'),
      linksLength = links.length;
  if (!linksLength) return;
  for (var i = 0; i < linksLength; i++) {
    request = {'action': 'addToInstapaper',
               'readLaterUrl': links[i].href,
               'senderId': event.target.id};
    chrome.extension.sendRequest(request, onInstapaperReturn);
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
  if (response && response.status && response.status == 201 && response.senderId) {
    var link = document.getElementById(response.senderId);
    link.onclick = absolutelyNothing;
    link.onmouseover = null;
    link.onmouseout = null;
    link.previousSibling.style.backgroundImage = "url(" + chrome.extension.getURL("images/starred.png") + ")";
  }
}

/**
 * Handles an event by making absolutely nothing happen. Calls
 * Event.preventDefault.
 */
function absolutelyNothing(event) {
  event.preventDefault();
}

// Prepend a "Read Later" link to the action lists of tweets with URLs.
var tweets = document.getElementsByClassName('stream-item'),
    tweetsLength = tweets.length;
for (var i = 0; i < tweetsLength; i++) {
  var tweet = tweets[i],
      statusBody = tweet.getElementsByClassName('tweet-text')[0],
      links = statusBody.getElementsByClassName('twitter-timeline-link');
  // Skip the status if it doesn't have a URL
  if (!links.length) continue;
  
  // Find the actions list (Reply, Retweet)
  var actionsList = tweet.getElementsByClassName('tweet-actions');
  if (!actionsList.length) continue;
  actionsList = actionsList[0];
  
  prependReadLaterLinkTo(actionsList, tweet.getAttribute('data-item-id'));
}