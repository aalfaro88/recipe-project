var express = require('express');
var router = express.Router();
var Recipe = require('../models/Recipe');

router.get('/:id', async (req, res, next) => {
    try {
      const recipeId = req.params.id;
      const recipe = await Recipe.findById(recipeId);
    
      if (!recipe) {
        return res.status(404).render('error', { error: 'Recipe not found' });
      }
    
    // Parse the ingredients field
    const parsedIngredients = JSON.parse(recipe.ingredients.replace(/'/g, '"'));
    const originalSteps = recipe.steps;
    const stepArray = arrayDefine(originalSteps);
    // Extract the first element from the original steps array
    //   console.log('Step Array:', stepArray);
    
    //   console.log('Formatted Steps:', formattedSteps);
    console.log('Type of Formatted Element:', typeof stepArray);
    console.log('Type of Formatted Element:', typeof parsedIngredients);
    
      const recipeWithParsedIngredients = {
        ...recipe.toObject(),
        ingredients: parsedIngredients,
        steps: stepArray,
        user: req.session.user,
      };
    
      res.render('recipePage', { recipe: recipeWithParsedIngredients });
    } catch (error) {
      console.error(error);
      res.status(500).render('error', {
        error: 'An error occurred while fetching the recipe',
      });
    }
  });
  
  function arrayDefine(originalSteps) {
    if (originalSteps.length <= 1) {
      const formattedSteps = originalSteps[0];
      return formattedSteps.split("'").slice(1, -1).filter((step) => /[a-zA-Z]/.test(step));
    } else {
      return originalSteps;
    }
  }
  

module.exports = router;
