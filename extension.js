console.log("[ReYoutube] Loaded ReYoutube Extension!");
var dom_contents = document.querySelector("ytd-comments > ytd-item-section-renderer > #contents");
var comments_loaded_counter = 1;

var sort_by = "rating";
var sort_direction = "desc";

var BASE_URL = "https://reyoutube.herokuapp.com"
//var BASE_URL = "http://localhost:5000"



function update_comment_votes(vote_info, c_id) {
    // Update Downvote Icon and count
    const downvote_icon = document.getElementById("comment-" + c_id + "-downvote-svg");

    //console.log("comment-" + c_id + "-downvote-count")
    const downvote_element = document.getElementById("comment-" + c_id + "-downvote-count");
    downvote_element.textContent = vote_info.downvotes;

    if (vote_info.has_downvoted) {
        downvote_icon.setAttribute("class", "comment-interaction-icon interacted-active");
    } else {
        downvote_icon.setAttribute("class", "comment-interaction-icon");
    }

    // Update Upvote Icon and count
    const upvote_icon = document.getElementById("comment-" + c_id + "-upvote-svg");

    const upvote_element = document.getElementById("comment-" + c_id + "-upvote-count");
    upvote_element.textContent = vote_info.upvotes;

    if (vote_info.has_upvoted) {
        upvote_icon.setAttribute("class", "comment-interaction-icon interacted-active");
    } else {
        upvote_icon.setAttribute("class", "comment-interaction-icon");
    }
}

function addReply(comment, parent_id) {
    let comment_replies = document.querySelector(`#replies-content[comment_id='${parent_id}']`);
    let comment_replies_wrapper = document.querySelector(`#replies[comment_id='${parent_id}']`);

    let reply_input = document.querySelector(`#reply-dialog[comment_id='${parent_id}']`);
    reply_input.setAttributeNode(document.createAttribute('hidden'));

    comment_replies.innerHTML += generateComment(comment);
    comment_replies.removeAttribute("hidden");
    comment_replies_wrapper.removeAttribute("hidden");
}

function send_post(url, data) {
    return fetch(url, {
        method: "POST",
        credentials: "include",
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
        },
    }).then((res) => res.json());
}

function get_self_profile_picture() {
    const url = BASE_URL + '/api/users/self/get_user';

    return fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(function(res) {
        return res.json().then(function(resp_json) {
            return resp_json;
        })
    })
}

function get_comment_by_id(comments, comment_id) {
    console.log(comment_id);
    console.log(comments);

    for (let i = 0; i < comments.length; i++) {
        if (comments[i].id == comment_id) {
            return comments[i];
        }
        return get_comment_by_id(comments[i].replies, comment_id);
    }
}


function showErrorOrCreate(error) {
  var comment_error_dom = document.querySelector("#comment-error");

        if (document.querySelector("#comment-error")) {
            comment_error_dom.textContent = error;
            return;
        }else {
            let errorMessage = document.createElement("div")
            errorMessage.id = "comment-error";
            errorMessage.className = "toolbar-error";
            errorMessage.style = "display: flex; justify-content: center;";

            errorMessage.textContent = error;
            var comment_renderer = document.querySelector("ytd-comments > ytd-item-section-renderer");
            comment_renderer.insertBefore(errorMessage, comment_renderer.firstChild);
        }
}

function loadComments() {
  var comment_error_dom = document.querySelector("#comment-error");

  var sentinel = document.querySelector('#sentinel-spinner');

  fetch(BASE_URL + "/api/comments/get_comments/paginated/", {
    method: "POST",
    body: JSON.stringify({
        video_id: "dQw4w9WgXcQ",
        counter: comments_loaded_counter,
        sort_by: sort_by,
        sort_direction: sort_direction
    }),
    headers: {
        'Content-Type': 'application/json'
    }


  }).then((response) => {
        if (response.status != 200) {
               showErrorOrCreate(response.status + ": " + response.statusText);
        }

        response.json().then((data) => {

        if (!data.length) {
            sentinel.textContent = "No more comments";
            return;
        }
        sentinel.innerHTML = "Loading..";
        if (comment_error_dom) {
            comment_error_dom.textContent = "";
        }

        generateComments2(data, data, undefined);
    });


  }).catch((error) => {
        showErrorOrCreate(error);
  });

}
let executeScript = async () => {

    let res = await fetch(BASE_URL + "/api/comments/get_comments/" + "dQw4w9WgXcQ");
    let comments = await res.json();

    document.querySelector("ytd-comments > ytd-item-section-renderer > #header").textContent = "";
    //document.querySelector("ytd-comments > ytd-item-section-renderer > #contents").innerHTML = "";
    //document.querySelector("ytd-comments > ytd-item-section-renderer > #contents").appendChild(generateComments(comments));
    generateHeader(comments);

}

