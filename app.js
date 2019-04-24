// ----------------------- GLOBAL CONSTANTS / VARIABLES
const APIKEY = '56175afb98069e5cfcbbcd270003eb4c';
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
// forecast table global arrays
let tableDays = [],
    tableHighs = [],
    tableLows = [],
    tableTemps = [],
    tableMains = [],
    tableIcons = [];
// suggestion images
const weatherImgs = [
  'img/beautiful-clouds-cloudy-209831.jpg',
  'img/bird-s-eye-view-bright-close-up-1438761.jpg',
  'img/black-and-white-clear-cool-459451.jpg', 
  'img/blue-sky-bright-cloudiness-1431822.jpg', 
  'img/clouds-colors-cropland-108941.jpg', 
  'img/clouds-dark-dark-clouds-416920.jpg' 
];
populateSuggestionImages();
// DOM constants
const form = document.querySelector('#weather-form');
const resultList = document.querySelector('.results');
const cardTitles = document.querySelectorAll('#forecast-table .card-title');
const tempLabels = document.querySelectorAll('.temp-label');
const highTempLabels = document.querySelectorAll('.high-temp');
const lowTempLabels = document.querySelectorAll('.low-temp');
const suggestionsDiv = document.querySelector('.suggestions');
const submitBtn = document.querySelector('button[type=submit]');

