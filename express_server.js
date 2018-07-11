var express = require("express");
var cookie = require("cookie-parser");
// var reload = require("reload")
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    username: req.cookies["username"],
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.render("urls_new",templateVars);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  console.log(req.body, 'x');  // debug statement to see POST parameters
  // res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
  let templateVars = {
    username: req.cookies["username"]
  }
  res.send(req.body.longURL);
  urlDatabase[generateRandomString()] = req.body.longURL;
});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  console.log(req.body, 'x');  // debug statement to see POST parameters
  delete urlDatabase[req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body, 'y');  // debug statement to see POST parameters
  let templateVars = {
    username: req.cookies["username"]
  }  
  // console.log(req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log(req.body, 'z');  // debug statement to see POST parameters
  // console.log(req.body.longURL);
  // urlDatabase[req.params.id] = req.body.longURL;
  // res.cookie(req.body.username, req.body.username, { domain: 'localhost', path: '/login', secure: true });
  let templateVars = {
    username: req.cookies["username"]
  }
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  let templateVars = {
    username: req.cookies["username"],
    shortURL: req.params.id, urls: urlDatabase
  };
  res.render("urls_show", templateVars);
});

app.get("/logout", (req, res) => {
  console.log(res.body,'a');
  res.clearCookie('username');
  res.redirect('/urls');
});

app.get("/hello", (req, res) => {
  let templateVars = {
    username: req.cookies["username"]
  }
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app =listening on port ${PORT}!`);
});

function generateRandomString() {
  return makeid();
}

function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (var i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