function get_comment_vote_status(c_id) {
    const url = BASE_URL + '/api/comments/self/get_comment_vote_status/' + c_id;

    return fetch(url, {
        method: "GET",
        credentials: "include",
        headers: {
            "Content-Type": "application/json",
        },
    }).then(function(res) {
        return res.json().then(function(resp_json) {
            return resp_json;
        })
    })
}

function generateComment(comment, all_comments) {
    let comment_template = `
<div id="comment">
 <div id="body" class="style-scope ytd-comment-renderer">
    <div id="author-thumbnail" class="style-scope ytd-comment-renderer">
        <a class="yt-simple-endpoint style-scope ytd-comment-renderer" >
            <div fit="" height="40" width="40" class="style-scope ytd-comment-renderer no-transition yt-img-shadow" style="background-color: transparent;" loaded="">
                <img id="img" class="style-scope yt-img-shadow" alt="${comment.username}" src="${comment.user.profile_picture}" width="40" height="40">
            </div>
        </a>
    </div>
    <div id="main" class="style-scope ytd-comment-renderer">
        <div id="header" class="style-scope ytd-comment-renderer">
            <div id="header-badge" class="style-scope ytd-comment-renderer" hidden="">
                <div id="linked-comment-badge" class="style-scope ytd-comment-renderer" hidden=""></div>
                <div id="pinned-comment-badge" class="style-scope ytd-comment-renderer" hidden=""></div>
            </div>

            <div id="header-author" class="style-scope ytd-comment-renderer">
                <h3 class="style-scope ytd-comment-renderer">
                    <a id="author-text" class="yt-simple-endpoint style-scope ytd-comment-renderer">
                        <span class="style-scope ytd-comment-renderer">${comment.user.username}</span>
                    </a>
                </h3>

                <div class="published-time-text above-comment style-scope ytd-comment-renderer" has-link-only_="">
                    <a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false" dir="auto">
                        ${comment.created_at[1]}
                    </a>
                </div>

            </div>
        </div>

        <div id="expander" max-number-of-lines="4" class="style-scope ytd-comment-renderer" collapsed="" should-use-number-of-lines="" style="--ytd-expander-max-lines:4;">
            <div id="content" class="style-scope ytd-expander">

                <div id="content-text" class="style-scope ytd-comment-renderer yt-formatted-string show-hide-text wrapper" slot="content" split-lines="">
                    <p dir="auto" class="style-scope">

                        ${comment.comment}
                    </p>
                </div>
            </div>

            <tp-yt-paper-button id="less" aria-expanded="true" noink="" class="style-scope ytd-expander" role="button" tabindex="0" animated="" elevation="0" aria-disabled="false" hidden="">
                <span class="less-button style-scope ytd-comment-renderer" slot="less-button">Weniger anzeigen</span>
            </tp-yt-paper-button>

            <tp-yt-paper-button id="more" aria-expanded="false" noink="" class="style-scope ytd-expander" role="button" tabindex="0" animated="" elevation="0" aria-disabled="false">
                <span class="more-button style-scope ytd-comment-renderer" slot="more-button">Mehr anzeigen</span>
            </tp-yt-paper-button>

        </div>

        <div class="published-time-text below-comment style-scope ytd-comment-renderer" has-link-only_="" hidden="true">
            <a class="yt-simple-endpoint style-scope yt-formatted-string" spellcheck="false"  dir="auto">
                        ${comment.created_at[1]}
            </a>
        </div>

        <div class="style-scope ytd-comment-renderer ytd-comment-action-buttons" action-buttons-style="desktop-toolbar">
            <!--css-build:shady-->
            <div id="toolbar" class="style-scope ytd-comment-action-buttons-renderer">
               <button class="comment-interaction comment-vote" id="comment-upvote" comment_id="${comment.id}">
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"
                    class="style-scope comment-interaction-icon" id="comment-${comment.id}-upvote-svg">
                            <g class="style-scope"><path d="M1 21h4V9H1v12zm22-11c0-1.1-.9-2-2-2h-6.31l.95-4.57.03-.32c0-.41-.17-.79-.44-1.06L14.17 1 7.59 7.59C7.22 7.95 7 8.45 7 9v10c0 1.1.9 2 2 2h9c.83 0 1.54-.5 1.84-1.22l3.02-7.05c.09-.23.14-.47.14-.73v-1.91l-.01-.01L23 10z" class="style-scope yt-icon"></path></g>
                    </svg>
               </button>

               <span id="comment-${comment.id}-upvote-count"
               class="style-scope ytd-comment-action-buttons-renderer comment-interaction-span" aria-label="1060&nbsp;&quot;Mag ich&quot;-Bewertungen">
                    ${comment.upvotes}
               </span>

               <button class="comment-interaction comment-vote" id="comment-downvote" comment_id="${comment.id}">
                    <svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;"
                    class="style-scope comment-interaction-icon" id="comment-${comment.id}-downvote-svg">
                    <g class="style-scope yt-icon"><path d="M15 3H6c-.83 0-1.54.5-1.84 1.22l-3.02 7.05c-.09.23-.14.47-.14.73v1.91l.01.01L1 14c0 1.1.9 2 2 2h6.31l-.95 4.57-.03.32c0 .41.17.79.44 1.06L9.83 23l6.59-6.59c.36-.36.58-.86.58-1.41V5c0-1.1-.9-2-2-2zm4 0v12h4V3h-4z" class="style-scope yt-icon"></path></g></svg>
               </button>

                <span id="comment-${comment.id}-downvote-count" class="style-scope ytd-comment-action-buttons-renderer comment-interaction-span ">
                    ${comment.downvotes}
               </span>

               <button class="reply-button" comment_id="${comment.id}">
                    REPLY
               </button>
            </div>
            <div class="toolbar-error" id="toolbar-error-${comment.id}"></div>

            <div comment_id="${comment.id}" hidden="" id="reply-dialog" class="style-scope ytd-comment-action-buttons-renderer" style="display: flex;">
                 <div id="author-thumbnail" class="style-scope ytd-comment-renderer">
                    <a class="yt-simple-endpoint style-scope ytd-comment-renderer">
                        <div fit="" class="style-scope ytd-comment-renderer no-transition yt-img-shadow" style="background-color: transparent; width: 24px !important; height : 24px !important;" loaded="">
                            <img id="img" class="style-scope yt-img-shadow reply-img" alt="your profile picture" src="${comment.user.profile_picture}" width="24" height="24" comment_id="${comment.id}">
                        </div>
                    </a>
                </div>


                <div id="main" class="style-scope ytd-commentbox">
                    <div class="width: 100%;" style="display: flex; flex-direction: column; padding-bottom: 8px;">
                        <input id="reply-input" type="text" class="yt-input" placeholder="Add a public reply..." comment_id="${comment.id}">
                    </div>

                    <div id="footer" class="style-scope ytd-commentbox">
                        <button id="reply-cancel" class="btn-nobackground btn-big" type="button" comment_id="${comment.id}">
                            Cancel
                        </button>
                        <button id="reply-submit" class="btn-nobackground btn-big btn-submit" type="button" comment_id="${comment.id}">
                            Reply
                        </button>
                    </div>
                </div>
            </div>
        </div>

        <div id="moderation-buttons" class="style-scope ytd-comment-renderer" hidden=""></div>
        <ytd-button-renderer id="view-threaded-replies" aria-expanded="false" noink="" class="style-scope ytd-comment-renderer" use-keyboard-focused="" button-renderer="true"></ytd-button-renderer>
        <ytd-button-renderer id="hide-threaded-replies" aria-expanded="true" noink="" class="style-scope ytd-comment-renderer" use-keyboard-focused="" button-renderer="true"></ytd-button-renderer>
    </div>

    <div id="action-menu" class="style-scope ytd-comment-renderer">
        <ytd-menu-renderer class="style-scope ytd-comment-renderer" flexible-menu="">
            <!--css-build:shady-->
            <div id="top-level-buttons" class="top-level-buttons style-scope ytd-menu-renderer" hidden=""></div>
            <div id="top-level-buttons-computed" class="top-level-buttons style-scope ytd-menu-renderer"></div>
            <yt-icon-button id="button" class="dropdown-trigger style-scope ytd-menu-renderer" touch-feedback="">
                <!--css-build:shady--><button id="button" class="style-scope yt-icon-button" aria-label="Aktionsmenü">
  <yt-icon class="style-scope ytd-menu-renderer"><svg viewBox="0 0 24 24" preserveAspectRatio="xMidYMid meet" focusable="false" style="pointer-events: none; display: block; width: 100%; height: 100%;" class="style-scope yt-icon"><g class="style-scope yt-icon"><path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z" class="style-scope yt-icon"></path></g></svg><!--css-build:shady--></yt-icon>
</button>
                <yt-interaction id="interaction" class="circular style-scope yt-icon-button">
                    <!--css-build:shady-->
                    <div class="stroke style-scope yt-interaction"></div>
                    <div class="fill style-scope yt-interaction"></div>
                </yt-interaction>
            </yt-icon-button>
        </ytd-menu-renderer>
    </div>
</div>

     <div ${comment.replies.length == 0 ? "hidden=''" : ''} id="replies" class="style-scope ytd-comment-thread-renderer" comment_id="${comment.id}">
        <button id="more-replies" class="btn-nobackground" style="margin-left: 56px;" comment_id="${comment.id}">View ${comment.replies.length} replies</button>
        <div hidden="" id="replies-content" class="style-scope ytd-comment-thread-renderer" comment_id="${comment.id}"></div>
     </div>
</div>
`
    return comment_template;
}

