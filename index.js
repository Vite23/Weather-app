const userTab = document.querySelector("[ data-userWeather]");
const searchTab = document.querySelector("[data-searchWeather]");
const userContainer = document.querySelector(".weather-conatiner");

const grantAccess = document.querySelector(".grant-location-container");
const searchForm = document.querySelector("[data-searchForm]");
const loadingScreen = document.querySelector(".loading-screen");
const userInfoContainer = document.querySelector(".user-info-container");
const cityfound = document.querySelector(".citynotfound");



let oldTab = userTab;
const API_KEY = "d1845658f92b31c64bd94f06f7188c9c";
oldTab.classList.add("current-tab");
getfromSessionStorage();

function switchTab(newTab) {
    if (newTab !== oldTab) {
        oldTab.classList.remove("current-tab");
        oldTab = newTab;
        oldTab.classList.add("current-tab");

        if (!searchForm.classList.contains("active")) {
            userInfoContainer.classList.remove("active");
            grantAccess.classList.remove("active");
            searchForm.classList.add("active");
        }
        else {

            searchForm.classList.remove("active");
            userInfoContainer.classList.add("active");

            getfromSessionStorage();
        }
    }

}


userTab.addEventListener("click", () => {
    //pass clicked tab as a input parameter
    switchTab(userTab);

});

searchTab.addEventListener("click", () => {
    switchTab(searchTab);
});


function getfromSessionStorage() {
    const localcoordinates = sessionStorage.getItem("user-coordinates");

    if (!localcoordinates) {
        grantAccess.classList.add("active");
    }
    else {
        const coordinates = JSON.parse(localcoordinates);
        fetchUserWeatherInfo(coordinates);


    }
}


async function fetchUserWeatherInfo(coordinates) {

    const { lat, lon } = coordinates;
    //make grant container invisible
    grantAccess.classList.remove("active");
    //make loadere vosible
    loadingScreen.classList.add("active");

    //API CALL

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${API_KEY}&units=metric`
        );


        const data = await response.json();

        loadingScreen.classList.remove("active");
        cityfound.classList.remove("active");
        userInfoContainer.classList.add("active");
        renderWeatherInfo(data);

    }
    catch (err) {
        loadingScreen.classList.remove("active");


    }
}


function renderWeatherInfo(weatherInfo) {
    const cityName = document.querySelector("[data-cityName]");
    const countryIcon = document.querySelector("[data-countryIcon]");
    const desc = document.querySelector("[data-weatherDesc]");
    const weatherIcon = document.querySelector("[data-weatherIcon]");
    const temp = document.querySelector("[data-temp]");
    const windspeed = document.querySelector("[data-windspeed]");
    const humidity = document.querySelector("[data-humidity]");
    const cloudiness = document.querySelector("[data-Clouds]");

    cityName.innerText = weatherInfo?.name;
    countryIcon.src = `https://flagcdn.com/144x108/${weatherInfo?.sys?.country.toLowerCase()}.png`;
    weatherIcon.src = `https://openweathermap.org/img/w/${weatherInfo?.weather?.[0]?.icon}.png`;
    desc.innerText = weatherInfo?.weather?.[0]?.description;
    temp.innerText = `${weatherInfo?.main?.temp} °C`;
    windspeed.innerText = `${weatherInfo?.wind?.speed}m/s`;
    humidity.innerText = `${weatherInfo?.main?.humidity}%`;
    cloudiness.innerText = `${weatherInfo?.clouds?.all}%`;

}


function getlocation() {
    if (navigator.geolocation) {

        navigator.geolocation.getCurrentPosition(showPosition);
    }
    else {
        alert("Goelocation is not supported");
    }
}

function showPosition(position) {
    // finding latitude and logitude
    const userCoordinates = {
        lat: position.coords.latitude,
        lon: position.coords.longitude,
    };

    sessionStorage.setItem("user-coordinates", JSON.stringify(userCoordinates));


    // Remove the "active" class from grantAccess to hide it
    grantAccess.classList.remove("active");


}

const grantAccessButton = document.querySelector("[data-grantAccess]");
grantAccessButton.addEventListener("click", getlocation);

const searchInput = document.querySelector("[data-searchInput]");

searchForm.addEventListener("submit", (e) => {
    e.preventDefault();
    let cityName = searchInput.value;

    if (cityName === "") {
        return;
    }
    else {

        fetchSearchWeatherInfo(cityName);
    }
})

async function fetchSearchWeatherInfo(city) {
    loadingScreen.classList.add("active");
    userContainer.classList.remove("active");
    grantAccess.classList.remove("active");

    try {
        const response = await fetch(
            `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
        );

        if (response.ok) {
            // If the response status is OK (200)
            const data = await response.json();

            if (data.name) {
                // City found
                cityfound.classList.remove("active");
                loadingScreen.classList.remove("active");
                userInfoContainer.classList.add("active");
                renderWeatherInfo(data);
            } else {
                // City name is not valid or not found
                cityfound.classList.add("active");
                loadingScreen.classList.remove("active");
            }
        } else {
            // Handle non-OK response status (e.g., show an error message)
            console.error("Error:", response.statusText);
            loadingScreen.classList.remove("active");
            cityfound.classList.add("active");
            userInfoContainer.classList.remove("active");
        }

    } catch (err) {

        console.error("Error:", err.message);
        loadingScreen.classList.remove("active");
    }
}