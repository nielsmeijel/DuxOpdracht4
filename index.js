const WEATHERAPI_KEY = ""
const BASE_WEATHER_URL = "https://api.weatherapi.com/v1/current.json?"

function editText(inputId) { // pass the id of the text input field
    var inputField = document.getElementById(inputId); // Get the input field
    //inputField.removeAttribute('readonly'); 
    inputField.focus(); // goes into the input field. 

    inputField.addEventListener('keydown', function(event) { // listen for keydown events (pressing a key options are Keydown, Keyup, Keypress)
        if (event.key === 'Enter') {
            // inputField.setAttribute('readonly', 'readonly'); // Make the input field read-only again
            inputField.blur(); // remove focus from the input field
        }
    });
}

function deleteText(inputId) {
    var inputField = document.getElementById(inputId);
    inputField.value = ''; // Clear the input field
}

function toggleInputFields(numLocations) {
    for (let i = 1; i <= 3; i++) {  
        var inputField = document.getElementById(`locationField${i}`);
        if (i <= numLocations) {
            inputField.classList.remove('d-none');
        } else {
            deleteText(`textInput${i}`);
            inputField.classList.add('d-none');
        }
    }
}

document.getElementById('inputGroupSelect').addEventListener('change', function() {
    var numLocations = parseInt(this.value);
    toggleInputFields(numLocations);
});

savedList = [];

function makeSavedList() {
    for (let i = 1; i <= 3; i++) {
        var inputField = document.getElementById(`textInput${i}`).value.trim();
        if (inputField && !savedList.includes(inputField)) {
            savedList.push(inputField);
        }
    }
    console.log(savedList);
    console.log("Running weatherRequest()...");
    weatherRequest();
}

let weatherData = [];
let priorSearches = [];
let totalQueries = 0;

async function weatherRequest() {
  //clearSearch();
  if (!savedList || savedList.length === 0) {
    console.error("savedList is undefined or empty");
    // showAlert(2, "Please enter and save a location first.");
    return;
  }

  //hideAlert(2); // Hide any existing alerts...
  console.log("savedList length before for loop with try, fetch:", savedList);

  for (let i = 0; i < savedList.length; i++) {
    totalQueries++;

    //checken of locatie al eerder is opgevraagd
    if (priorSearches.includes(savedList[i])) {
      console.log(`${savedList[i]} has already been requested. Skipping fetch.`);
    //   showAlert(2, `${savedList[i]} has already requested. Skipping fetch.`);
      continue; //skip to the next iteration of the for loopp if already searched
    }

    try {
      //await relax(); 
      console.log(`Fetching weather data for ${savedList[i]}.`); // add a loading spinner/time
      let response = await fetch(`${BASE_WEATHER_URL}key=${WEATHERAPI_KEY}&q=${savedList[i]}&aqi=no`);
      if (!response.ok) {
        throw new Error(`HTTP error! The response was NOT ok, its status: ${response.status}`);
      }
      priorSearches.push(savedList[i]); // pushto priorSearches after a successful fetch
      let data = await response.json();
      weatherData.push(data);
    } catch (error) {
        // showAlert(2, `Error fetching weather data for ${savedList[i]}: ${error.message}`);
        console.log(`Error fetching weather data for ${savedList[i]}: ${error.message}`);
    }
  }
  //document.getElementById("loadingIcon").classList.add("d-none");
  console.log(`Total queries generated: ${totalQueries}`);
  populateWeatherReport(weatherData);
}



function populateWeatherReport(data) {
  //get the template made with the id weather-report-display get all htmlcontent 
  const dashTemplate = document.getElementById("weather-report-display").content;
  const carouselInner =document.getElementById("carousel-inner")
  const weatherDash = document.getElementById("weatherDash");
  let activeItem = carouselInner.querySelector(".carousel-item.active");

  if(!activeItem){
    activeItem = document.createElement("div");
    activeItem.classList.add("carousel-item", "active");
    carouselInner.appendChild(activeItem);
  }

  data.forEach((report) => {
      // Check if a report for this location already exists
      if (!document.querySelector(`#carousel-inner .weather-report[data-location="${report.location.name}"]`)) {
        // carousel-inner eerst weatherDash
          // kopie maken van de template
          const clone = document.importNode(dashTemplate, true);

          // get all the elements from dashTemplate
          const cityName = clone.querySelector(".cityName");
          const temperature = clone.querySelector(".temperature");
          const conditionIcon = clone.querySelector(".condition-icon");
          const humidity = clone.querySelector(".humidity");
          const windSpeed = clone.querySelector(".windSpeed");
          const pressure = clone.querySelector(".pressure");
          const cloudCover = clone.querySelector(".cloudCover");
          const precipitation = clone.querySelector(".precipitation");

          // create attribute data-location, set to the location name. (attribute of the weather-report div)
          clone.querySelector(".weather-report").setAttribute("data-location", report.location.name);

          // set the text content of the elements before
          cityName.textContent = `${report.location.name}, ${report.location.region}, ${report.location.country}`;
          temperature.textContent = `${report.current.temp_c}°C`;
          conditionIcon.src = report.current.condition.icon;
          conditionIcon.alt = report.current.condition.text;
          humidity.textContent = `${report.current.humidity}%`;
          windSpeed.textContent = `${report.current.wind_kph} kph (${report.current.wind_dir})`;
          pressure.textContent = `${report.current.pressure_mb} mb`;
          cloudCover.textContent = `${report.current.cloud}%`;
          precipitation.textContent = `${report.current.precip_mm} mm`;


          // const newItem = document.createElement('div');
          //  newItem.classList.add('carousel-item');
          // newItem.appendChild(clone);
          //   carouselInner.appendChild(newItem);

          if (activeItem.childElementCount < 1) {
             activeItem.appendChild(clone);
            } else {
              const newItem = document.createElement('div');
              newItem.classList.add('carousel-item');
              newItem.appendChild(clone);
              carouselInner.appendChild(newItem);
              activeItem = newItem;
            
           }
          //before: weatherDash.appendChild(clone);
          // pre-append the new report to the weatherDash container
          //weatherDash.insertBefore(clone, weatherDash.firstChild);
          //duplicateContent();
          
      } else {
          console.log(`Report for ${report.location.name} already exists.`);
      }
  });
}