function generateComments2(all_comments, comments, parent) {
        let comment_contents = document.querySelector("ytd-comments > ytd-item-section-renderer > #contents");
        if (parent != undefined) {
            comment_contents = document.querySelector(`#replies-content[comment_id="${parent.id}"]`);
        }

        for (let comment of comments) {
                if (comment.parent_id != null && parent === undefined) {
                    continue;
                }
               comment_contents.innerHTML += generateComment(comment, all_comments);

               if (comment.replies.length > 0) {
                  generateComments2(all_comments, comment.replies, comment);
               }

               comments_loaded_counter += 1;
        }

         for (let comment of comments) {

            document.querySelectorAll(`.comment-vote[comment_id="${comment.id}"]`).forEach(comment_vote_button => {
                    get_comment_vote_status(comment_vote_button.getAttribute("comment_id")).then(function(resp_json) {

                          if (resp_json.upvoted && comment_vote_button.id == "comment-upvote") {
                             let button_icon = comment_vote_button.querySelector(".comment-interaction-icon");
                             button_icon.classList.add("interacted-active");
                          }
                          else if (resp_json.downvoted && comment_vote_button.id == "comment-downvote") {
                             let button_icon = comment_vote_button.querySelector(".comment-interaction-icon");
                             button_icon.classList.add("interacted-active");
                          }

                    });

            });

        }
}

