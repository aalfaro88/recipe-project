var express = require('express');
var router = express.Router();
var userControl = require('./userControl');
var Recipe = require('../models/Recipe');

router.get('/', async function(req, res, next) {
  try {
    if (req.session.user) {
      const userId = req.session.user._id;
      const recipes = await Recipe.find({ user: userId });

      // Parse the ingredients field for each recipe
      const parsedRecipes = recipes.map((recipe) => {
        const parsedIngredients = JSON.parse(recipe.ingredients);
        return {
          ...recipe.toObject(),
          ingredients: parsedIngredients,
        };
      });

      res.render('userPage', { user: req.session.user, recipes: parsedRecipes });
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

const getEditRecipePage = async (req, res) => {
  try {
      const recipeId = req.params.id;
      const recipe = await Recipe.findById(recipeId);

      const ingredientsCheck = recipe.ingredients;

      const splitArray = ingredientsCheck.split(",");
      const correctedArray = splitArray.map((ingredient) => {
          const match = ingredient.match(/[\w\s.-]+/);
          return match ? match[0] : ingredient;
      });

      if (!recipe) {
          return res.render('error', { error: 'Recipe not found' });
      }

      const correctedItemsEdit = {
          ...recipe.toObject(),
          ingredients: correctedArray,
          user: req.session.user,
      };

      console.log(correctedArray);
      console.log(typeof correctedArray);

      console.log(recipe.steps);
      console.log(typeof recipe.steps);

      res.render('editRecipe', { recipe: correctedItemsEdit, isRecipePage: true });
  } catch (error) {
      console.error(error);
      res.render('error');
  }
};

router.get('/recipes/:id/edit', getEditRecipePage);


router.get('/recipes/:id/edit', getEditRecipePage);

router.post('/recipes/:id', async function(req, res, next) {
  try {
    const recipeId = req.params.id;
    const recipe = await Recipe.findById(recipeId);

    if (!recipe) {
      return res.render('error', { error: 'Recipe not found.' });
    }

    console.log('Original Recipe Ingredients:');
    console.log(JSON.parse(recipe.ingredients));
    console.log('Type:', typeof recipe.ingredients);

    console.log('Original Recipe Steps:');
    console.log(recipe.steps);
    console.log('Type:', typeof recipe.steps);

    const { name, minutes, steps, description, ingredients } = req.body;

    const updatedIngredientsArray = ingredients
      .split('\n')
      .map((ingredient) => ingredient.trim())
      .filter((ingredient) => ingredient !== '');

    console.log('Updated Recipe Ingredients:');
    console.log(updatedIngredientsArray);
    console.log('Type:', typeof updatedIngredientsArray);

    const updatedStepsArray = steps
      .split('\n')
      .map((step) => step.trim())
      .filter((step) => step !== '');

    console.log('Updated Recipe Steps:');
    console.log(updatedStepsArray);
    console.log('Type:', typeof updatedStepsArray);

    const ingredientsMatch = arrayEquality(JSON.parse(recipe.ingredients), updatedIngredientsArray);
    const stepsMatch = arrayEquality(recipe.steps, updatedStepsArray);

    console.log('Ingredients Match:', ingredientsMatch);
    console.log('Steps Match:', stepsMatch);


    recipe.name = name;
    recipe.minutes = minutes;
    recipe.description = description;
    recipe.ingredients = JSON.stringify(updatedIngredientsArray);
    recipe.steps = updatedStepsArray;
    await recipe.save();

    console.log('Recipe updated successfully');
    res.redirect('/users');


  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while updating the recipe' });
  }
});


function arrayEquality(arr1, arr2) {
  if (arr1.length !== arr2.length) {
    return false;
  }

  for (let i = 0; i < arr1.length; i++) {
    if (arr1[i] !== arr2[i]) {
      return false;
    }
  }

  return true;
}

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
