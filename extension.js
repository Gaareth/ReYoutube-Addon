// noinspection CssInvalidHtmlTagReference,JSUnresolvedVariable

let executeScript = async () => {
  console.log("loaded");

  const commentsDisabled = document.querySelector("ytd-comments > ytd-item-section-renderer > #continuations").children.length === 0;
  console.log("Comments disabled: " + commentsDisabled);
  if (commentsDisabled) {
    return;
  }

  let res = await fetch("http://localhost:5000/api/comments/get_comments/" + "dQw4w9WgXcQ");
  let comments = await res.json;
  console.log(comments);
  console.log(generateComments(comments));
  document.querySelector("ytd-comments > ytd-item-section-renderer > #contents").appendChild(generateComments(comments));

  generateHeader();
}


function generateComments(comments) {
  let comments_wrapper = document.createElement("div");


  for (let comment of comments) {
    let comment_wrapper = document.createElement("div");
    let comment_content = document.createElement("p");
    comment_content.innerHTML = comment.comment;

    comment_wrapper.appendChild(comment_content);


    if (comment.replies.length > 0) {
      let comment_replies = document.createElement("div");
      comment_replies.className = "comment-replies";

      comment_replies.appendChild(generateComments(comment.replies));

      comment_wrapper.appendChild(comment_replies);
    }

    comments_wrapper.appendChild(comment_wrapper);
  }

  return comments_wrapper;
}

function generateHeader() {

  let count = document.createElement("h2");
  count.id = "count";
  count.className = "style-scope ytd-comments-header-renderer";
  count.style.color = "white";

  let count_content = document.createElement("span");
  count_content.className = "style-scope yt-formatted-string";
  count_content.innerHTML = "1337";

  let count_content_label = document.createElement("span");
  count_content_label.className = "style-scope yt-formatted-string";
  count_content_label.innerHTML = "Comments";

  count.appendChild(count_content);
  count.appendChild(count_content_label);

  document.querySelector("ytd-comments > ytd-item-section-renderer > #header").appendChild(count);
}

window.addEventListener("load", executeScript);