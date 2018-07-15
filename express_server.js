//Require declarations and their instantiations

var express = require("express");
var app = express();

var session = require('cookie-session')
app.use(session({
  name: 'session',
  keys: ['Rain-in-Spain', 'sdvsdf'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));

const bcrypt = require('bcryptjs');

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({ extended: true }));

var PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// MIDDLEWARE DEBUGGER
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

//Declarations of User->URLDatabase
//Known Bug - Express is unable to read the first record properly, so a dummy record is inserted as the first.
const urlDatabase = {
  "ZZZZZ": {
    "b23Vy9": "http://hereistoday.com/",
    "1s35qg": "http://www.google.in"
  },
  "AAAAA": {
    "b2xVn2": "http://www.lighthouselabs.ca",
    "9sm5xK": "http://www.google.com"
  },
  "BBBBB": {
    "b2aVy9": "http://hereistoday.com/",
    "1se5qg": "http://www.google.in"
  },
  "abcde": {
    "f3t6za": "http://www.rainymood.com/",
    "h7f8k4": "http://www.google.cn"
  }
};

//passwords: Note to Mentor: Stored for your Testing ONLY
//"user2@example.com" "purple-monkey-dinosaur"
//"a@a.com" "dishwasher-funk"

//Declarations of User->Logins
const users = {
  "AAAAA": {
    id: "AAAAA",
    email: "user@example.com",
    password: bcrypt.hashSync("purple-monkey-dinosaur", 10)
  },
  "BBBBB": {
    id: "BBBBB",
    email: "user2@example.com",
    password: bcrypt.hashSync("dishwasher-funk", 10)
  },
  "abcde": {
    id: "abcde",
    email: "a@a.com",
    password: bcrypt.hashSync("123", 10)
  }
};

// Routes and Endpoints

app.get("/", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  res.end("Hello!");
});



app.get("/u/:id", (req, res) => {
  let longURL = urlDatabase[req.session.user_id][req.params.id];
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  }
  res.render("urls_signin", templateVars);
});

app.post("/register", (req, res) => {
  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400);
    res.send('Email and/or Password cannot be blank');
  }

  for (let element in users) {
    if (req.body.email === users[element].email) {
      res.status(400);
      res.send('Email already exists');
    }
  }

  if (req.body.email.length > 0 && req.body.password.length > 0) {
    let user_id = generateRandomString();
    users[user_id] = { id: user_id, email: req.body.email, password: bcrypt.hashSync(req.body.password) };
    req.session.user_id = users[user_id].id;
    res.redirect('/urls');
  }
});

app.get("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  res.render("login", templateVars);
});

app.get("/urls.json", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id],
    urls: urlDatabase[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  }
  res.render("urls_new", templateVars);
  res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let param = req.params.id;
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id],
    shortURL: req.params.id,
    urls: urlDatabase,
    urls: urlDatabase[req.session.user_id]
    };
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  
  let shortURL = generateRandomString();
  let session_id = req.session.user_id;
  let longURL = req.body.longURL;
  if (checkUserURLDb(session_id)) {
    urlDatabase[session_id][shortURL] = longURL;
  } else {
    urlDatabase[session_id] = {
      [shortURL]: longURL
    };    
  }  
  res.set(req.body.longURL);
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  delete urlDatabase[req.session.user_id][req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400);
    res.send('Email and/or Password cannot be blank');
  }

  for (let element in users) {
    if (req.body.email === users[element].email) {
        if (bcrypt.compareSync(req.body.password, users[element].password)) {
        req.session.user_id = users[element].id;
        res.redirect('/urls');
      }
    }
  }

  for (let element in users) {
    if (req.body.email !== users[element].email && (!(bcrypt.compareSync(req.body.password,users[element].password)))) {
        res.status(403);
        res.send('Email and/or Password is wrong');
    }
  }
});

app.get("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect('/login');
});

app.get("/hello", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  res.end("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app =listening on port ${PORT}!`);
});

function generateRandomString() {
  return makeid();
}

//Function used from External Source
function makeid() {
  let text = "";
  let possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for (let i = 0; i < 5; i++)
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}

//Function to return the User associated with the Short URL
//Deprecated due to Cookies functionality
  function urlIsForUser(id) {
    for(element in urlDatabase) {
      if (urlDatabase[element] = id)
      return element;
    }
  }

  function checkUserURLDb(user_in) {
    for(user in urlDatabase) {
      if (user === user_in)
      return true;
    }
    return false;
  }