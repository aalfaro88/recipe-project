var express = require('express');
var router = express.Router();
var userControl = require('./userControl');
var Recipe = require('../models/Recipe');


router.get('/', async function(req, res, next) {
  try {
    if (req.session.user) {
      const userId = req.session.user._id;
      const userRecipes = await Recipe.find({ user: userId });
      res.render('userPage', { user: req.session.user, recipes: userRecipes });
    } else {
      res.redirect('/auth/login');
    }
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});


router.get('/edit', userControl.getEditProfilePage);
router.post('/edit', userControl.updateProfile);

router.get('/recipes/new', userControl.getNewRecipePage);
router.post('/recipes', userControl.createRecipe);

module.exports = router;
