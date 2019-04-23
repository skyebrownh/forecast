const APIKEY = '56175afb98069e5cfcbbcd270003eb4c';
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
let tableDays = [],
    tableHighs = [],
    tableLows = [],
    tableTemps = [],
    tableMains = [];

// populate suggestion images
const weatherImgs = [
  'img/beautiful-clouds-cloudy-209831.jpg',
  'img/bird-s-eye-view-bright-close-up-1438761.jpg',
  'img/black-and-white-clear-cool-459451.jpg', 
  'img/blue-sky-bright-cloudiness-1431822.jpg', 
  'img/clouds-colors-cropland-108941.jpg', 
  'img/clouds-dark-dark-clouds-416920.jpg' 
];
const suggest1 = document.querySelector('#suggest1');
const suggest2 = document.querySelector('#suggest2');
const suggest3 = document.querySelector('#suggest3');
const suggest1Num = getRandomNumber(0, 5);
let suggest2Num = getRandomNumber(0, 5);
let suggest3Num = getRandomNumber(0, 5);
// make sure nums are different
while (suggest2Num === suggest1Num) {
  suggest2Num = getRandomNumber(0, 5);
}
while (suggest3Num === suggest1Num || suggest3Num === suggest2Num) {
  suggest3Num = getRandomNumber(0, 5);
}
suggest1.setAttribute('src', `${weatherImgs[suggest1Num]}`);
suggest2.setAttribute('src', `${weatherImgs[suggest2Num]}`);
suggest3.setAttribute('src', `${weatherImgs[suggest3Num]}`);

// DOM constants
const form = document.querySelector('#weather-form');
const resultList = document.querySelector('.results');
const cardTitles = document.querySelectorAll('#forecast-table .card-title');

form.addEventListener('submit', (e) => {
  e.preventDefault();

  const cityValue = document.querySelector('#city').value;
  const stateValue = document.querySelector('#state').value;

  if (cityValue != '' || stateValue != '') {
    // NOTE: state not needed for obtaining data, only city and country (set manually to United States)
    getWeatherForecast(cityValue);
  } else {
    // show alert for unfilled fields
    const container = document.querySelector('#main');
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.textContent = 'Please fill in all fields.';
    container.insertBefore(alertDiv, form);

    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }
});

// get weather for the specified city and state
function getWeatherForecast (city) {
  const xhr = new XMLHttpRequest();

  // spaces in city name must be replaced with '+' for api call
  let cityStr;
  hasWhiteSpace(city) ? cityStr = city.split(' ').join('+') : cityStr = city;

  xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=${cityStr},us&units=imperial&APPID=${APIKEY}`, true);

  xhr.onload = function() {
    if (this.status === 200) {
      const response = JSON.parse(this.responseText);
      console.log(response);

      // populate results data
      let output = `<p>Showing results for ${city}: (5 day forecast at 3 hour intervals)</p>`;
      output += `<li class="list-group-item">Latitude: ${response.city.coord.lat}</li>`;
      output += `<li class="list-group-item">Longitude: ${response.city.coord.lon}</li>`;
      output += '<br><br>';
            
      const responseList = response.list;
      let currentDay = '';
      responseList.forEach(function(item, index) {
        const dateTime = item.dt_txt;
        const timestamp = new Date(`${dateTime}`);
        const day = days[timestamp.getDay()];
        if (day !== currentDay) {
          tableDays.push(currentDay);
          currentDay = day;
        }
        const month = months[timestamp.getMonth()];
        const date = timestamp.getDate();
        const year = timestamp.getFullYear();
        const hour = timestamp.getHours();
        const min = timestamp.getMinutes();
        let hourStr;
        let minStr;
        let meridiem; // AM or PM

        // make time look uniform and get meridiem
        hour < 10 ? hourStr = `0${hour}` : hourStr = `${hour}`;
        min < 10 ? minStr = `0${min}` : minStr = `${min}`;
        hour >= 12 ? meridiem = 'PM' : meridiem = 'AM';

        // push all values to global arrays
        tableHighs.push(item.main.temp_max);
        tableLows.push(item.main.temp_min);
        tableTemps.push(item.main.temp);
        tableMains.push(item.weather[0].main);

        output += `<li class="list-group-item bg-light ${day}">${day}, ${month} ${date}, ${year} at ${hourStr}:${minStr} ${meridiem} : ${item.weather[0].main} ${getWeatherIcon(item.weather[0].icon)} -- ${item.weather[0].description} (${item.main.temp} F${String.fromCharCode(176)})</li>`;
      });

      resultList.innerHTML = output;

      // FIXME: populate forecast table
      console.log(tableDays);
      for (let i = 1; i <= 5; i += 1) {
        cardTitles[i-1].textContent = tableDays[i];
      }

    } else if (this.status === 404) {
      // show alert for '404 - NOT FOUND' error
      const container = document.querySelector('#main');
      const alertDiv = document.createElement('div');
      alertDiv.className = 'alert alert-danger';
      alertDiv.setAttribute('role', 'alert');
      alertDiv.textContent = 'The city you entered could not be found. Please try again.';
      container.insertBefore(alertDiv, form);

      setTimeout(() => {
        alertDiv.remove();
      }, 3000);
    }
  }

  xhr.onerror = function() {
    // show alert for request error
    const container = document.querySelector('#main');
    const alertDiv = document.createElement('div');
    alertDiv.className = 'alert alert-danger';
    alertDiv.setAttribute('role', 'alert');
    alertDiv.textContent = 'Error retrieving data. Please try again.';
    container.insertBefore(alertDiv, form);

    setTimeout(() => {
      alertDiv.remove();
    }, 3000);
  }

  xhr.send();
}

// check string for whitespace
function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}

// FIXME: color scheme

// get weather icon image
function getWeatherIcon(iconStr) {
  return `<img src="http://openweathermap.org/img/w/${iconStr}.png"></img>`;
}

// get random number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}

// get weather averages
function getWeatherAverages() {
  // for the length of each day class, get the average of that day's temp, highTemp, lowTemp, and the main description that occurs the most
}