const API_BASE =
    (window.location.hostname === "localhost" ||
     window.location.hostname === "127.0.0.1")
        ? "http://127.0.0.1:8000"
        : "";


// ==========================================
// ORBIT — WEATHER SYSTEM
// ==========================================


const WEATHER_API =
    "https://api.open-meteo.com/v1/forecast";


// ==========================================
// CLOCK
// ==========================================

function updateClock() {

    const now = new Date();

    const hours =
        String(now.getHours()).padStart(2, "0");

    const minutes =
        String(now.getMinutes()).padStart(2, "0");

    document.getElementById("time")
        .textContent = `${hours}:${minutes}`;
}


// ==========================================
// DATE
// ==========================================

function updateDate() {

    const now = new Date();

    const options = {
        day: "2-digit",
        month: "long",
        year: "numeric"
    };

    let date =
        now.toLocaleDateString(
            "en-GB",
            options
        );

    document.getElementById("date")
        .textContent = date.toUpperCase();
}


// ==========================================
// WEATHER CODE
// ==========================================

function getWeatherInfo(code) {

    const weather = {

        0: {
            description: "CLEAR SKY",
            icon: "☀️"
        },

        1: {
            description: "MAINLY CLEAR",
            icon: "🌤️"
        },

        2: {
            description: "PARTLY CLOUDY",
            icon: "⛅"
        },

        3: {
            description: "OVERCAST",
            icon: "☁️"
        },

        45: {
            description: "FOG",
            icon: "🌫️"
        },

        48: {
            description: "RIME FOG",
            icon: "🌫️"
        },

        51: {
            description: "LIGHT DRIZZLE",
            icon: "🌦️"
        },

        53: {
            description: "DRIZZLE",
            icon: "🌦️"
        },

        55: {
            description: "HEAVY DRIZZLE",
            icon: "🌧️"
        },

        61: {
            description: "LIGHT RAIN",
            icon: "🌦️"
        },

        63: {
            description: "RAIN",
            icon: "🌧️"
        },

        65: {
            description: "HEAVY RAIN",
            icon: "🌧️"
        },

        71: {
            description: "LIGHT SNOW",
            icon: "🌨️"
        },

        73: {
            description: "SNOW",
            icon: "❄️"
        },

        75: {
            description: "HEAVY SNOW",
            icon: "❄️"
        },

        80: {
            description: "RAIN SHOWERS",
            icon: "🌦️"
        },

        81: {
            description: "RAIN SHOWERS",
            icon: "🌧️"
        },

        82: {
            description: "HEAVY SHOWERS",
            icon: "⛈️"
        },

        95: {
            description: "THUNDERSTORM",
            icon: "⛈️"
        },

        96: {
            description: "THUNDERSTORM + HAIL",
            icon: "⛈️"
        },

        99: {
            description: "HEAVY THUNDERSTORM",
            icon: "⛈️"
        }

    };


    return weather[code] || {
        description: "UNKNOWN",
        icon: "❔"
    };
}


// ==========================================
// WIND DIRECTION
// ==========================================

function getWindDirection(degrees) {

    const directions = [
        "N",
        "NE",
        "E",
        "SE",
        "S",
        "SW",
        "W",
        "NW"
    ];

    const index =
        Math.round(degrees / 45) % 8;

    return directions[index];
}


// ==========================================
// LOCATION
// ==========================================

function getLocation() {
    const locationName = document.getElementById("location-name");

    if (!navigator.geolocation) {
        locationName.textContent = "GEOLOCATION NOT SUPPORTED";
        return;
    }

    locationName.textContent = "DETECTING LOCATION...";

    navigator.geolocation.getCurrentPosition(
        position => {
            const latitude = position.coords.latitude;
            const longitude = position.coords.longitude;

            console.log("Coordinates:", latitude, longitude);

            // Meteo
            getWeather(latitude, longitude);

            // Coordinate → località
            reverseGeocode(latitude, longitude);
        },

        error => {
            console.error("Geolocation error:", error);

            locationName.textContent = "LOCATION UNAVAILABLE";
        },

        {
            enableHighAccuracy: true,
            timeout: 15000,
            maximumAge: 300000
        }
    );
}


// ==========================================
// GET WEATHER
// ==========================================

