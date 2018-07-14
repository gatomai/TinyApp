var express = require("express");
// var cookie = require("cookie-parser");
var session = require('cookie-session')
const bcrypt = require('bcryptjs');
// var reload = require("reload")
var app = express();
var PORT = 8080; // default port 8080

const bodyParser = require("body-parser");

// app.use(session());
app.use(session({
  name: 'session',
  keys: ['Rain-in-Spain', 'sdvsdf'],
  maxAge: 24 * 60 * 60 * 1000 // 24 hours
}));
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

//passwords: Stored for Testing ONLY
//"user2@example.com" "purple-monkey-dinosaur"
//"a@a.com" "dishwasher-funk"


const users = {
  "AAAAA": {
    id: "AAAAA",
    email: "user@example.com",
    password: "$2a$10$HLujcMUDftWaHYhtv6PnJ.jvrP/zlz9COe/Wh3x9GLOzbnhSa6LlO"
  },
  "BBBBB": {
    id: "BBBBB",
    email: "user2@example.com",
    password: "$2a$10$fiDwBuuSE8/TQAQgam3Ee.j1gaDY3Ank2nBiFRMDC1glmQimmfXni"
  },
  "abcde": {
    id: "abcde",
    email: "a@a.com",
    password: "$2a$10$.Q7n9m1OxPJkrol6TnYlY.IEkBoRPncr.Hl/xhygYdjGMC/npYXXi"
  }
};

app.get("/", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  res.end("Hello!");
});



app.get("/u/:id", (req, res) => {
  console.log(req.params,'g');
  // console.log(req.params.id,'g');
  // let longURL = urlForShortIs(req.params.id);
  let longURL = urlDatabase[req.session.user_id][req.params.id];
  console.log(longURL,'longURL in /u/:id');
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  console.log(res.body, 'b');
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  }
  console.log(req.session.user_id,'d');
  console.log(templateVars,'e');
  res.render("urls_signin", templateVars);
});

app.post("/register", (req, res) => {
  console.log(req.body, 'c');

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
    console.log(users[user_id], 'c');
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
  console.log(templateVars,'/urls');
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id,
    user: users[req.session.user_id]
  }
  console.log(templateVars,'/urls/new')
  res.render("urls_new", templateVars);
  // res.redirect('/urls');
});

app.get("/urls/:id", (req, res) => {
  let param = req.params.id;
  console.log(req.params.id,'f');
  console.log(req.session.user_id,'Session-user_id');  
  console.log(',XXXX',urlIsForUser(req.params.id));
  let templateVars = {
    // user_id: urlIsForUser(req.params.id),
    user_id: req.session.user_id,
    user: users[req.session.user_id],
    shortURL: req.params.id,
    urls: urlDatabase,
    // longURL : urlDatabase[req.session.user_id].param,
    urls: urlDatabase[req.session.user_id]
    // urls: Object.values(urlDatabase.req.session.user_id)
    };
  console.log(templateVars)
  res.render("urls_show", templateVars);
});

app.post("/urls", (req, res) => {
  // console.log(req.body, 'x');  // debug statement to see POST parameters
  // res.send(generateRandomString());         // Respond with 'Ok' (we will replace this)
  let templateVars = {
    user_id: req.session.user_id
  }
  
  let rando = generateRandomString();
  // console.log(rando,'Random String');
  let session_id = req.session.user_id;
  // console.log(session_id,'SessionID');
  // urlDatabase[generateRandomString()] = req.body.longURL;
  // console.log(urlDatabase[req.session.user_id],'Before');
  // urlDatabase[req.session.user_id][rando] = req.body.longURL;
  urlDatabase[session_id] = {[rando]: req.body.longURL};
  // console.log(urlDatabase[req.session.user_id],'After');
  res.set(req.body.longURL);
  // res.send(req.body.longURL);
  res.redirect('/urls');
});

app.post("/urls/:id/delete", (req, res) => {
  let templateVars = {
    user_id: req.session.user_id
  }
  console.log(req.body, 'x');  // debug statement to see POST parameters
  delete urlDatabase[req.session.user_id][req.params.id];
  res.redirect('/urls');
});

app.post("/urls/:id/update", (req, res) => {
  console.log(req.body, 'y');  // debug statement to see POST parameters
  let templateVars = {
    user_id: req.session.user_id
  }
  // console.log(req.body.longURL);
  urlDatabase[req.session.user_id][req.params.id] = req.body.longURL;
  res.redirect('/urls');
});

app.post("/login", (req, res) => {
  console.log(req.body, 'z');  // debug statement to see POST parameters
  // console.log(req.body.longURL);
  // urlDatabase[req.params.id] = req.body.longURL;
  // res.cookie(req.body.username, req.body.username, { domain: 'localhost', path: '/login', secure: true });
  let templateVars = {
    user_id: req.session.user_id
  }

  if (req.body.email.length === 0 || req.body.password.length === 0) {
    res.status(400);
    res.send('Email and/or Password cannot be blank');
  }

  for (let element in users) {
    if (req.body.email === users[element].email) {
      // if (req.body.password === users[element].password) {
        // console.log(users[element].password);
        // console.log(bcrypt.hashSync(req.body.password, 10));
        if (bcrypt.compareSync(req.body.password, users[element].password)) {
        // res.send('Email and password checks out');
        // res.cookie('userid', users[element].id);        
        req.session.user_id = users[element].id;
        console.log(req.session.user_id,'user_id')
        res.redirect('/urls');
      }
    }
  }

  for (let element in users) {
    console.log(users[element].email,'User Email');
    if (req.body.email !== users[element].email && (!(bcrypt.compareSync(req.body.password,users[element].password)))) {
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

  function urlIsForUser(id) {
    for(element in urlDatabase) {
      if (urlDatabase[element] = id)
      return element;
    }
  }

  function urlForShortIs(turl) {
    console.log(turl,'Within urlForShortIs');
    for(element in urlDatabase) {        
        let lurl = (urlDatabase[element][turl]);
        // console.log(element,urlDatabase[element][turl],turl)
        if (lurl !== undefined) {
            return "www.lg.com";
        }
    }
  }