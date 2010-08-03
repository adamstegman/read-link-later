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
    // TODO
  }
}