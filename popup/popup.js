function get_user() {
    return fetch("http://localhost:5000/api/users/self/get_user", {method: 'GET'})
        .then(res => res.json());

}

get_user().then((user) => {
console.log(user)
    if (user["status"] != 401) {

        document.getElementById('login-section').style.display= "none";
        document.getElementById('status-section').style.display= "block";

        document.getElementById('current_username').innerHTML = user["username"]
        document.getElementById('current_profile_picture').src = user["profile_picture"]

    }else {
        document.getElementById('login-section').style.display= "block";
        document.getElementById('status-section').style.display= "none";
    }
})


function test() {
    console.log("AHAH")
    fetch("http://localhost:5000/api/comments/upvote_comment", {method: 'POST'})
        .then(res => res.json())
        .then(res => console.log(res));
}
}

document.addEventListener("click", function(e) {
  if (e.target.classList.contains("test-click")) {
     test();
  }

});
