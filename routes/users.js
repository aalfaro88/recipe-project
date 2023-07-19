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

router.post('/recipes', async function(req, res, next) {
  try {
    req.body.selectedIngredients = req.body.ingredients.split(',').map((ingredient) => ingredient.trim());
    await userControl.createRecipe(req, res, next);
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

router.get('/recipes/:id/edit', async function(req, res, next) {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.render('error', { error: 'Recipe not found.' });
    }
    res.render('editRecipe', { recipe });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

router.post('/recipes/:id', async function(req, res, next) {
  try {
    const recipeId = req.params.id;
    const { name, minutes, steps, description } = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.render('error', { error: 'Recipe not found.' });
    }
    recipe.name = name;
    recipe.minutes = minutes;
    recipe.steps = steps.trim().split('\n').map((step) => step.trim());
    recipe.description = description;
    await recipe.save();
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});




module.exports = router;