function registerEventListener() {
        document.addEventListener('click',function(e){
            if(e.target){
                    // Comment vote
                  if (e.target.classList.contains('comment-vote')) {
                    const url = e.target.getAttribute("id") == "comment-upvote" ? BASE_URL + '/api/comments/self/upvote_comment' : BASE_URL + '/api/comments/self/downvote_comment';

                        send_post(url, {
                            comment_id: e.target.getAttribute("comment_id"),
                        }).then(function (res) {
                            if (!res.isError) {
                                update_comment_votes(res, e.target.getAttribute("comment_id"));
                                document.querySelector(`#toolbar-error-${e.target.getAttribute('comment_id')}`).textContent = "";
                            }else {
                              document.querySelector(`#toolbar-error-${e.target.getAttribute('comment_id')}`).textContent = res.statusText;
                            }
                        });
                  }else if(e.target.id == 'reply-cancel') {
                        let reply_dialog = document.querySelector(`#reply-dialog[comment_id="${e.target.getAttribute('comment_id')}"]`);
                        if (reply_dialog.hasAttribute("hidden")) {
                            //show replies
                            reply_dialog.removeAttribute("hidden");

                        } else {
                            reply_dialog.setAttributeNode(document.createAttribute('hidden'));
                        }
                  }else if(e.target.id == 'reply-submit') {
                        let reply_input = document.querySelector(`#reply-input[comment_id="${e.target.getAttribute('comment_id')}"]`);
                        const url = BASE_URL + "/api/comments/self/add_reply";

                        send_post(url, {
                            parent_id: e.target.getAttribute("comment_id"),
                            comment_content: reply_input.value,
                        }).then(function (res) {
                            if (!res.isError && res.statusCode == 200) {
                                addReply(res.comment, e.target.getAttribute("comment_id"));
                            }else {
                              document.querySelector(`#toolbar-error-${e.target.getAttribute('comment_id')}`).textContent = res.statusText;
                            }
                        });
                  }else if(e.target.classList.contains('reply-button')) {
                        // Reply dialog opened
                        get_self_profile_picture().then((self_user)=> {
                                let reply_dialog = document.querySelector(`#reply-dialog[comment_id="${e.target.getAttribute('comment_id')}"]`);
                                let reply_dialog_img = document.querySelector(`.reply-img[comment_id="${e.target.getAttribute('comment_id')}"]`);
                                reply_dialog_img.src = self_user.profile_picture;

                                if (reply_dialog.hasAttribute("hidden")) {
                                    //show replies
                                    reply_dialog.removeAttribute("hidden");

                                } else {
                                    reply_dialog.setAttributeNode(document.createAttribute('hidden'));
                                }
                         });
                  }else if(e.target.id == 'more-replies') {
                        let replies_content = document.querySelector(`#replies-content[comment_id="${e.target.getAttribute('comment_id')}"]`);

                        if (replies_content.hasAttribute("hidden")) {
                            //show replies
                            replies_content.removeAttribute("hidden");
                            show_replies_button.textContent = `Hide ${replies_content.children.length} replies`

                        } else {
                            replies_content.setAttributeNode(document.createAttribute('hidden'));
                            show_replies_button.textContent = `View ${replies_content.children.length} replies`
                        }
                  }
             }
         });

}


