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
    res.render('newRecipe', { user: req.session.user })
  };
  

const createRecipe = async (req, res) => {
    const { name, minutes, steps, description } = req.body;
    const userId = req.session.user._id;
  
    try {
      // Get the selected ingredients from the array
      const selectedIngredients = req.body.ingredients.map((ingredient) => ingredient.trim());
  
      const ingredientsRecipe = [];
  
      for (const ingredient of selectedIngredients) {
        const existingIngredient = await Ingredient.findOne({ ingredient });
  
        if (existingIngredient) {
          console.log('Ingredient already exists:', existingIngredient);
          ingredientsRecipe.push(existingIngredient.ingredient);
        } else {
          const newIngredient = await Ingredient.create({ ingredient });
          console.log('New ingredient saved:', newIngredient);
          ingredientsRecipe.push(newIngredient.ingredient);
        }
      }
  
      const newRecipe = await Recipe.create({
        name,
        minutes,
        steps: steps.trim().split('\n').map((step) => step.trim()),
        description,
        user: userId,
        ingredients: ingredientsRecipe,
      });
  
      const user = await User.findById(userId).populate('recipes');
      user.recipes.push(newRecipe);
      await user.save();
  
      console.log(ingredientsRecipe);
      res.redirect('/users');
    } catch (error) {
      console.error(error);
      res.render('error', { error });
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
      console.log("recipe was found");
      res.render('editRecipe', { recipe, user: req.session.user });
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
  getEditRecipePage,
};
