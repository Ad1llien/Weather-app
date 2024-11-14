const apiKey = 'f6cca55faf87dc1968690c53c3d3c82c';
const cityInput = document.getElementById('city-input');
const currentWeatherDiv = document.getElementById('current-weather');
const forecastDiv = document.getElementById('forecast');
const suggestionsDiv = document.getElementById('suggestions');
const startScreen = document.getElementById('start-screen');
const next = document.getElementById('next');
const startbutton = document.getElementById('start-button');
const clearButton = document.getElementById('clear-button');
startbutton.addEventListener('click', starting);

function starting(){
    startScreen.classList.add('hidden');
    next.classList.remove('hidden');
};


//
function showicon(){
  const name = document.querySelector(".username").value;
  const img = document.querySelector("img");
  if(username.length <= 0) document.body.classList.remove(".active");
  else document.body.classList.add("active");
  img.addEventListener("click", () => {
    document.querySelector(".username").value="";
    document.body.classList.classList.remove("active");
  });
}

//  изменение температуры (Цельсий/Фаренгейт)
document.querySelectorAll('input[name="unit"]').forEach(input => {
  input.addEventListener('change', () => {
    if (cityInput.value) getWeather(cityInput.value);
  });
});


//показывает кнопку очистить 
cityInput.addEventListener('input', () => {
    if (cityInput.value.length > 0) {
        clearButton.classList.remove('hidden');
    } else {
        clearButton.classList.add('hidden');
    }
});

//очищает инпут
clearButton.addEventListener('click', () => {
    cityInput.value = '';
    clearButton.classList.add('hidden');
    cityInput.focus(); // Вернуть фокус в поле ввода
});



// Получение предложений по названию города
cityInput.addEventListener('input', async () => {
  const query = cityInput.value;
  if (query.length > 2) {
    const response = await fetch(`https://api.openweathermap.org/geo/1.0/direct?q=${query}&limit=5&appid=${apiKey}`);
    const cities = await response.json();
    displaySuggestions(cities);
  }
});

// Отображение предложений
function displaySuggestions(cities) {
  suggestionsDiv.innerHTML = '';
  cities.forEach(city => {
    const item = document.createElement('div');
    item.textContent = `${city.name}, ${city.country}`;
    item.onclick = () => {
      cityInput.value = `${city.name}, ${city.country}`;
      getWeather(city.name);
      suggestionsDiv.innerHTML = '';
    };
    suggestionsDiv.appendChild(item);
  });
}

// Получение текущей погоды и прогноза
async function getWeather(city) {

  let lastCity = city;
  let lastCoords = null;

  const unit = document.querySelector('input[name="unit"]:checked').value;
  const currentWeatherUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${unit}&appid=${apiKey}`;
  const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&units=${unit}&appid=${apiKey}`;

  try {
    const currentWeatherResponse = await fetch(currentWeatherUrl);
    const currentWeatherData = await currentWeatherResponse.json();
    displayCurrentWeather(currentWeatherData);

    const forecastResponse = await fetch(forecastUrl);
    const forecastData = await forecastResponse.json();
    displayForecast(forecastData);
  } catch (error) {
    alert('City not found');
  }
}

// Отображение текущей погоды
function displayCurrentWeather(data) {
  const weatherHtml = `
    <h2>${data.name}, ${data.sys.country}</h2>
    <h3>${data.weather[0].description}</h3>
    <img src="https://openweathermap.org/img/wn/${data.weather[0].icon}@2x.png" alt="${data.weather[0].description}">
    <p>Temperature: ${data.main.temp}°</p>
    <p>Humidity: ${data.main.humidity}%</p>
    <p>Wind Speed: ${data.wind.speed} m/s</p>
  `;
  currentWeatherDiv.innerHTML = weatherHtml;
}

// Отображение прогноза на 5 дней
function displayForecast(data) {
  forecastDiv.innerHTML = '<h3>5-Day Forecast:</h3>';
  const dailyForecast = data.list.filter(item => item.dt_txt.includes('12:00:00'));
  dailyForecast.forEach(day => {
    const forecastHtml = `
      <div class="forecast-day">
        <h4>${new Date(day.dt_txt).toLocaleDateString(undefined, { weekday: 'short' })}</h4>
        <img src="https://openweathermap.org/img/wn/${day.weather[0].icon}@2x.png" alt="${day.weather[0].description}">
        <p>High: \n ${day.main.temp_max}°</p>
        <p>Low: \n ${day.main.temp_min}°</p>
      </div>`;
    forecastDiv.innerHTML += forecastHtml;
  });
}

// Получение погоды по геолокации
function getWeatherByLocation() {
  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(async (position) => {
      const { latitude, longitude } = position.coords;
      lastCoords = { latitude, longitude }; 
      lastCity = null;
      
      const unit = document.querySelector('input[name="unit"]:checked').value;
      const weatherUrl = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`;
      const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&units=${unit}&appid=${apiKey}`;

      try {
        const currentWeatherResponse = await fetch(weatherUrl);
        const currentWeatherData = await currentWeatherResponse.json();
        displayCurrentWeather(currentWeatherData);

        const forecastResponse = await fetch(forecastUrl);
        const forecastData = await forecastResponse.json();
        displayForecast(forecastData);
      } catch (error) {
        alert('Could not retrieve weather data.');
      }
    },
    (error) => {
      if (error.code === error.PERMISSION_DENIED) {
        alert('Location access was denied. Please allow location access in your browser settings.');
      } else {
        alert('Unable to retrieve your location.');
      }
    });
  } else {
    alert('Geolocation is not supported by this browser.');
  }
}


cityInput.addEventListener('keydown', (event) => {
  if (event.key === 'Enter') {
    event.preventDefault(); 
    getWeather(cityInput.value); 
  }
});



let lastCity = null;
let lastCoords = null;
