var express = require("express");
// var reload = require("reload")
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

app.set("view engine", "ejs");

var urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.end("Hello!");
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
  });

app.get("/urls", (req, res) => {
  let templateVars = { urls: urlDatabase };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.post("/urls", (req, res) => {
  console.log(req.body,'x');  // debug statement to see POST parameters
  // res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
  res.send(req.body.longURL);
  urlDatabase[generateRandomString()] = req.body.longURL;
});

app.post("/urls/:id/delete", (req, res) => {
  console.log(req.body,'x');  // debug statement to see POST parameters
  delete urlDatabase[req.params.id];
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body,'y');  // debug statement to see POST parameters
  // console.log(req.body.longURL);
  urlDatabase[req.params.id] = req.body.longURL;
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id);
  let templateVars = { shortURL: req.params.id, urls: urlDatabase };
  res.render("urls_show", templateVars);
});


app.get("/hello", (req, res) => {
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
