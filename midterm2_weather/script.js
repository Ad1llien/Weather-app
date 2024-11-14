  const apiKey = '451f0c061bb6459e81503921982149c7';
  const searchInput = document.getElementById('search-input');
  const recipeGrid = document.getElementById('recipe-grid');
  const modal = document.getElementById('recipe-modal');
  const favoritesGrid = document.getElementById('favorites-grid');
  const dropdown = document.getElementById('suggestions');
  let favorites = JSON.parse(localStorage.getItem('favorites')) || [];

//убирает предложения если нажать где то не нажать на одну из предложений
  document.addEventListener('click', (event) => {
    if(check(event.target)){
      dropdown.classList.remove('hidden');
    }
    if (!searchInput.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.add('hidden');
    }
  
    
  });

  let rec = 0;


  //проверяет есть ли что то в запросе или длина отличается
  function check(e){
    if(searchInput.value  .length === 0){
      rec = searchInput.length;
      return true;
    }
    else{
      if(rec != searchInput.length){
        return false;
      }
      else return true;
    }
  }


  //получает данные с базы данных и оптравляет в другой метод если длина запроса достигает 3 и более
  searchInput.addEventListener('input', async () => {
    const query = searchInput.value;
    if (query.length > 2) {
      const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&apiKey=${apiKey}`);
      const suggestions = await response.json();
      displaySuggestions(suggestions);
    }
  });


//показывает предложения по запросу
function displaySuggestions(suggestions) {
  const dropdown = document.getElementById('suggestions');
  dropdown.innerHTML = '';
  dropdown.classList.remove('hidden'); // Показываем выпадающий список

  suggestions.forEach(suggestion => {
    const item = document.createElement('div');
    item.textContent = suggestion.title;
    item.onclick = () => {
      loadRecipes(suggestion.title);
      dropdown.classList.add('hidden'); // Скрываем после выбора предложения
    };
    dropdown.appendChild(item);
  });
}


  //показывает результаты запроса
  async function loadRecipes(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/complexSearch?query=${query}&apiKey=${apiKey}`);
    const data = await response.json();
    recipeGrid.innerHTML = '';
    data.results.forEach(recipe => createRecipeCard(recipe));
  }


  function check(eventTarget) {
    // Проверяем, пустой ли input или длина изменилась
    if (searchInput.value.length === 0) {
      rec = searchInput.value.length;
      return true;
    } else {
      if (rec !== searchInput.value.length) {
        rec = searchInput.value.length;
        return false;
      } else {
        return true;
      }
    }
  }

  
  document.addEventListener('click', (event) => {
    if (!searchInput.contains(event.target) && !dropdown.contains(event.target)) {
      dropdown.classList.add('hidden'); 
    }
  });

  
  async function fetchSuggestions(query) {
    const response = await fetch(`https://api.spoonacular.com/recipes/autocomplete?query=${query}&apiKey=${apiKey}`);
    const suggestions = await response.json();
  
    if (suggestions.length > 0) {
      displaySuggestions(suggestions);
    } else {
      dropdown.classList.add('hidden'); // Скрываем, если предложений нет
    }
  }
  
  searchInput.addEventListener('input', () => {
    const query = searchInput.value;
    if (query.length > 2) {
      fetchSuggestions(query);
    }
  });
  

//создает отдельные карты
  function createRecipeCard(recipe) {
    const card = document.createElement('div');
    card.classList.add('recipe-card');
    card.innerHTML = `
      <img src="${recipe.image}" alt="${recipe.title}">
      <h3>${recipe.title}</h3>
      <p>Preparation time: ${recipe.readyInMinutes} mins</p>
      <button onclick="showRecipeDetails(${recipe.id})">View Recipe</button>
      <button onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes})">
        ${isFavorite(recipe.id) ? 'Remove from Favorites' : 'Add to Favorites'}
      </button>
    `;
    recipeGrid.appendChild(card);
  }


    //создает модальное окно дл 
  async function showRecipeDetails(id) {
    const response = await fetch(`https://api.spoonacular.com/recipes/${id}/information?apiKey=${apiKey}`);
    const recipe = await response.json();
    modal.innerHTML = `
      <button class="close-btn" onclick="closeModal()">×</button>
      <h2>${recipe.title}</h2>
      <img src="${recipe.image}" alt="${recipe.title}">
      <p><strong>Ingredients:</strong></p>
      <ul>${recipe.extendedIngredients.map(ingredient => `<li>${ingredient.original}</li>`)}</ul>
      <p><strong>Instructions:</strong> ${recipe.instructions || 'No instructions available.'}</p>   `;
    modal.style.display = 'block';
  }

  // для закрытии модального окна
  function closeModal() {
    modal.style.display = 'none';
  }

  // для изменения избранных
  function toggleFavorite(id, title, image, readyInMinutes) {
    const recipe = { id, title, image, readyInMinutes };
    if (isFavorite(id)) {
      favorites = favorites.filter(fav => fav.id !== id);
    } else {
      favorites.push(recipe);
    }
    localStorage.setItem('favorites', JSON.stringify(favorites));
    displayFavorites();
    loadRecipes(searchInput.value); 
  }

  function isFavorite(id) {
    return favorites.some(fav => fav.id === id);
  }

  function displayFavorites() {
    favoritesGrid.innerHTML = '';
    favorites.forEach(recipe => {
      const card = document.createElement('div');
      card.classList.add('recipe-card');
      card.innerHTML = `
        <img src="${recipe.image}" alt="${recipe.title}">
        <h3>${recipe.title}</h3>
        <p>Preparation time: ${recipe.readyInMinutes} mins</p>
        <button onclick="toggleFavorite(${recipe.id}, '${recipe.title}', '${recipe.image}', ${recipe.readyInMinutes})">
          Remove from Favorites
        </button>
      `;
      favoritesGrid.appendChild(card);
    });
  }

  displayFavorites();



