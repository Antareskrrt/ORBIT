ORBIT is a web-based astronomy and weather station designed to combine real-time environmental data with astronomical calculations in a single interface.

The project retrieves the user's location, analyzes current weather conditions, calculates the positions of major celestial bodies and provides information about upcoming planetary events.

🔗 Live website: https://orbit-space-weather.onrender.com

✨ Features
🌦️ Weather

ORBIT retrieves local weather information using the user's geographical coordinates.

Current weather conditions
Cloud coverage
Humidity
Visibility
Temperature
Automatic location detection
Local sunrise and sunset
Automatic weather refresh

The weather information is provided through Open-Meteo.

🪐 Celestial Objects

ORBIT calculates the current position and visibility of major objects in the Solar System:

☀️ Sun
🌙 Moon
☿ Mercury
♀ Venus
♂ Mars
♃ Jupiter
♄ Saturn

For each object, ORBIT calculates:

Altitude
Azimuth
Visibility status
Position relative to the observer

Possible visibility states include:

VISIBLE
LOW ON HORIZON
BELOW HORIZON

Astronomical calculations are powered by NASA/JPL Horizons.

🌌 Live Sky View

The Live Sky View provides a visual representation of the current sky.

Celestial objects are positioned on a canvas according to their calculated:

Azimuth
Altitude

The visualization updates according to the observer's current location and astronomical data.

☄️ Planetary Events

ORBIT analyzes future planetary positions and calculates astronomical events.

Currently supported:

Planetary conjunctions
Closest approaches to Earth

The backend analyzes planetary vectors obtained from NASA/JPL Horizons and calculates angular separation and Earth-object distances.

The frontend communicates with the FastAPI backend through REST endpoints.

The backend acts as a proxy for external astronomical services, avoiding direct browser requests to NASA/JPL Horizons and handling calculations that are better suited to the server.

🛰️ Backend API
GET /api/astronomy

Returns the current astronomical position of a celestial object.

Parameters:

command
latitude
longitude

Example:

/api/astronomy?command=599&latitude=41.75&longitude=12.95
GET /api/sun-times

Calculates local solar events.

Returns:

{
  "date": "YYYY-MM-DD",
  "sunrise": "HH:MM",
  "sunset": "HH:MM",
  "dawn": "HH:MM",
  "dusk": "HH:MM",
  "noon": "HH:MM"
}
GET /api/events

Returns calculated planetary events.

The response contains:

Upcoming conjunctions
Closest approaches to Earth
Generation timestamp
⚡ Caching

ORBIT implements server-side caching to reduce unnecessary requests to external astronomical services.

Astronomy cache

Astronomical position requests are cached for:

60 seconds
Planetary events cache

Planetary event calculations are cached for:

24 hours

This is particularly important because planetary event calculations require multiple requests to NASA/JPL Horizons.

🛠️ Technologies
Frontend
HTML5
CSS3
JavaScript
Canvas API
Browser Geolocation API
Fetch API
Backend
Python
FastAPI
Uvicorn
Requests
Astral
External Data
NASA/JPL Horizons
Open-Meteo
OpenStreetMap Nominatim
Development & Deployment
Git
GitHub
Render
Visual Studio Code

🌍 Deployment

ORBIT is deployed as a Python Web Service on Render.

The production server runs:

uvicorn backend.main:app --host 0.0.0.0 --port $PORT

The FastAPI application serves both the backend API and the frontend website.

Every update can be deployed through the Git/GitHub workflow:

  ORBIT is an ongoing project.


👨‍💻 Author

Daniele Ciafrei

Computer Science student interested in:

Software development
Astronomy
Astrophotography
Creative technology
Game testing
Artificial intelligence
📜 License

This project is currently intended primarily as a personal and portfolio project.

See the repository for the current licensing status.

⭐ Support

If you find ORBIT interesting, consider giving the repository a ⭐ on GitHub.

Explore the sky. Understand the data. Build the future.

🌌 ORBIT
