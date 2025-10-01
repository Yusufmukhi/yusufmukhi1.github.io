

document.getElementById("signupForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  function getuser() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  function savesuser(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  const username = document.getElementById("username").value.trim();
  const email = document.getElementById("email").value.trim();
  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("cpassword").value;

  let users = getuser();

  // Check if username already exists
  if (users.some((u) => u.username === username)) {
    alert("Username already exists");
    return;
  }
  // Check if email already exists
  else if (users.some((u) => u.email === email)) {
    alert("Email already exists");
    return;
  }

  // Check password match
  if (password !== cpassword) {
    alert("Passwords do not match");
    return;
  }

  // Save new user
  const newUser = {
    username: username,
    email: email,
    password: password,
    role: "user", // default role
  };

  users.push(newUser);
  savesuser(users);

  // Automatically log in the new user
  localStorage.setItem("currentUser", JSON.stringify(newUser));

  alert("Signup successful! Redirecting to Home...");
  window.location.href = "home.html";
});
