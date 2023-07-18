const User = require('../models/User');
const Recipe = require('../models/Recipe');

const getUserPage = async (req, res) => {
  try {
    console.log('User session:', req.session);
    const user = await User.findById(req.user.id);
    const recipes = await Recipe.find({ user: req.user.id });

    res.render('userPage', { user, recipes });
  } catch (error) {
    console.error(error);
    res.render('error');
  }
};

const getEditProfilePage = (req, res) => {
  res.render('editProfile', { user: req.session.user });
};

const updateProfile = async (req, res) => {
  const { firstName, lastName } = req.body;
  try {
    const user = await User.findById(req.session.user._id);
    user.firstName = firstName;
    user.lastName = lastName;
    await user.save();
    req.session.user = user;
    res.redirect('/users');
  } catch (error) {
    console.error(error);
    res.render('error');
  }
};

const getNewRecipePage = (req, res) => {
    res.render('newRecipe');
  };
  
const createRecipe = async (req, res) => {
    const { name, minutes, steps, ingredients, description } = req.body;
    const userId = req.session.user._id; 
  
    const stepsArray = steps.split('\n').map(step => step.trim());
    const ingredientsArray = ingredients.split('\n').map(ingredient => ingredient.trim());
  
    try {
      const newRecipe = await Recipe.create({
        name,
        minutes,
        submitted: new Date(),
        steps: stepsArray,
        ingredients: ingredientsArray,
        description,
        user: userId
      });
      res.redirect('/users');
    } catch (error) {
      console.error(error);
      res.render('error');
    }
};
  



module.exports = {
  getUserPage,
  getEditProfilePage,
  updateProfile,
  getNewRecipePage,
  createRecipe
};
