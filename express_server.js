var express = require("express");
var cookie = require("cookie-parser");
// var reload = require("reload")
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

app.use(cookie());
app.use(bodyParser.urlencoded({ extended: true }));

app.set("view engine", "ejs");

// app.use(function (req, res, next) {
//   console.log(req.method + ": " +req.path);
//   console.log(req.cookies);
//   console.log('- - - - - - - - - - - - - -');
//   console.log(users);
//   console.log('- - - - - - - - - - - - - -');
//   console.log(urlDatabase);
//   console.log('###########################');
//   next();
// });

const urlDatabase = {
  "userRandomID": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  "BBBBB": {
    "b2aVy9": "http://www.greenhouselabs.ca",
    "1se5qg": "http://www.google.in"
  },
  "abcde": {
    "f3t6za": "http://www.bluehouselabs.ca",
    "h7f8k4": "http://www.google.cn"
  }
};

const users = {
  "AAAAA": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "BBBBB": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  },
  "abcde": {
    id: "abcde",
    email: "a@a.com",
    password: "123"
  }
};

app.get("/", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"]
  }
  res.end("Hello!");
});

app.get("/urls/:id", (req, res) => {
  console.log(req.params.id,'f');
  console.log(',XXXX',urlIsForUser(req.params.id));
  let templateVars = {
    user_id: urlIsForUser(req.params.id),
    user: users[req.cookies["userid"]],
    shortURL: req.params.id,
    urls: urlDatabase[req.cookies["userid"]]
    };
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.get("/u/:id", (req, res) => {
  console.log(req.params.id,'g');
  let longURL = urlForShortIs(req.params.id);
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  console.log(res.body, 'b');
  let templateVars = {
    user_id: req.cookies["userid"],
    user: users[req.cookies["userid"]]
  }
  console.log(req.cookies["userid"],'d');
  console.log(templateVars,'e');
  res.render("urls_signin", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body, 'c');

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400);
    res.send('Email and/or Password cannot be blank');
  }

  for (var element in users) {
    if (req.body.email === users[element].email) {
      res.status(400);
      res.send('Email already exists');
    }
  }

  if (req.body.email.length > 0 && req.body.password.length > 0) {
    let userid = generateRandomString();
    users[userid] = { id: userid, email: req.body.email, password: req.body.password };
    console.log(users[userid], 'c');
    res.cookie('userid', users[userid].id);
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"]
  }
  res.render("login", templateVars);
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"]
  }
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"],
    user: users[req.cookies["userid"]],
    urls: urlDatabase[req.cookies["userid"]]
  };
  console.log(templateVars);
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"],
    user: users[req.cookies["userid"]]
  }
  res.render("urls_new", templateVars);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  console.log(req.body, 'x');  // debug statement to see POST parameters
  // res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
  let templateVars = {
    user_id: req.cookies["userid"]
  }
  res.send(req.body.longURL);
  var randy = generateRandomString();
  // urlDatabase[generateRandomString()] = req.body.longURL;
  urlDatabase[req.cookies["userid"]][randy] = req.body.longURL;
});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"]
  }
  console.log(req.body, 'x');  // debug statement to see POST parameters
  delete urlDatabase[req.cookies["userid"]][req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body, 'y');  // debug statement to see POST parameters
  let templateVars = {
    user_id: req.cookies["userid"]
  }
  // console.log(req.body.longURL);
  urlDatabase[req.cookies["userid"]][req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log(req.body, 'z');  // debug statement to see POST parameters
  // console.log(req.body.longURL);
  // urlDatabase[req.params.id] = req.body.longURL;
  // res.cookie(req.body.username, req.body.username, { domain: 'localhost', path: '/login', secure: true });
  let templateVars = {
    user_id: req.cookies["userid"]
  }

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400);
    res.send('Email and/or Password cannot be blank');
  }

  for (var element in users) {
    if (req.body.email === users[element].email) {
      if (req.body.password === users[element].password) {
        // res.send('Email and password checks out');
        res.cookie('userid', users[element].id);
        res.redirect('/urls');
      }
    }
  }

  for (var element in users) {
    if (req.body.email !== users[element].email && req.body.password !== users[element].password) {
        res.status(403);
        res.send('Email and/or Password is wrong');
    }
  }
});

app.get("/logout", (req, res) => {
  console.log(res.body, 'a');
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/hello", (req, res) => {
  let templateVars = {
    user_id: req.cookies["userid"]
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

  function urlIsForUser(id) {
    for(element in urlDatabase) {
      if (urlDatabase[element] = id)
      return element;
    }
  }

  function urlForShortIs(turl) {
    for(element in urlDatabase) {
        var lurl = (urlDatabase[element][turl]);
        if (lurl !== undefined) {
            return lurl;
        }
    }
  }