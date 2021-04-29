window.addEventListener("load", async () => {
  let res = await fetch("http://localhost:5000/api/users/self/get_user");
  let user = await res.json();
  console.log(user);
  if (user.status !== 401) {

    document.getElementById('login-section').style.display = "none";
    document.getElementById('status-section').style.display = "block";

    document.getElementById('current_username').innerHTML = user["username"];
    document.getElementById('current_profile_picture').src = user["profile_picture"];

  } else {
    document.getElementById('login-section').style.display = "block";
    document.getElementById('status-section').style.display = "none";
  }
});

async function test() {
  console.log("AHAH");
  let res = await fetch("http://localhost:5000/api/comments/upvote_comment", {method: 'POST'});
  let json = await res.json();
  console.log(json)
}

document.addEventListener("click", e => {
  if (e.target.classList.contains("test-click")) {
    test();
  }
});