async function getWeather(
    latitude,
    longitude
) {

    try {

        const url =
            `${WEATHER_API}?` +

            `latitude=${latitude}` +

            `&longitude=${longitude}` +

            `&current=` +

            `temperature_2m,` +
            `apparent_temperature,` +
            `relative_humidity_2m,` +
            `cloud_cover,` +
            `wind_speed_10m,` +
            `wind_direction_10m,` +
            `weather_code,` +
            `visibility` +

            `&daily=` +

            `sunrise,` +
            `sunset` +

            `&forecast_days=1` +

            `&timezone=auto`;


        console.log(
            "ORBIT WEATHER REQUEST:",
            url
        );


        const response =
            await fetch(url);


        if (!response.ok) {

            throw new Error(
                `HTTP ${response.status}`
            );
        }


        const data =
            await response.json();


        console.log(
            "ORBIT WEATHER:",
            data
        );


        updateWeather(data);

    }


    catch (error) {

        console.error(
            "WEATHER ERROR:",
            error
        );

    }
}


// ==========================================
// UPDATE WEATHER
// ==========================================

function updateWeather(data) {

    const current =
        data.current;


    // --------------------------------------
    // Temperature
    // --------------------------------------

    document.getElementById("temperature")
        .textContent =
        `${Math.round(
            current.temperature_2m
        )}°C`;


    // --------------------------------------
    // Feels like
    // --------------------------------------

    document.getElementById("feels-like")
        .textContent =
        `Feels like ${Math.round(
            current.apparent_temperature
        )}°C`;


    // --------------------------------------
    // Clouds
    // --------------------------------------

    document.getElementById("clouds")
        .textContent =
        `${Math.round(
            current.cloud_cover
        )}%`;


    // --------------------------------------
    // Humidity
    // --------------------------------------

    document.getElementById("humidity")
        .textContent =
        `${Math.round(
            current.relative_humidity_2m
        )}%`;


    // --------------------------------------
    // Wind
    // --------------------------------------

    document.getElementById("wind")
        .textContent =
        `${Math.round(
            current.wind_speed_10m
        )} km/h`;


    // --------------------------------------
    // Wind direction
    // --------------------------------------

    document.getElementById("wind-direction")
        .textContent =
        getWindDirection(
            current.wind_direction_10m
        );


    // --------------------------------------
    // Visibility
    // --------------------------------------

    document.getElementById("visibility")
        .textContent =
        `${Math.round(
            current.visibility / 1000
        )} km`;


    // --------------------------------------
    // Weather description
    // --------------------------------------

    const weatherInfo =
        getWeatherInfo(
            current.weather_code
        );


    document.getElementById(
        "weather-description"
    ).textContent =
        weatherInfo.description;


    document.getElementById(
        "weather-icon"
    ).textContent =
        weatherInfo.icon;


    // --------------------------------------
    // Sunrise
    // --------------------------------------

    const sunrise =
        data.daily.sunrise[0];


    document.getElementById("sunrise")
        .textContent =
        formatTime(sunrise);


    // --------------------------------------
    // Sunset
    // --------------------------------------

    const sunset =
        data.daily.sunset[0];


    document.getElementById("sunset")
        .textContent =
        formatTime(sunset);


    // --------------------------------------
    // Astronomy conditions
    // --------------------------------------

    updateSkyQuality(
        current.cloud_cover,
        current.visibility,
        current.relative_humidity_2m
    );
}


// ==========================================
// FORMAT TIME
// ==========================================

function formatTime(timeString) {

    const date =
        new Date(timeString);

    return date.toLocaleTimeString(
        "it-IT",
        {
            hour: "2-digit",
            minute: "2-digit"
        }
    );
}


// ==========================================
// SKY QUALITY
// ==========================================

function updateSkyQuality(
    clouds,
    visibility,
    humidity
) {

    let score = 100;


    // Clouds are bad for astronomy

    score -= clouds * 0.7;


    // Humidity

    if (humidity > 80) {
        score -= 15;
    }

    else if (humidity > 65) {
        score -= 8;
    }


    // Visibility

    const visibilityKm =
        visibility / 1000;


    if (visibilityKm < 5) {
        score -= 25;
    }

    else if (visibilityKm < 10) {
        score -= 12;
    }


    score =
        Math.max(
            0,
            Math.min(
                100,
                Math.round(score)
            )
        );


    // Update percentage

    document.getElementById(
        "sky-visibility"
    ).textContent = score;


    document.getElementById(
        "sky-progress"
    ).style.width =
        `${score}%`;


    const quality =
        document.getElementById(
            "sky-quality"
        );


    const icon =
        document.getElementById(
            "sky-icon"
        );


    quality.classList.remove(
        "sky-good",
        "sky-medium",
        "sky-poor"
    );


    // --------------------------------------
    // Excellent
    // --------------------------------------

    if (score >= 75) {

        quality.textContent =
            "EXCELLENT";

        quality.classList.add(
            "sky-good"
        );

        icon.textContent = "✦";
    }


    // --------------------------------------
    // Good
    // --------------------------------------

    else if (score >= 50) {

        quality.textContent =
            "GOOD";

        quality.classList.add(
            "sky-medium"
        );

        icon.textContent = "✧";
    }


    // --------------------------------------
    // Poor
    // --------------------------------------

    else {

        quality.textContent =
            "POOR";

        quality.classList.add(
            "sky-poor"
        );

        icon.textContent = "☁";
    }
}


