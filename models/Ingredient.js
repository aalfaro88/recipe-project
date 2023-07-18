const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
  ingredient: { type: String, required: true, unique: true },
});

const Ingredient = mongoose.model('Ingredient', ingredientSchema);
module.exports = Ingredient;
