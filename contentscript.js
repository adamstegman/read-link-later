/**
 * Parses the page's DOM for tweet elements containing URLs. For each tweet
 * containing a URL, inserts a "Read Later" link that will add the URL in
 * the tweet to the user's Instapaper queue.
 */
function findTweetsWithUrls() {
  var timeline = document.getElementById("timeline");
  if (!timeline) return; // need a timeline
  var statuses = timeline.childNodes;
  var statusesLength = statuses.length;
  for (var s = 0; s < statusesLength; s++) {
    var status = statuses.item(s);
    
    // Find the status body
    var statusBody;
    var statusChildren = status.childNodes;
    var statusChildrenLength = statusChildren.length;
    for (var c = 0; c < statusChildrenLength; c++) {
      var child = statusChildren.item(c);
      if (child.classname == "status-body") {
        statusBody = child;
        break;
      }
    }
    if (!statusBody) continue;
    
    // TODO: Skip the status if it doesn't have a URL
    
    // Find the actions hover list (Reply, Retweet)
    var actionsHoverList;
    var statusBodyChildren = statusBody.childNodes;
    var statusBodyChildrenLength = statusBodyChildren.length;
    for (var c = 0; c < statusBodyChildrenLength; c++) {
      var child = statusBodyChildren.item(c);
      if (child.classname == "actions-hover") {
        actionsHoverList = child;
        break;
      }
    }
    if (!actionsHoverList) continue;
    
    prependReadLaterLinkTo(actionsHoverList);
  }
}

/**
 * Prepends a list item with a "Read Later" link to the given list element.
 *
 * @param {Node} listElement The ol or ul element to prepend the "Read Later"
 *                           list item to.
 */
function prependReadLaterLinkTo(listElement) {
  
}