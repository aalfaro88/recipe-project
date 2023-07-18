const User = require('../models/User');
const Recipe = require('../models/Recipe');

const getUserPage = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      const recipes = await Recipe.find({ user: req.user.id });
  
      res.render('userPage', { user, recipes });
    } catch (error) {
      console.error(error);
      res.render('error');
    }
  };
  
  module.exports = {
    getUserPage
  };
  