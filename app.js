const APIKEY = '56175afb98069e5cfcbbcd270003eb4c';
const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const resultList = document.querySelector('.results');

document.querySelector('#weather-form').addEventListener('submit', (e) => {
  e.preventDefault();

  const cityValue = document.querySelector('#city').value;
  const stateValue = document.querySelector('#state').value;

  if (cityValue != '' || stateValue != '') {
    // NOTE: state not needed for obtaining data, only city and country (set manually to United States)
    getWeatherForecast(cityValue);
  } else {
    // FIXME: ADDON -- create an alert and show for 3 seconds
    resultList.innerHTML = '<li class="error">Please fill in all fields.</li>';
  }
});

// get weather for the specified city and state
function getWeatherForecast (city) {
  const xhr = new XMLHttpRequest();

  xhr.open('GET', `http://api.openweathermap.org/data/2.5/forecast?q=${city},us&APPID=${APIKEY}`, true);

  xhr.onload = function() {
    if (this.status === 200) {
      const response = JSON.parse(this.responseText);
      console.log(response);

      let output = `<p>Showing results for ${city}: (5 day forecast at 3 hour intervals)</p>`;
      output += `<li>Latitude: ${response.city.coord.lat}</li>`;
      output += `<li>Longitude: ${response.city.coord.lon}</li>`;
      output += '<br><br>';
            
      const responseList = response.list;
      responseList.forEach(function(item) {
        const dateTime = item.dt_txt;
        const timestamp = new Date(`${dateTime}`);
        const day = days[timestamp.getDay()];
        const month = months[timestamp.getMonth()];
        const date = timestamp.getDate();
        const year = timestamp.getFullYear();
        const hour = timestamp.getHours();
        const min = timestamp.getMinutes();
        let hourStr;
        let minStr;
        let meridiem; // AM or PM

        hour < 10 ? hourStr = `0${hour}` : hourStr = `${hour}`;
        min < 10 ? minStr = `0${min}` : minStr = `${min}`;
        hour >= 12 ? meridiem = 'PM' : meridiem = 'AM';

        output += `<li>${day}, ${month} ${date}, ${year} at ${hourStr}:${minStr} ${meridiem} : ${item.weather[0].main} -- ${item.weather[0].description}</li>`;
      });

      resultList.innerHTML = output;
    }
  }

  xhr.onerror = function() {
    resultList.innerHTML = '<li class="error">Error retrieving data. Please try again.</li>';
  }

  xhr.send();
}

// FIXME: ability to clear list / reset and start over