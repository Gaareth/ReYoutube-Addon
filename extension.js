console.log("CAAAA")


function get_comments(video_id) {
    return fetch("http://localhost:5000/api/comments/get_comments/" + video_id, {method: 'GET'})
        .then(res => res.json());
}


window.onload = executeScript()

function executeScript() {
    console.log("loaded")

    const comments_disabled =
                    (document.querySelector("ytd-comments > ytd-item-section-renderer > #continuations").children.length <= 0)
    console.log("Comments disabled: " + comments_disabled)
    if (!comments_disabled) {
        return;
    }
    get_comments("dQw4w9WgXcQ").then((comments)=>{
        console.log(comments);
        console.log(generateComments(comments));
        document.querySelector("ytd-comments > ytd-item-section-renderer > #contents").appendChild(generateComments(comments));

    });


    generateHeader()
}


function generateComments(comments) {
    var comments_wrapper = document.createElement("div")

    for (var i = 0; i < comments.length; i++) {
        comment = comments[i];
        var comment_wrapper = document.createElement("div")
        var comment_content = document.createElement("p")
        comment_content.innerHTML = comment["comment"]

        comment_wrapper.appendChild(comment_content)


        if (comment["replies"].length > 0) {
            var comment_replies = document.createElement("div");
            comment_replies.className = "comment-replies";

            comment_replies.appendChild(generateComments(comment["replies"]))

            comment_wrapper.appendChild(comment_replies)
        }


        comments_wrapper.appendChild(comment_wrapper)
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