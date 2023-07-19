const { Schema, model } = require('mongoose');

const userSchema = new Schema(
  {
    email: String,
    userName: String,
    firstName: String,
    lastName: String,
    password: String,
    recipes: [{ type: Schema.Types.ObjectId, ref: 'Recipe' }], 
  },
  {
    timestamps: true,
  }
);

module.exports = model('User', userSchema);
