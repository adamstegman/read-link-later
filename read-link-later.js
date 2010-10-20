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
  link.className = "read-link-later";
  if (linkId) {
    link.className += " read-link-later-" + linkId;
    link.setAttribute('data-tweet-id', linkId);
  }
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
 * Given an event target, traverses up the DOM to find its parent anchor tag.
 *
 * @param {HTMLElement} target An element that is a descendant of an anchor.
 *
 * @return {HTMLElement} The closest anchor ancestor of target.
 */
function findAnchorFromTarget(target) {
  // just in case
  if (!target) return target;
  
  if (target.tagName == 'A') return target;
  else return findAnchorFromTarget(target.parentNode);
}

/**
 * Replaces the background of the previous element with the regular unstarred
 * image.
 *
 * @param {Event} event The Event object sent by the onmouseover event.
 */
function replaceBackgroundWithUnstarred(event) {
  var icon = findAnchorFromTarget(event.target).getElementsByTagName('i')[0];
  icon.style.backgroundImage = "url(" + chrome.extension.getURL("images/unstarred.png") + ")";
}

/**
 * Replaces the background of the previous element with the faded unstarred
 * image.
 *
 * @param {Event} event The Event object sent by the onmouseout event.
 */
function replaceBackgroundWithFadedUnstarred(event) {
  var icon = findAnchorFromTarget(event.target).getElementsByTagName('i')[0];
  icon.style.backgroundImage = "url(" + chrome.extension.getURL("images/unstarred-faded.png") + ")";
}

/**
 * Sends the request to the extension to add the URL to Instapaper.
 *
 * @param {Event} event The Event object sent by the onclick event.
 */
function sendAddToInstapaperRequest(event) {
  event.preventDefault();
  
  // Find URLs in tweet
  // div.tweet-content > div.tweet-row > span.tweet-actions > a.read-link-later
  var readLinkLaterAnchor = findAnchorFromTarget(event.target),
      links = readLinkLaterAnchor.parentNode.parentNode.parentNode.getElementsByClassName('twitter-timeline-link');
  for (var i = 0, linksLength = links.length; i < linksLength; i++) {
    request = {'action': 'addToInstapaper',
               'readLaterUrl': links[i].href,
               'senderId': 'read-link-later-' + readLinkLaterAnchor.getAttribute('data-tweet-id')};
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
    var links = document.getElementsByClassName(response.senderId);
    for (var i = 0, linksLength = links.length; i < linksLength; i++) {
      var link = links[i];
      link.onclick = absolutelyNothing;
      link.onmouseover = null;
      link.onmouseout = null;
      link.getElementsByTagName('i')[0].style.backgroundImage = "url(" + chrome.extension.getURL("images/starred.png") + ")";
    }
  }
}

/**
 * Handles an event by making absolutely nothing happen. Calls
 * Event.preventDefault.
 */
function absolutelyNothing(event) {
  event.preventDefault();
}

/**
 * Prepend a "Read Later" link to the action lists of tweets with URLs.
 */
function findAndPrependLinksToTweets() {
  var tweets = document.getElementsByClassName('tweet');
  for (var i = 0, tweetsLength = tweets.length; i < tweetsLength; i++) {
    var tweet = tweets[i],
        statusBody = tweet.getElementsByClassName('tweet-text')[0],
        links = statusBody.getElementsByClassName('twitter-timeline-link');
    // Skip the status if it doesn't have a URL
    if (!links.length) continue;
  
    // Find the actions list (Reply, Retweet)
    var actionsList = tweet.getElementsByClassName('tweet-actions');
    if (!actionsList.length) continue;
    actionsList = actionsList[0];
    // Skip the status if it already has a read link later link
    if (actionsList.getElementsByClassName('read-link-later').length) continue;
  
    prependReadLaterLinkTo(actionsList, tweet.getAttribute('data-tweet-id'));
  }
  
  // Set this function to run again.
  // TODO: Better way of doing this? Events?
  setTimeout(findAndPrependLinksToTweets, 100);
}

findAndPrependLinksToTweets();