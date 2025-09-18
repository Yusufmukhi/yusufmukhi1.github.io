import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import cookieParser from "cookie-parser"; // Add this import

const app = express();
const port = 3000;

// __dirname workaround for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.urlencoded({ extended: true })); // for form data
app.use(express.json()); // for JSON data
app.use(cookieParser()); // Add this after express.json()

// Tell Express to use EJS and look inside src for views
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "src"));

app.get("/", (req, res) => {
  // Check if user is remembered
  if (req.cookies.email === "yusufmukhi1@gmail.com") {
    return res.render("home.ejs");
  }
  res.render("hi.ejs");
});

app.post("/", (req, res) => {
  const email = req.body.email;
  const remember = req.body.remember; // Assume your form has a 'remember' checkbox
  if (email === "yusufmukhi1@gmail.com") {
    if (remember) {
      // Set cookie for 7 days
      res.cookie("email", email, { maxAge: 7 * 24 * 60 * 60 * 1000 });
    }
    return res.render("home.ejs");
  }
  res.render("hi.ejs");
});
app.get("/logout", (req, res) => {
  res.clearCookie("email");
  res.redirect("/");
});
app.get("/:slug", (req, res) => {
  res.render(`${req.params.slug}.ejs`);
});
app.post("/expenses", (req, res) => {});
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