// ==========================================
// REFRESH WEATHER
// ==========================================

function refreshWeather() {

    navigator.geolocation.getCurrentPosition(

        function(position) {

            getWeather(
                position.coords.latitude,
                position.coords.longitude
            );

        },

        function(error) {

            console.error(
                "Unable to refresh location:",
                error
            );

        },

        {
            enableHighAccuracy: true,

            timeout: 15000,

            maximumAge: 300000
        }
    );
}


// ==========================================
// INITIALIZE
// ==========================================

function initializeOrbit() {

    updateClock();

    updateDate();

    getLocation();
}


// ==========================================
// CLOCK UPDATE
// ==========================================

setInterval(
    updateClock,
    1000
);


// ==========================================
// WEATHER UPDATE
// ==========================================

// Every 10 minutes

setInterval(
    refreshWeather,
    10 * 60 * 1000
);


// ==========================================
// START
// ==========================================

initializeOrbit();

async function reverseGeocode(latitude, longitude) {
    const locationName = document.getElementById("location-name");

    try {
        locationName.textContent = "DETECTING LOCATION...";

        const url =
            `https://nominatim.openstreetmap.org/reverse` +
            `?lat=${latitude}` +
            `&lon=${longitude}` +
            `&format=jsonv2` +
            `&addressdetails=1` +
            `&zoom=10` +
            `&accept-language=it`;

        const response = await fetch(url);

        if (!response.ok) {
            throw new Error("Reverse geocoding failed");
        }

        const data = await response.json();

        const address = data.address || {};

        // Cerca la località più significativa disponibile
        const city =
            address.city ||
            address.town ||
            address.village ||
            address.municipality ||
            address.county ||
            "UNKNOWN LOCATION";

        const state = address.state || "";

        if (state) {
            locationName.textContent = `${city}, ${state}`;
        } else {
            locationName.textContent = city;
        }

    } catch (error) {
        console.error("Reverse geocoding error:", error);

        locationName.textContent = "LOCATION UNAVAILABLE";
    }
}

/* =========================================
   ORBIT — ASTRONOMICAL ENGINE
   NASA / JPL HORIZONS
   ========================================= */



const CELESTIAL_OBJECTS = [
    { name: "SUN", command: "10", symbol: "☀" },
    { name: "MOON", command: "301", symbol: "☾" },
    { name: "MERCURY", command: "199", symbol: "☿" },
    { name: "VENUS", command: "299", symbol: "♀" },
    { name: "MARS", command: "499", symbol: "♂" },
    { name: "JUPITER", command: "599", symbol: "♃" },
    { name: "SATURN", command: "699", symbol: "♄" }
];


// ==========================================
// FORMAT ANGLE
// ==========================================

function formatAngle(value) {

    const number = Number(value);

    if (!Number.isFinite(number)) {
        return "--°";
    }

    return `${number.toFixed(1)}°`;
}


// ==========================================
// CREATE HORIZONS URL
// ==========================================

function createHorizonsURL(
    command,
    latitude,
    longitude
) {

    const now = new Date();

    const startTime =
        now.toISOString();

    const stopTime =
        new Date(
            now.getTime() + 2 * 60 * 1000
        ).toISOString();


    const params =
        new URLSearchParams({

            format: "json",

            COMMAND: `'${command}'`,

            OBJ_DATA: "NO",

            MAKE_EPHEM: "YES",

            EPHEM_TYPE: "OBSERVER",

            /*
                IMPORTANT:

                399 = Earth

                coord@399 = custom observer
                coordinates on Earth
            */

            CENTER: "'coord@399'",

            COORD_TYPE: "GEODETIC",

            /*
                Horizons expects:

                East longitude,
                latitude,
                altitude km
            */

            SITE_COORD:
                `'${longitude},${latitude},0'`,

            START_TIME:
                `'${startTime}'`,

            STOP_TIME:
                `'${stopTime}'`,

            STEP_SIZE:
                "'1 m'",

            /*
                Quantity 4 =
                Apparent Azimuth & Elevation
            */

            QUANTITIES:
                "'4'",

            /*
                Return table as CSV
            */

            CSV_FORMAT:
                "YES",

            /*
                Do NOT remove objects
                during daylight.

                We want to know their
                actual position anyway.
            */

            SKIP_DAYLT:
                "NO",

            /*
                Do not filter objects below
                the horizon.
            */

            ELEV_CUT:
                "'-90'"

        });


    return `${HORIZONS_API}?${params.toString()}`;
}


