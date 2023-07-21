// const searchForm = document.querySelector('#searchForm');
// const recipesContainer = document.querySelector('#recipesContainer');

// searchForm.addEventListener('submit', (event) => {
//   event.preventDefault();

//   // Get the search query and search option values
//   const searchQuery = document.querySelector('#searchQuery').value;
//   const searchOption = document.querySelector('input[name="searchOption"]:checked').value;

//   // Perform the search based on the selected search option
//   if (searchOption === 'byIngredients') {
//     window.location.href = '/searchByIngredients?ingredients=' + encodeURIComponent(searchQuery);
//   } else if (searchOption === 'byName') {
//     window.location.href = '/searchByName?name=' + encodeURIComponent(searchQuery);
//   }

//   // Hide the recipes container
//   recipesContainer.classList.add('hidden');
// });