// ----------------------- EVENT LISTENERS
// form submit event listener
form.addEventListener('submit', (e) => {
  e.preventDefault();

  const cityValue = document.querySelector('#city').value;
  const stateValue = document.querySelector('#state').value;

  // validation
  if (cityValue != '' && stateValue != '') {
    // NOTE: state not needed for obtaining data, only city and country (set manually to United States)
    document.querySelector('#forecast-table').style.display = 'flex';
    document.querySelector('small').style.display = 'block';
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

// suggestion buttons event listener (event delegation)
suggestionsDiv.addEventListener('click', function (e) {
  if (e.target.classList.contains('suggestion-btn')) {
    document.querySelector('#city').value = e.target.getAttribute('id');
    document.querySelector('#state').value = ' '; // state needs a value other than an empty string to avoid validation errors
    submitBtn.click(); // trigger form submit event
  }
});

// ----------------------- HELPER FUNCTIONS
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
      // console.log(response);

      // populate results data
      let output = `<p>Showing results for ${city}: (5 day forecast at 3 hour intervals)</p>`;
      output += `<li class="list-group-item">Latitude: ${response.city.coord.lat}</li>`;
      output += `<li class="list-group-item">Longitude: ${response.city.coord.lon}</li>`;
      output += '<br><br>';
            
      const responseList = response.list;
      let currentDay = '';
      let count = 0;
      responseList.forEach(function(item, index) {
        const dateTime = item.dt_txt;
        const timestamp = new Date(`${dateTime}`);
        const day = days[timestamp.getDay()];
        // keep track of days for forecast table
        if (day !== currentDay) {
          tableDays.push(day);
          currentDay = day;
          count++;
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
        tableIcons.push(item.weather[0].icon);

        // create list items from data
        output += `<li class="list-group-item day${count}">${day}, ${month} ${date}, ${year} at ${hourStr}:${minStr} ${meridiem} : ${item.weather[0].main} ${getWeatherIcon(item.weather[0].icon)} -- ${item.weather[0].description} (${item.main.temp} F${String.fromCharCode(176)})</li>`;
      });

      // show results
      resultList.innerHTML = output;

      // set card titles to next 5 days
      for (let i = 0; i < 5; i += 1) {
        cardTitles[i].textContent = tableDays[i];
      }
      getWeatherAverages();
      // reset global arrays
      tableDays = [];
      tableHighs = []
      tableLows = [];
      tableTemps = [];
      tableMains = [];
      tableIcons = [];
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

// populate suggestion images
function populateSuggestionImages() {
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
}

// get weather averages
function getWeatherAverages() {
  // for the length of each day class, get the average of that day's temp, highTemp, lowTemp, and the main description and icon that occurs the most
  const day1 = document.querySelectorAll('.day1');
  const day2 = document.querySelectorAll('.day2');
  const day3 = document.querySelectorAll('.day3');
  const day4 = document.querySelectorAll('.day4');
  const day5 = document.querySelectorAll('.day5');
  // object that will hold all average data for each day
  let daysData = {
    day1: {
      highTemps: [],
      lowTemps: [],
      temps: [],
      mains: [],
      icons: []
    },
    day2: {
      highTemps: [],
      lowTemps: [],
      temps: [],
      mains: [],
      icons: []
    },
    day3: {
      highTemps: [],
      lowTemps: [],
      temps: [],
      mains: [],
      icons: []
    },
    day4: {
      highTemps: [],
      lowTemps: [],
      temps: [],
      mains: [],
      icons: []
    },
    day5: {
      highTemps: [],
      lowTemps: [],
      temps: [],
      mains: [],
      icons: []
    }
  }

  // get each day's data from global arrays
  for (let i = 0; i < day1.length; i += 1) {
    daysData.day1.highTemps.push(tableHighs[i]);
    daysData.day1.lowTemps.push(tableLows[i]);
    daysData.day1.temps.push(tableTemps[i]);
    daysData.day1.mains.push(tableMains[i]);
    daysData.day1.icons.push(tableIcons[i]);
  }
  let nextIndex = day1.length + day2.length;

  for (let i = day1.length; i < nextIndex; i += 1) {
    daysData.day2.highTemps.push(tableHighs[i]);
    daysData.day2.lowTemps.push(tableLows[i]);
    daysData.day2.temps.push(tableTemps[i]);
    daysData.day2.mains.push(tableMains[i]);
    daysData.day2.icons.push(tableIcons[i]);
  }
  let oldIndex = nextIndex;
  nextIndex += day3.length;

  for (let i = oldIndex; i < nextIndex; i += 1) {
    daysData.day3.highTemps.push(tableHighs[i]);
    daysData.day3.lowTemps.push(tableLows[i]);
    daysData.day3.temps.push(tableTemps[i]);
    daysData.day3.mains.push(tableMains[i]);
    daysData.day3.icons.push(tableIcons[i]);
  }
  oldIndex = nextIndex;
  nextIndex += day4.length;

  for (let i = oldIndex; i < nextIndex; i += 1) {
    daysData.day4.highTemps.push(tableHighs[i]);
    daysData.day4.lowTemps.push(tableLows[i]);
    daysData.day4.temps.push(tableTemps[i]);
    daysData.day4.mains.push(tableMains[i]);
    daysData.day4.icons.push(tableIcons[i]);
  }
  oldIndex = nextIndex;
  nextIndex += day5.length;

  for (let i = oldIndex; i < nextIndex; i += 1) {
    daysData.day5.highTemps.push(tableHighs[i]);
    daysData.day5.lowTemps.push(tableLows[i]);
    daysData.day5.temps.push(tableTemps[i]);
    daysData.day5.mains.push(tableMains[i]);
    daysData.day5.icons.push(tableIcons[i]);
  }

  const day1AvgValues = getAverageValues(daysData.day1);
  const day2AvgValues = getAverageValues(daysData.day2);
  const day3AvgValues = getAverageValues(daysData.day3);
  const day4AvgValues = getAverageValues(daysData.day4);
  const day5AvgValues = getAverageValues(daysData.day5);
  // create array of objects holding average values for each day to be indexed with DOM labels
  const dayAvgArray = [
    day1AvgValues,
    day2AvgValues,
    day3AvgValues,
    day4AvgValues,
    day5AvgValues
  ];

  // show in forecast chart
  for (let i = 0; i < 5; i += 1) {
    tempLabels[i].innerHTML = `<h5 class="text-center font-italic text-uppercase" id="forecast-chart-main">${dayAvgArray[i].mainAvg} ${getWeatherIcon(dayAvgArray[i].iconAvg)}</h5> <h5 class="text-center text-weight-bold" id="forecast-chart-temp">${Math.round(dayAvgArray[i].tempAvg)} F${String.fromCharCode(176)}</h5>`;
    highTempLabels[i].textContent = `HIGH -- ${Math.round(dayAvgArray[i].highAvg)} F${String.fromCharCode(176)}`;
    lowTempLabels[i].textContent = `LOW -- ${Math.round(dayAvgArray[i].lowAvg)} F${String.fromCharCode(176)}`;
  }
}

// get average values
function getAverageValues(dayObject) {
  const dayHighTemps = dayObject.highTemps;
  const dayLowTemps = dayObject.lowTemps;
  const dayTemps = dayObject.temps;
  const dayMains = dayObject.mains;
  const dayIcons = dayObject.icons;

  // average of highTemps
  let sum1 = 0;
  for(let i = 0; i < dayHighTemps.length; i += 1) {
      sum1 += dayHighTemps[i];
  }
  const highAvg = sum1 / dayHighTemps.length;
  // average of lowTemps
  let sum2 = 0;
  for(let i = 0; i < dayLowTemps.length; i += 1) {
      sum2 += dayLowTemps[i];
  }
  const lowAvg = sum2 / dayLowTemps.length;
  // average of temps
  let sum3 = 0;
  for(let i = 0; i < dayTemps.length; i += 1) {
      sum3 += dayTemps[i];
  }
  const tempAvg = sum3 / dayTemps.length;
  // most occurrence in mains
  const mainAvg = mode(dayMains);
  // most occurrence in icons
  const iconAvg = mode(dayIcons);

  return {
    'highAvg': highAvg,
    'lowAvg': lowAvg,
    'tempAvg': tempAvg,
    'mainAvg': mainAvg,
    'iconAvg': iconAvg
  }
}

// find most occurences of word in array -- (Stack Overflow: https://stackoverflow.com/questions/1053843/get-the-element-with-the-highest-occurrence-in-an-array)
function mode(array) {
  if(array.length == 0)
    return null;
  var modeMap = {};
  var maxEl = array[0], maxCount = 1;
  for(var i = 0; i < array.length; i++)
  {
    var el = array[i];
    if(modeMap[el] == null)
      modeMap[el] = 1;
    else
        modeMap[el]++;  
    if(modeMap[el] > maxCount)
    {
      maxEl = el;
      maxCount = modeMap[el];
    }
  }
  return maxEl;
}

// check string for whitespace -- (Stack Overflow: https://stackoverflow.com/questions/1731190/check-if-a-string-has-white-space)
function hasWhiteSpace(s) {
  return s.indexOf(' ') >= 0;
}

// get weather icon image
function getWeatherIcon(iconStr) {
  return `<img src="http://openweathermap.org/img/w/${iconStr}.png"></img>`;
}

// get random number
function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1) + min)
}