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
    req.body.selectedIngredients = req.body.ingredients;
    await userControl.createRecipe(req, res, next);
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

router.get('/recipes/:id/edit', userControl.getEditRecipePage);

router.post('/recipes/:id', async function(req, res, next) {
  try {
    const recipeId = req.params.id;
    const { name, minutes, steps, description, ingredients } = req.body;
    const recipe = await Recipe.findById(recipeId);
    if (!recipe) {
      return res.render('error', { error: 'Recipe not found.' });
    }
    recipe.name = name;
    recipe.minutes = minutes;
    recipe.ingredients = ingredients.trim().split('\n').map(line => line.trim());
    recipe.steps = steps.trim().split('\n').map((step) => step.trim());
    recipe.description = description;
    await recipe.save();
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    res.render('error');
  }
});

router.post('/recipes/:id/delete', async (req, res) => {
  const recipeId = req.params.id;

  try {
    const deletedRecipe = await Recipe.findByIdAndDelete(recipeId);

    if (!deletedRecipe) {
      return res.status(404).json({ error: 'Recipe not found.' });
    }

    res.redirect('/users');
  } catch (error) {
    console.error('Error deleting recipe:', error);
    res.status(500).json({ error: 'An error occurred while deleting the recipe.' });
  }
});

module.exports = router;
