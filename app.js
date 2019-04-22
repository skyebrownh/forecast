const APIKEY = '56175afb98069e5cfcbbcd270003eb4c';
const resultList = document.querySelector('.results');

document.querySelector('#weather-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const cityValue = document.querySelector('#city').value;
  const stateValue = document.querySelector('#state').value;

  if (cityValue != '' || stateValue != '') {
    getWeatherForecast(cityValue);
  } else {
    // FIXME: ADDON -- create an alert and show for 3 seconds
    resultList.innerHTML = '<li class="error">Please fill in all fields.</li>';
  }
});

// get weather for the specified city and state
function getWeatherForecast (city) {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=Elizabethtown,us&APPID=${APIKEY}`, true);

  xhr.onload = function() {
    if (this.status === 200) {
      const response = JSON.parse(this.responseText);
      console.log(response);

      let output = '';
      
      // FIXME: show results of all cities matching input
      const responseList = response.list;
      responseList.forEach(function(item) {
        output += '<li></li>';
      });
    }
  }

  xhr.onerror = function() {
    resultList.innerHTML = '<li class="error">Error retrieving data. Please try again.</li>';
  }

  xhr.send();
}

// FIXME: ability to clear list / reset and start over