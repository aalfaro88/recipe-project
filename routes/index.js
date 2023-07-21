const express = require('express');
const router = express.Router();
const Recipe = require('../models/Recipe');


router.get('/', (req, res, next) => {
  Recipe.aggregate([
    { $match: { avg_rating: { $gt: 4.5 } } },
    { $sample: { size: 20 } },
  ])
    .then((recipes) => {
      res.render('index', { title: 'Home', user: req.session.user, recipes });
    })
    .catch((error) => {
      console.log('Error retrieving recipes:', error);
      next(error);
    });
});

router.get('/searchByName', async (req, res) => {
  try {
    const recipeName = req.query.name;
    const searchTerms = recipeName.split(' ');

    const regexConditions = searchTerms.map((term) => ({
      name: { $regex: term, $options: 'i' },
    }));

    const recipes = await Recipe.find({ $and: regexConditions });

    const numResults = recipes.length;
    const showLimitedResults = numResults > 40;

    res.render('searchByName', {
      recipes,
      numResults,
      showLimitedResults,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .render('error', { error: 'An error occurred while searching for recipes.' });
  }
});

router.get('/searchByIngredient', async (req, res) => {
  try {
    const ingredients = req.query.ingredients;
    const searchTerms = ingredients.split('\n').map((line) => line.trim()).filter((term) => term !== '');

    console.log('Search Terms:', searchTerms);
    console.log('Search Terms Type:', typeof searchTerms);


    const recipes = await Recipe.find().limit(20000).select('_id name ingredients avg_rating');
    console.log("FIRST RECIPE",recipes[0])

    const updatedRecipes = recipes.map((recipe) => {
      let temporalIngredients = [];

      try {
        temporalIngredients = JSON.parse(recipe.ingredients);
      } catch {
        temporalIngredients = recipe.ingredients.replace(/[\[\]']/g, '').split(',').map((ingredient) => ingredient.trim());
      }

      const matchedIngredients = temporalIngredients.filter((ingredient) => {
        const lowerIngredient = ingredient.toLowerCase();
        return searchTerms.some((term) => lowerIngredient === term.toLowerCase());
      }).length;
      

      const totalIngredients = searchTerms.length;

      const finalMatchedIngredients = Math.min(matchedIngredients, totalIngredients);

      return {
        ...recipe.toObject(),
        matchedIngredients: finalMatchedIngredients,
        totalIngredients,
      };
    });

    updatedRecipes.sort((a, b) => {
      if (a.matchedIngredients !== b.matchedIngredients) {
        return b.matchedIngredients - a.matchedIngredients;
      }
      return b.avg_rating - a.avg_rating;
    });
    

    const numResults = updatedRecipes.length;

    const delayTime = 1.5 * 1000;
    setTimeout(() => {
      const numRecipesToRender = 20;
      const recipesToRender = updatedRecipes.slice(0, numRecipesToRender);

      res.render('searchByIngredient', {
        recipes: recipesToRender,
        numResults,
        user: req.session.user,
      });
    }, delayTime);

  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      error: 'An error occurred while searching for recipes.',
    });
  }
});

module.exports = router;