// ==========================================
// GET ONE OBJECT
// ==========================================

async function getCelestialPosition(
    object,
    latitude,
    longitude
) {

    try {

        const url =
            API_BASE +
            `/api/astronomy?command=${object.command}` +
            `&latitude=${latitude}` +
            `&longitude=${longitude}`;

        console.log(
            `ORBIT → BACKEND → ${object.name}:`,
            url
        );

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Backend HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            `BACKEND → ${object.name}:`,
            data
        );

        if (!data.result) {

            throw new Error(
                "JPL result missing"
            );

        }

        return parseHorizonsResult(
            data.result
        );

    }

    catch (error) {

        console.error(
            `ASTRONOMY ERROR — ${object.name}:`,
            error
        );

        return null;

    }

}


// ==========================================
// PARSE HORIZONS
// ==========================================

function parseHorizonsResult(result) {

    /*
        Horizons wraps the actual data between:

        $$SOE
        ...
        $$EOE
    */

    const startIndex =
        result.indexOf("$$SOE");


    const endIndex =
        result.indexOf("$$EOE");


    if (
        startIndex === -1 ||
        endIndex === -1
    ) {

        console.error(
            "Horizons did not return an ephemeris table."
        );

        console.error(
            result
        );

        return null;
    }


    const section =
        result
            .substring(
                startIndex + 5,
                endIndex
            )
            .trim();


    const lines =
        section
            .split(/\r?\n/)
            .map(line => line.trim())
            .filter(line => line.length > 0);


    if (!lines.length) {

        console.error(
            "Horizons ephemeris is empty."
        );

        return null;
    }


    /*
        Because CSV_FORMAT=YES is enabled,
        we can split the first data line.

        Observer tables contain:

        TIME
        SOLAR PRESENCE
        LUNAR PRESENCE
        AZIMUTH
        ELEVATION
    */

    const values =
        lines[0]
            .split(",")
            .map(value =>
                value.trim()
            );


    console.log(
        "HORIZONS CSV VALUES:",
        values
    );


    /*
        Expected structure:

        [0] date/time
        [1] solar presence
        [2] lunar presence
        [3] azimuth
        [4] elevation
    */


    if (values.length < 5) {

        console.error(
            "Unexpected Horizons CSV format:",
            values
        );

        return null;
    }


    const azimuth =
        parseFloat(values[3]);


    const elevation =
        parseFloat(values[4]);


    if (
        !Number.isFinite(azimuth) ||
        !Number.isFinite(elevation)
    ) {

        console.error(
            "Could not read AZ/EL:",
            {
                values,
                azimuth,
                elevation
            }
        );

        return null;
    }


    return {

        azimuth,
        elevation,

        solarPresence:
            values[1],

        lunarPresence:
            values[2]

    };

}


// ==========================================
// VISIBILITY STATE
// ==========================================

function getVisibilityState(
    elevation
) {

    /*
        More than 15° above horizon
        = comfortably visible
    */

    if (elevation >= 15) {

        return {

            state: "VISIBLE",

            className: "visible"

        };

    }


    /*
        Between 0° and 15°
        = very low
    */

    if (elevation >= 0) {

        return {

            state: "LOW ON HORIZON",

            className: "low"

        };

    }


    /*
        Below horizon
    */

    return {

        state: "BELOW HORIZON",

        className: "hidden"

    };

}

function createCelestialCards() {

    const grid = document.getElementById("celestial-grid");

    if (!grid) {
        console.error("ORBIT: celestial-grid not found");
        return;
    }

    grid.innerHTML = "";

    CELESTIAL_OBJECTS.forEach(object => {

        const card = document.createElement("div");

        card.className = "celestial-card loading";
        card.dataset.object = object.name;

        card.innerHTML = `
            <div class="celestial-header">

                <span class="celestial-symbol">
                    ${object.symbol}
                </span>

                <span class="celestial-name">
                    ${object.name}
                </span>

            </div>

            <div class="celestial-state">
                CALCULATING...
            </div>

            <div class="celestial-data">

                <div>
                    <span>ALT</span>
                    <strong class="celestial-alt">--°</strong>
                </div>

                <div>
                    <span>AZ</span>
                    <strong class="celestial-az">--°</strong>
                </div>

            </div>`;

        grid.appendChild(card);

    });

}

