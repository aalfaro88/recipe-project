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

module.exports = router;