function generateHeader(all_comments) {

  let count = document.createElement("h2");
  count.id = "count";
  count.className = "style-scope ytd-comments-header-renderer";
  count.style.color = "var(--yt-spec-text-primary)";

  let count_content = document.createElement("span");
  count_content.className = "style-scope yt-formatted-string";
  count_content.textContent = all_comments.length;
  count_content.style = "padding-right: 0.5rem;";

  let count_content_label = document.createElement("span");
  count_content_label.className = "style-scope yt-formatted-string";
  count_content_label.textContent = "Comments";

  count.appendChild(count_content);
  count.appendChild(count_content_label);

  let sort_option_wrapper = document.createElement("div");
  sort_option_wrapper.className = "dropdown-custom";

    let sort_option = document.createElement("button");
    sort_option.textContent = "Sort By";
    sort_option.className = "sort-btn btn-nobackground btn-big";

    let sort_option_dropdown = document.createElement("div");
    sort_option_dropdown.className = "dropdown-content-custom"

        let sort_option_time_asc = document.createElement("a");
                sort_option_time_asc.innerHTML = "Oldest first"
                sort_option_time_asc.id = "sort-option"
                sort_option_time_asc.setAttribute('sort_by', "upload_date");
                sort_option_time_asc.setAttribute('direction', "asc");

        let sort_option_time_desc = document.createElement("a");
                sort_option_time_desc.innerHTML = "Newest first"
                sort_option_time_desc.id = "sort-option"
                sort_option_time_desc.setAttribute('sort_by', "upload_date");
                sort_option_time_desc.setAttribute('direction', "desc");

        let sort_option_rating_asc = document.createElement("a");
                sort_option_rating_asc.innerHTML = "Lowest rating"
                sort_option_rating_asc.id = "sort-option"
                sort_option_rating_asc.setAttribute('sort_by', "rating");
                sort_option_rating_asc.setAttribute('direction', "asc");

        let sort_option_rating_desc = document.createElement("a");
                sort_option_rating_desc.innerHTML = "Top comments"
                sort_option_rating_desc.id = "sort-option"
                sort_option_rating_desc.setAttribute('sort_by', "rating");
                sort_option_rating_desc.setAttribute('direction', "desc");

        sort_option_dropdown.appendChild(sort_option_time_asc);
        sort_option_dropdown.appendChild(sort_option_time_desc);
        sort_option_dropdown.appendChild(sort_option_rating_asc);
        sort_option_dropdown.appendChild(sort_option_rating_desc);

    sort_option.appendChild(sort_option_dropdown);
  sort_option_wrapper.appendChild(sort_option);

  let header = document.querySelector("ytd-comments > ytd-item-section-renderer > #header");
  header.appendChild(count);
  header.appendChild(sort_option_wrapper);



  get_self_profile_picture().then((self_user) =>{
    const profile_picture = self_user.profile_picture;

    const comment_box = `
            <div id="comment-dialog" class="style-scope ytd-comment-action-buttons-renderer ytd-comment-action-buttons" style="display: flex; margin-bottom: 32px; margin-top: 24px;">
                   <div id="author-thumbnail" class="style-scope ytd-comment-renderer">
                        <a class="yt-simple-endpoint style-scope ytd-comment-renderer">
                            <div fit="" class="style-scope ytd-comment-renderer no-transition yt-img-shadow" style="background-color: transparent; width: 40px !important; height : 40px !important;" loaded="">
                                <img id="img" class="style-scope yt-img-shadow reply-img" alt="your profile picture" src="${profile_picture}" width="40" height="40" >
                            </div>
                        </a>
                   </div>


                <div id="main" class="style-scope ytd-commentbox">
                    <div class="width: 100%;" style="display: flex; flex-direction: column; padding-bottom: 8px;">
                        <input id="comment-input" type="text" class="yt-input" placeholder="Add a public comment..." >
                    </div>

                    <div class="toolbar-error" id="toolbar-error-submit"></div>


                    <div id="footer" class="style-scope ytd-commentbox">
                    <!--
                        <button id="comment-cancel" class="btn-nobackground btn-big" type="button" >
                            Cancel
                        </button>
                        -->
                        <button id="comment-send" class="btn-nobackground btn-big btn-submit" type="button">
                            Comment
                        </button>
                    </div>
                </div>
            </div>
         `

     header.innerHTML += comment_box;


    document.querySelectorAll("#sort-option").forEach(sort_button => {
        sort_button.addEventListener('click', (e)=>{
            sort_by = sort_button.getAttribute('sort_by');
            sort_direction = sort_button.getAttribute('direction');
            comments_loaded_counter = 0;
            document.querySelector("ytd-comments > ytd-item-section-renderer > #contents").innerHTML = "";
            // Setting the contents to "" will trigger the IntersectionObserver to reload the comments
        });
    });

     // Add comment button
    let send_comment_button = document.querySelector("#comment-send");
    send_comment_button.addEventListener('click', (e)=>{
            const url = BASE_URL + '/api/comments/self/add_comment';

            send_post(url, {
                video_id: 'dQw4w9WgXcQ',
                comment_content: document.querySelector("#comment-input").value
            }).then(function (res) {
                if (!res.isError) {

                    let self_comments = document.createElement("div");
                    self_comments.id = "self-comments";

                    let comments = document.querySelector("#contents");
                    comments.insertBefore(self_comments, comments.firstChild);

                    self_comments.innerHTML = generateComment(res.comment, all_comments);
                    document.querySelector("#toolbar-error-submit").textContent = "";
                    document.querySelector("#comment-input").value = "";
                }else {
                  document.querySelector("#toolbar-error-submit").textContent = res.statusText;
                }
            });
    });

  });

}


