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

    const regexConditions = searchTerms.map((term) => ({
      ingredients: { $regex: term, $options: 'i' },
    }));

    const recipes = await Recipe.find({ $or: regexConditions }).limit(40);

    const updatedRecipes = recipes.map((recipe) => {
      let matchedIngredients = 0;

      searchTerms.forEach((term) => {
        const matched = recipe.ingredients[0].includes(term);
        if (matched) {
          matchedIngredients++;
        }
      });

      return {
        ...recipe.toObject(),
        matchedIngredients,
        totalIngredients: searchTerms.length,
      };
    });

    updatedRecipes.sort((a, b) => {
      if (a.matchedIngredients !== b.matchedIngredients) {
        return b.matchedIngredients - a.matchedIngredients;
      } else if (a.matchedIngredients === 0) {
        return b.avg_rating - a.avg_rating;
      } else {
        const aRatio = a.matchedIngredients / a.totalIngredients;
        const bRatio = b.matchedIngredients / b.totalIngredients;
        return bRatio - aRatio;
      }
    });

    const numResults = updatedRecipes.length;
    const showLimitedResults = numResults > 40;

    res.render('searchByIngredient', {
      recipes: updatedRecipes,
      numResults,
      showLimitedResults,
      user: req.session.user,
    });
  } catch (error) {
    console.error(error);
    res.status(500).render('error', {
      error: 'An error occurred while searching for recipes.',
    });
  }
});



module.exports = router;
