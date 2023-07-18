const mongoose = require('mongoose');

const recipeSchema = new mongoose.Schema({
  name: { type: String, required: true },
  minutes: { type: Number },
  submitted: { type: Date },
  steps: { type: [String], required: true },
  description: { type: String , required: true },
  ingredients: { type: [String], required: true },
  avg_rating: { type: Number },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } 
});

const Recipe = mongoose.model('Recipe', recipeSchema);
module.exports = Recipe;
