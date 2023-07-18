var express = require('express');
var router = express.Router();

var bcrypt = require('bcryptjs');

const salt = 10;

const User = require('../models/User')

router.get('/signup', (req, res, next) => {
    res.render('auth/signup.hbs')
})

router.post("/signup", (req, res, next) => {
    const { email, password, userName } = req.body;
  
    if (!userName || !email || !password) {
      res.render("auth/signup", { errorMessage: "All fields are mandatory." });
      return;
    }

    User.exists({ $or: [{ email }, { userName }] })
      .then((userExists) => {
        if (userExists) {

          res.render("auth/signup", { errorMessage: "Username or email is already in use." });
          return;
        }
  
        bcrypt
          .genSalt(salt)
          .then((salts) => {
            return bcrypt.hash(password, salts);
          })
          .then((hashedPass) => {
            return User.create({ email, password: hashedPass, userName });
          })
          .then((createdUser) => {
            console.log("Created user:", createdUser);
            res.redirect("/");
          })
          .catch((error) => {
            console.log("Error during registration:", error);
            next(error);
          });
      })
      .catch((error) => {
        console.log("Error during user lookup:", error);
        next(error);
      });
});

router.get('/login', (req, res, next) => {
    res.render('auth/login.hbs')
})


router.post('/login', (req, res, next) => {
    const { userName, password } = req.body;
  
    if (!userName || !password) {
      res.render('auth/login.hbs', {
        errorMessage: 'Please enter both username and password to login.'
      });
      return;
    }
   
    User.findOne({ userName })
      .then(user => {
        if (!user) {
          console.log("Username not registered.");
          res.render('auth/login.hbs', { errorMessage: 'User not found and/or password is incorrect.' });
          return;
        } else if (
          bcrypt.compareSync(password, user.password)) {
          
          req.session.user = user  
  
          console.log("Session:", req.session)
  
          res.redirect('/')
        } else {
          console.log("Incorrect password.");
          res.render('auth/login.hbs', { errorMessage: 'User not found and/or password is incorrect.' });
        }
      })
      .catch(error => next(error));
  });

router.get('/logout', (req, res, next) => {
    req.session.destroy(err => {
        if (err) next(err);
        res.redirect('/auth/login');
    });
    console.log("Session", req.session)
});

module.exports = router;