// ==========================================
// UPDATE CARD
// ==========================================

function updateCelestialCard(
    card,
    object,
    data
) {

    if (!card) {
        return;
    }


    const state =
        card.querySelector(
            ".celestial-state"
        );


    const values =
        card.querySelectorAll(
            ".celestial-data strong"
        );


    /*
        API error
    */

    if (!data) {

        card.classList.remove(
            "loading",
            "visible",
            "low",
            "hidden"
        );


        card.classList.add(
            "hidden"
        );


        if (state) {

            state.textContent =
                "DATA UNAVAILABLE";

        }


        return;
    }


    /*
        Determine visibility
    */

    const visibility =
        getVisibilityState(
            data.elevation
        );


    /*
        Update card class
    */

    card.classList.remove(
        "loading",
        "visible",
        "low",
        "hidden"
    );


    card.classList.add(
        visibility.className
    );


    /*
        Update status
    */

    if (state) {

        state.textContent =
            visibility.state;

    }


    /*
        Update elevation
    */

    if (values[0]) {

        values[0].textContent =
            formatAngle(
                data.elevation
            );

    }


    /*
        Update azimuth
    */

    if (values[1]) {

        values[1].textContent =
            formatAngle(
                data.azimuth
            );

    }

    updateSkyView();

}


// ==========================================
// UPDATE WHOLE SKY
// ==========================================

async function updateAstronomicalData(
    latitude,
    longitude
) {

    const status =
        document.getElementById(
            "astronomy-status"
        );


    const grid =
        document.getElementById(
            "celestial-grid"
        );


    if (!status || !grid) {

        console.error(
            "Astronomy HTML elements not found."
        );

        return;
    }


    status.textContent =
        "CONNECTING TO JPL HORIZONS...";


    const cards =
        grid.querySelectorAll(
            ".celestial-card"
        );


    /*
        Reset cards
    */

    cards.forEach(card => {

        card.classList.remove(
            "visible",
            "low",
            "hidden"
        );

        card.classList.add(
            "loading"
        );

        const state =
            card.querySelector(
                ".celestial-state"
            );

        if (state) {

            state.textContent =
                "CALCULATING...";

        }

    });


    /*
        Query every celestial object
    */

    for (
        let i = 0;
        i < CELESTIAL_OBJECTS.length;
        i++
    ) {

        const object =
            CELESTIAL_OBJECTS[i];


        const card =
            cards[i];


        const data =
            await getCelestialPosition(
                object,
                latitude,
                longitude
            );


        updateCelestialCard(
            card,
            object,
            data
        );

    }


    /*
        Finished
    */

    const time =
        new Date()
            .toLocaleTimeString(
                "it-IT",
                {
                    hour: "2-digit",
                    minute: "2-digit"
                }
            );


    status.textContent =
        `SKY POSITION UPDATED · ${time}`;

}




/* -----------------------------------------
   CONNECT TO GEOLOCATION
   ----------------------------------------- */

async function initializeAstronomy() {

    createCelestialCards();


    navigator.geolocation.getCurrentPosition(

        async position => {

            const latitude =
                position.coords.latitude;

            const longitude =
                position.coords.longitude;


            // ----------------------------------
            // Astronomical objects
            // ----------------------------------

            await updateAstronomicalData(
                latitude,
                longitude
            );


            // ----------------------------------
            // Sun times
            // ----------------------------------

            const sunTimes =
                await getSunTimes(
                    latitude,
                    longitude
                );


            if (sunTimes) {

                const sunrise =
                    document.getElementById("sunrise");

                const sunset =
                    document.getElementById("sunset");


                if (sunrise) {

                    sunrise.textContent =
                        sunTimes.sunrise;

                }


                if (sunset) {

                    sunset.textContent =
                        sunTimes.sunset;

                }

            }

        },


        error => {

            console.error(
                "GEOLOCATION ERROR:",
                error
            );

        }

    );

}


/* -----------------------------------------
   INITIALIZE
   ----------------------------------------- */

initializeAstronomy();

async function getSunTimes(latitude, longitude) {

    try {

        const timezone =
            Intl.DateTimeFormat().resolvedOptions().timeZone;

        const url =
            API_BASE +
            `/api/sun-times?latitude=${latitude}` +
            `&longitude=${longitude}` +
            `&timezone_name=${encodeURIComponent(timezone)}`;

        console.log(
            "ORBIT → BACKEND → SUN TIMES:",
            url
        );

        const response =
            await fetch(url);

        if (!response.ok) {

            throw new Error(
                `Backend HTTP ${response.status}`
            );

        }

        const data =
            await response.json();

        console.log(
            "BACKEND → SUN TIMES:",
            data
        );

        return data;

    }

    catch (error) {

        console.error(
            "SUN TIMES ERROR:",
            error
        );

        return null;

    }

}

