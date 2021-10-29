/* eslint-disable no-underscore-dangle */
// jshint esversion:6
require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
// const date = require(__dirname + "/date.js");
const mongoose = require('mongoose');
const _ = require('lodash');
// const encrypt = require('mongoose-encryption');
// const md5 = require("md5");
// const bcrypt = require("bcrypt")
// const saltRounds = 10;
const session = require('express-session');
const passport = require('passport');
const passportLocalMongoose = require('passport-local-mongoose');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const findOrCreate = require('mongoose-findorcreate');

// mongoose.connect('mongodb+srv://admin-pmessan:S3UfUvw75mYHqSA@cluster0.zzddg.mongodb.net/webAppDB?retryWrites=true&w=majority', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.connect('mongodb://localhost:27017/userDB', { useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false });
mongoose.set('useCreateIndex', true);

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.use(session({
  secret: 'A simple secret',
  resave: false,
  saveUninitialized: false,
  // cookie: { secure: true }
}));

app.use(passport.initialize());
app.use(passport.session());

// const workItems = [];

// create schemas

const itemSchema = new mongoose.Schema({
  name: String,
});

const listSchema = new mongoose.Schema({
  title: String,
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  items: [itemSchema],
});

const userSchema = new mongoose.Schema({
  username: String,
  googleId: String,
  facebookId: String,
  password: String,
  lists: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'List',
  }],
});

// add plugins
userSchema.plugin(passportLocalMongoose);
userSchema.plugin(findOrCreate);

const Item = mongoose.model('item', itemSchema);

const List = mongoose.model('list', listSchema);

const User = mongoose.model('user', userSchema);

// use static authenticate method of model in LocalStrategy
passport.use(User.createStrategy());

// use static serialize and deserialize of model for passport session support
passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser((id, done) => {
  User.findById(id, (err, user) => {
    done(err, user);
  });
});

passport.use(new GoogleStrategy({
  clientID: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/google/todolist',
},
((accessToken, refreshToken, profile, cb) => {
  User.findOrCreate({ googleId: profile.id }, (err, user) => cb(err, user));
})));

const item1 = new Item({
  name: 'Welcome to the TodoList App',
});

const item2 = new Item({
  name: 'Hit the + button below to add an item',
});

const item3 = new Item({
  name: '<-- Tick the checkbox to delete an item',
});

const defaultItems = [item1, item2, item3];

app.get('/', (req, res) => {
  if (req.isAuthenticated()) {
    List.findOne({ user: req.user._id, title: 'Today' }, (err, foundItems) => {
      if (!foundItems) {
        // create and populate default list for user
        const newList = new List({ title: 'Today', user: req.user.id, items: defaultItems });
        newList.save();
        res.redirect('/');
      } else {
        res.render('list', { listTitle: foundItems.title, newListItems: foundItems.items });
      }
    });
  } else {
    res.redirect('/login');
  }
});

app.post('/', (req, res) => {
  const itemName = req.body.newItem;
  const listName = req.body.listTitle;

  const item = new Item({
    name: itemName,
  });

  if (req.isAuthenticated()) {
    List.findOne({ user: req.user._id, title: String(listName) }, (err, foundList) => {
      if (foundList) {
        foundList.items.push(item);
        foundList.save();
        res.redirect('/');
      } else {
        console.log(err);
      }
    });
  }
});

app.post('/delete', (req, res) => {
  const value = req.body.checkbox;
  const { customList } = req.body;

  // console.log(customList);

  // check which list the request is from

  if (req.isAuthenticated()) {
    List.findOneAndUpdate(
      { title: 'Today', user: req.user._id },
      { $pull: { items: { _id: value } } },
      (err, result) => {
        res.redirect('/');
      },
    );
  }
});

app.get('/auth/google',
  passport.authenticate('google', { scope: ['profile'] }));

app.get('/auth/google/todolist',
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect secrets.
    res.redirect('/');
  });

app.get('/auth/facebook', passport.authenticate('facebook'));

app.get('/auth/facebook/secrets',
  passport.authenticate('facebook', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect secrets.
    res.redirect('/secrets');
  });

app.route('/login')
  .get((req, res) => {
    res.render('login');
  })
  .post((req, res) => {
    const user = new User({
      username: req.body.username,
      password: req.body.password,
    });
    req.login(user, (err) => {
      if (err) {
        console.log(err);
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      }
    });
  });

app.route('/register')
  .get((req, res) => {
    res.render('register');
  })
  .post((req, res) => {
    User.register({ username: req.body.username }, req.body.password, (err, user) => {
      if (err) {
        console.log(err);
        res.redirect('/register');
      } else {
        passport.authenticate('local')(req, res, () => {
          res.redirect('/');
        });
      }
    });
  });

// app.get('/:newListName', (req, res) => {
//   const newListName = _.capitalize(req.params.newListName);

//   List.findOne({ name: newListName }, (err, foundList) => {
//     if (!err) {
//       if (foundList) {
//         // exists
//         res.render('list',
//           { listTitle: foundList.name, newListItems: foundList.items });
//       } else {
//         // Does not exist
//         const newList = new List({
//           name: newListName,
//           items: defaultItems,
//         });
//         newList.save();
//         res.render('list',
//           { listTitle: newList.name, newListItems: newList.items });
//         // res.redirect("/"+newListName)
//       }
//     }
//   });
// });

app.get('/about', (req, res) => {
  res.render('about');
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Server started on port 3000');
});
