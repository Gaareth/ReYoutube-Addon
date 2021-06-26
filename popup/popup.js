var BASE_URL = "https://reyoutube.herokuapp.com"


window.addEventListener("load", async () => {
  let res = await fetch(BASE_URL + "/api/users/self/get_user");
  let user = await res.json();
  console.log(user);
  if (user.status !== 401) {
    //authenticated
    document.getElementById('login-section').style.display = "none";
    document.getElementById('status-section').style.display = "block";

    document.getElementById('current_username').textContent = user["username"];
    document.getElementById('current_profile_picture').src = user["profile_picture"];

  } else {
    document.getElementById('login-section').style.display = "block";
    document.getElementById('status-section').style.display = "none";
  }
});