/* =========================================
   ORBIT — PLANETARY EVENTS
========================================= */


// ==========================================
// FORMAT EVENT DATE
// ==========================================

function formatEventDate(dateString) {

    if (!dateString) {
        return "--";
    }

    const cleaned =
        dateString
            .replace("A.D. ", "")
            .trim();

    const match =
        cleaned.match(
            /^(\d{4})-([A-Za-z]{3})-(\d{2})\s+(\d{2}):(\d{2})/
        );

    if (!match) {
        return dateString;
    }

    const [
        ,
        year,
        month,
        day,
        hour,
        minute
    ] = match;

    const months = {
        Jan: "JAN",
        Feb: "FEB",
        Mar: "MAR",
        Apr: "APR",
        May: "MAY",
        Jun: "JUN",
        Jul: "JUL",
        Aug: "AUG",
        Sep: "SEP",
        Oct: "OCT",
        Nov: "NOV",
        Dec: "DEC"
    };

    return `${day} ${months[month] || month} ${year} · ${hour}:${minute}`;
}


// ==========================================
// AU → MILLION KM
// ==========================================

function auToMillionKm(au) {

    const value = Number(au);

    if (!Number.isFinite(value)) {
        return "--";
    }

    return (
        value * 149.5978707
    ).toFixed(2);
}


// ==========================================
// LOAD EVENTS
// ==========================================

async function loadPlanetaryEvents() {

    const conjunctionGrid =
        document.getElementById(
            "conjunction-grid"
        );

    const approachGrid =
        document.getElementById(
            "approach-grid"
        );

    if (!conjunctionGrid || !approachGrid) {
        return;
    }


    conjunctionGrid.innerHTML =
        `<div class="events-loading">
            LOADING PLANETARY EVENTS...
        </div>`;

    approachGrid.innerHTML =
        `<div class="events-loading">
            CALCULATING CLOSEST APPROACHES...
        </div>`;


    try {

        console.log(
            "ORBIT → BACKEND → PLANETARY EVENTS"
        );


        const response =
            await fetch(
                API_BASE + "/api/events"
            );


        if (!response.ok) {

            throw new Error(
                `Backend HTTP ${response.status}`
            );

        }


        const data =
            await response.json();


        console.log(
            "BACKEND → PLANETARY EVENTS:",
            data
        );


        renderConjunctions(
            data.conjunctions || []
        );


        renderClosestApproaches(
            data.closest_approaches || []
        );

    }


    catch (error) {

        console.error(
            "PLANETARY EVENTS ERROR:",
            error
        );


        conjunctionGrid.innerHTML =
            `<div class="events-loading">
                PLANETARY DATA UNAVAILABLE
            </div>`;


        approachGrid.innerHTML =
            `<div class="events-loading">
                PLANETARY DATA UNAVAILABLE
            </div>`;

    }

}

// ==========================================
// RENDER CONJUNCTIONS
// ==========================================

function renderConjunctions(
    conjunctions
) {

    const grid =
        document.getElementById(
            "conjunction-grid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    if (!conjunctions.length) {

        grid.innerHTML =
            `<div class="events-loading">
                NO UPCOMING CONJUNCTIONS
            </div>`;

        return;
    }


    /*
        Backend already sorts events
        chronologically.
    */

    const next =
        conjunctions[0];


    // --------------------------------------
    // Next conjunction
    // --------------------------------------

    const nextPlanets =
        document.getElementById(
            "next-conjunction-planets"
        );


    const nextDate =
        document.getElementById(
            "next-conjunction-date"
        );


    const nextSeparation =
        document.getElementById(
            "next-conjunction-separation"
        );


    if (nextPlanets) {

        nextPlanets.textContent =
            `${next.planet_a} × ${next.planet_b}`;

    }


    if (nextDate) {

        nextDate.textContent =
            formatEventDate(
                next.date
            );

    }


    if (nextSeparation) {

        nextSeparation.textContent =
            `${Number(
                next.separation_deg
            ).toFixed(2)}°`;

    }


    // --------------------------------------
    // Event list
    // --------------------------------------

    conjunctions.forEach(
        event => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "event-item";


            card.innerHTML = `

                <div class="event-item-planets">
                    ${event.planet_a}
                    ×
                    ${event.planet_b}
                </div>

                <div class="event-item-date">
                    ${formatEventDate(event.date)}
                </div>

                <div class="event-item-bottom">

                    <span>
                        SEPARATION
                    </span>

                    <strong>
                        ${Number(
                            event.separation_deg
                        ).toFixed(2)}°
                    </strong>

                </div>

            `;


            grid.appendChild(card);

        }
    );

}


