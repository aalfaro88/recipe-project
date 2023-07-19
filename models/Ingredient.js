const mongoose = require('mongoose');

const ingredientSchema = new mongoose.Schema({
    ingredient: { type: String, required: true, unique: true },
});
  
ingredientSchema.index({ ingredient: 'text' });
  
const Ingredient = mongoose.model('Ingredient', ingredientSchema);

module.exports = Ingredient;
