const User = require('../models/User');
const Recipe = require('../models/Recipe');
const Ingredient = require('../models/Ingredient');

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

// Define ingredientsRecipe at the global level
const ingredientsRecipe = [];

const createRecipe = async (req, res) => {
  const { name, minutes, steps, description } = req.body;
  const userId = req.session.user._id;

  try {
    const newRecipe = await Recipe.create({
      name,
      minutes,
      steps: steps.trim().split('\n').map((step) => step.trim()),
      description,
      user: userId,
      ingredients: ingredientsRecipe, // Assign the ingredientsRecipe array to the recipe's ingredients field
    });

    const user = await User.findById(userId).populate('recipes');
    user.recipes.push(newRecipe);
    await user.save();

    res.redirect('/users');
  } catch (error) {
    console.error(error);
    res.render('error', { error });
  }
};

const saveIngredient = async (req, res) => {
    const { ingredient } = req.body;
  
    try {
      // Check if the ingredient already exists in the database
      const existingIngredient = await Ingredient.findOne({ ingredient });
  
      if (existingIngredient) {
        console.log('Ingredient already exists:', existingIngredient);
        ingredientsRecipe.push(existingIngredient.ingredient); // Push existing ingredient to ingredientsRecipe
        console.log(ingredientsRecipe);
        return res.status(200).json(existingIngredient);
      }
  
      // Create a new ingredient if it doesn't exist
      const newIngredient = await Ingredient.create({ ingredient });
      console.log('New ingredient saved:', newIngredient);
      ingredientsRecipe.push(newIngredient.ingredient); // Push new ingredient to ingredientsRecipe
      console.log(ingredientsRecipe);
  
      // Call createRecipe function with the updated ingredientsRecipe array
      createRecipe(req, res);
  
      res.status(200).json(newIngredient);
    } catch (error) {
      console.error('Error saving ingredient:', error);
      res.status(500).json({ error: 'An error occurred while saving the ingredient.' });
    }
  };
  
const getPredictionOptions = async (req, res) => {
  const { query } = req.query;

  try {
    const predictionOptions = await Ingredient.find({ ingredient: { $regex: `^${query}`, $options: 'i' } })
      .limit(5)
      .lean();
    res.json(predictionOptions);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred while fetching prediction options.' });
  }
};


const getUser = async (req, res) => {
    try {
      const userId = req.session.user._id;
      const user = await User.findById(userId).populate('recipes');
      res.render('users', { user });
    } catch (error) {
      console.error(error);
      res.render('error', { error });
    }
};

const getEditRecipePage = async (req, res) => {
    try {
      const recipeId = req.params.id;
      const recipe = await Recipe.findById(recipeId);
      if (!recipe) {
        return res.render('error', { error: 'Recipe not found.' });
      }
      res.render('editRecipe', { recipe });
    } catch (error) {
      console.error(error);
      res.render('error');
    }
  };
  


module.exports = {
  getUser,  
  getUserPage,
  getEditProfilePage,
  updateProfile,
  getNewRecipePage,
  createRecipe,
  getPredictionOptions,
  saveIngredient,
  getEditRecipePage
};