// ==========================================
// RENDER CLOSEST APPROACHES
// ==========================================

function renderClosestApproaches(
    approaches
) {

    const grid =
        document.getElementById(
            "approach-grid"
        );


    if (!grid) {
        return;
    }


    grid.innerHTML = "";


    if (!approaches.length) {

        grid.innerHTML =
            `<div class="events-loading">
                NO APPROACH DATA
            </div>`;

        return;
    }


    approaches.forEach(
        event => {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "approach-item";


            const millionKm =
                auToMillionKm(
                    event.distance_au
                );


            card.innerHTML = `

                <div class="approach-planet">
                    ${event.planet}
                </div>

                <div class="approach-date">
                    ${formatEventDate(event.date)}
                </div>

                <div class="approach-distance">

                    <strong>
                        ${Number(
                            event.distance_au
                        ).toFixed(6)}
                        AU
                    </strong>

                    <span>
                        ≈ ${millionKm} MILLION KM
                    </span>

                </div>

            `;


            grid.appendChild(card);

        }
    );

}


// ==========================================
// START EVENTS
// ==========================================

loadPlanetaryEvents();

/* =========================================
   LIVE SKY VIEW
========================================= */

const skyMap = document.getElementById("sky-map");

const skyMapContext = skyMap
    ? skyMap.getContext("2d")
    : null;


let skyMapObjects = [];


/* =========================================
   OBJECT COLORS / SYMBOLS
========================================= */

const SKY_OBJECT_STYLE = {

    SUN: {
        color: "#ffd56a",
        size: 9,
        symbol: "☀"
    },

    MOON: {
        color: "#e8edf7",
        size: 8,
        symbol: "☾"
    },

    MERCURY: {
        color: "#b7b7b7",
        size: 5,
        symbol: "☿"
    },

    VENUS: {
        color: "#ffe0a3",
        size: 6,
        symbol: "♀"
    },

    MARS: {
        color: "#ff806f",
        size: 6,
        symbol: "♂"
    },

    JUPITER: {
        color: "#d7b58a",
        size: 7,
        symbol: "♃"
    },

    SATURN: {
        color: "#d8c28c",
        size: 7,
        symbol: "♄"
    }

};


/* =========================================
   CANVAS RESIZE
========================================= */

function resizeSkyMap() {

    if (!skyMap || !skyMapContext) {
        return;
    }

    const rect =
        skyMap.getBoundingClientRect();

    const dpr =
        window.devicePixelRatio || 1;

    skyMap.width =
        rect.width * dpr;

    skyMap.height =
        rect.height * dpr;

    skyMapContext.setTransform(
        dpr,
        0,
        0,
        dpr,
        0,
        0
    );

    drawSkyMap();

}


/* =========================================
   ALT/AZ → SCREEN
========================================= */

function skyCoordinatesToScreen(
    altitude,
    azimuth,
    centerX,
    centerY,
    radius
) {

    /*
        Horizon = outer circle
        Zenith  = center

        altitude:
            0°  = edge
            90° = center
    */

    const altitudeClamped =
        Math.max(
            0,
            Math.min(90, altitude)
        );

    const distance =
        radius *
        (1 - altitudeClamped / 90);

    const angle =
        (azimuth - 0) *
        Math.PI / 180;

    const x =
        centerX +
        Math.sin(angle) * distance;

    const y =
        centerY -
        Math.cos(angle) * distance;

    return {
        x,
        y
    };

}


/* =========================================
   DRAW SKY MAP
========================================= */