function observeDOM() {
    var intersectionObserver = new IntersectionObserver(entries => {

      // Uncomment below to see the entry.intersectionRatio when
      // the sentinel comes into view

      entries.forEach(entry => {
      })

      // If intersectionRatio is 0, the sentinel is out of view
      // and we don't need to do anything. Exit the function
      if (entries[0].intersectionRatio <= 0) {
        return;
      }
      //console.log("Intersection Observer");
      // Call the loadItems function
      loadComments();
    });

    let sentinel_dom = document.querySelector('#sentinel');
    if (!sentinel_dom) {
        let sections = document.querySelector("#sections");

        let sentinel = document.createElement("div");
        sentinel.id = "sentinel";
        sentinel.style = "display: flex; justify-content: center; font-size:2rem; color: var(--yt-spec-text-secondary);"

        let spinner_wrapper = document.createElement("div");
        spinner_wrapper.className = "";
        sentinel.appendChild(spinner_wrapper);

        let spinner = document.createElement("div");
        spinner.id = "sentinel-spinner";
        spinner.innerHTML = "Loading..";
        spinner_wrapper.appendChild(spinner);

        sections.appendChild(sentinel);
        sentinel_dom = document.querySelector('#sentinel');
    }


    // Instruct the IntersectionObserver to watch the sentinel
    intersectionObserver.observe(sentinel_dom);

}

var checkExist = setInterval(function() {
   if (document.querySelectorAll('ytd-comments > ytd-item-section-renderer > #continuations').length) {
      //console.log("[ReYoutube] Website is probably a youtube video");
      clearInterval(checkExist);

      const commentsDisabled = document.querySelector("ytd-comments > ytd-item-section-renderer > #continuations").children.length === 0;
      //console.log("[ReYoutube]  Comments disabled: " + commentsDisabled);
      if (!commentsDisabled) {
        return;
      }

      executeScript();
      observeDOM();
      registerEventListener();
   }
}, 300); // check every 100ms


