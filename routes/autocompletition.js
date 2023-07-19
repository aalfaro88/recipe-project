router.get('/autocompletion', async (req, res) => {
    const query = req.query.query;
  
    try {
      const autocompletionOptions = await Ingredient.find(
        { $text: { $search: query } },
        { score: { $meta: 'textScore' } }
      )
        .sort({ score: { $meta: 'textScore' } })
        .limit(5)
        .lean();
  
      res.json(autocompletionOptions);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: 'Internal Server Error' });
    }
  });
  