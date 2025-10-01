document.addEventListener("DOMContentLoaded", function () {
  const urlParams = new URLSearchParams(window.location.search);
  const isLogout = urlParams.get("logout");

  // Only auto-redirect if not logging out and rememberMe is true
  if (!isLogout) {
    const currentUser = JSON.parse(localStorage.getItem("currentUser"));
    const rememberMe = localStorage.getItem("rememberMe");

    if (currentUser && rememberMe === "true") {
      window.location.href = "home.html";
    }
  }

  // Clear the URL parameter
  if (isLogout) {
    window.history.replaceState({}, document.title, window.location.pathname);
  }
});

document.getElementById("authForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  function getuser() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  let users = getuser();
  const user = document.getElementById("username").value;
  const pass = document.getElementById("password").value;
  const rememberMe = document.getElementById("rememberMe").checked;

  let foundUser = users.find((u) => u.username === user && u.password === pass);
  if (foundUser) {
    if (rememberMe) {
      localStorage.setItem("rememberMe", JSON.stringify(foundUser));
    } else {
      localStorage.removeItem("rememberMe");
    }
    window.location.href = "home.html";
  } else {
    alert("Check Username and Password");
  }
  localStorage.setItem("currentUser", JSON.stringify(foundUser));
});

document.getElementById("guestLogin")?.addEventListener("click", function () {
  const guestUser = { username: "Guest", role: "guest" };
  localStorage.setItem("currentUser", JSON.stringify(guestUser));
  window.location.href = "home.html";
});
