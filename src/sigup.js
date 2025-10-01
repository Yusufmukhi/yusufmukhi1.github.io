document.getElementById("signupForm")?.addEventListener("submit", function (e) {
  e.preventDefault();

  function getuser() {
    return JSON.parse(localStorage.getItem("users")) || [];
  }

  function savesuser(users) {
    localStorage.setItem("users", JSON.stringify(users));
  }

  const username = document.getElementById("username").value;
  const email = document.getElementById("email").value;
  const password = document.getElementById("password").value;
  const cpassword = document.getElementById("cpassword").value;

  let users = getuser();

  if (users.some((u) => u.username === username)) {
    alert("Username is already exists");
    return;
  } else if (users.some((u) => u.email === email)) {
    alert("Email already exists");
    return;
  }

  if (password !== cpassword) {
    alert("Passwords do not match");
    return;
  }

  users.push({
    username: username,
    email: email,
    password: password,
  });

  savesuser(users);
  alert("Signup successful!");
  
});
