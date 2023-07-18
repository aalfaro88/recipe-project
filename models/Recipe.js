const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minutes: { type: Number },
  submitted: { type: Date },
  n_steps: { type: Number },
  steps: { type: [String], required: true },
  description: { type: String },
  ingredients: { type: [String], required: true },
  n_ingredients: { type: Number },
  avg_rating: { type: Number },
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
