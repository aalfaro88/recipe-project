var express = require('express');
var router = express.Router();
var userControl = require('./userControl');

router.get('/', function(req, res, next) {
  if (req.user) {
    res.render('userPage', { user: req.user });
  } else {
    res.redirect('/auth/login');
  }
});


module.exports = router;