function drawSkyMap() {

    if (!skyMap || !skyMapContext) {
        return;
    }

    const rect =
        skyMap.getBoundingClientRect();

    const width =
        rect.width;

    const height =
        rect.height;

    const centerX =
        width / 2;

    const centerY =
        height / 2;

    const radius =
        Math.min(width, height) * 0.43;


    /* CLEAR */

    skyMapContext.clearRect(
        0,
        0,
        width,
        height
    );


    /* BACKGROUND */

    const gradient =
        skyMapContext.createRadialGradient(
            centerX,
            centerY,
            0,
            centerX,
            centerY,
            radius
        );

    gradient.addColorStop(
        0,
        "rgba(30, 45, 75, 0.35)"
    );

    gradient.addColorStop(
        0.65,
        "rgba(10, 18, 32, 0.35)"
    );

    gradient.addColorStop(
        1,
        "rgba(5, 7, 13, 0.05)"
    );

    skyMapContext.beginPath();

    skyMapContext.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );

    skyMapContext.fillStyle =
        gradient;

    skyMapContext.fill();


    /* HORIZON */

    skyMapContext.beginPath();

    skyMapContext.arc(
        centerX,
        centerY,
        radius,
        0,
        Math.PI * 2
    );

    skyMapContext.strokeStyle =
        "rgba(122, 167, 255, 0.35)";

    skyMapContext.lineWidth = 1.5;

    skyMapContext.stroke();


    /* ALTITUDE CIRCLES */

    [30, 60].forEach(
        altitude => {

            const circleRadius =
                radius *
                (1 - altitude / 90);

            skyMapContext.beginPath();

            skyMapContext.arc(
                centerX,
                centerY,
                circleRadius,
                0,
                Math.PI * 2
            );

            skyMapContext.strokeStyle =
                "rgba(255,255,255,0.06)";

            skyMapContext.lineWidth = 1;

            skyMapContext.stroke();

        }
    );


    /* CROSSHAIR */

    skyMapContext.beginPath();

    skyMapContext.moveTo(
        centerX - radius,
        centerY
    );

    skyMapContext.lineTo(
        centerX + radius,
        centerY
    );

    skyMapContext.moveTo(
        centerX,
        centerY - radius
    );

    skyMapContext.lineTo(
        centerX,
        centerY + radius
    );

    skyMapContext.strokeStyle =
        "rgba(255,255,255,0.04)";

    skyMapContext.stroke();


    /* OBJECTS */

    skyMapObjects.forEach(
        object => {

            if (
                typeof object.altitude !== "number" ||
                typeof object.azimuth !== "number"
            ) {
                return;
            }

            if (object.altitude < 0) {
                return;
            }


            const position =
                skyCoordinatesToScreen(
                    object.altitude,
                    object.azimuth,
                    centerX,
                    centerY,
                    radius
                );


            const style =
                SKY_OBJECT_STYLE[
                    object.name
                ];

            if (!style) {
                return;
            }


            /* GLOW */

            skyMapContext.beginPath();

            skyMapContext.arc(
                position.x,
                position.y,
                style.size * 2.5,
                0,
                Math.PI * 2
            );

            skyMapContext.save();

            skyMapContext.globalAlpha = 0.08;

            skyMapContext.beginPath();

            skyMapContext.arc(
                position.x,
                position.y,
                style.size * 2.5,
                0,
                Math.PI * 2
            );

            skyMapContext.fillStyle = style.color;
            skyMapContext.fill();

            skyMapContext.restore();


            /* OBJECT */

            skyMapContext.beginPath();

            skyMapContext.arc(
                position.x,
                position.y,
                style.size / 2,
                0,
                Math.PI * 2
            );

            skyMapContext.fillStyle =
                style.color;

            skyMapContext.shadowColor =
                style.color;

            skyMapContext.shadowBlur = 12;

            skyMapContext.fill();

            skyMapContext.shadowBlur = 0;


            /* LABEL */

            skyMapContext.font =
                '8px "Space Mono"';

            skyMapContext.fillStyle =
                style.color;

            skyMapContext.textAlign =
                "center";

            skyMapContext.fillText(
                object.name,
                position.x,
                position.y -
                style.size -
                7
            );

        }
    );

}


/* =========================================
   UPDATE SKY VIEW
========================================= */

function updateSkyView() {

    if (!skyMap) {
        return;
    }

    skyMapObjects = [];

    CELESTIAL_OBJECTS.forEach(object => {

        const card =
            document.querySelector(
                `[data-object="${object.name}"]`
            );

        if (!card) {
            return;
        }

        const altElement =
            card.querySelector(
                ".celestial-alt"
            );

        const azElement =
            card.querySelector(
                ".celestial-az"
            );

        if (!altElement || !azElement) {
            return;
        }

        const altitude =
            parseFloat(
                altElement.textContent
                    .replace("°", "")
            );

        const azimuth =
            parseFloat(
                azElement.textContent
                    .replace("°", "")
            );

        if (
            !Number.isFinite(altitude) ||
            !Number.isFinite(azimuth)
        ) {
            return;
        }

        skyMapObjects.push({

            name: object.name,

            altitude: altitude,

            azimuth: azimuth

        });

    });

    drawSkyMap();
}


/* =========================================
   WINDOW RESIZE
========================================= */

window.addEventListener(
    "resize",
    resizeSkyMap
);


/* =========================================
   INITIALIZE
========================================= */

if (skyMap) {

    resizeSkyMap();

}