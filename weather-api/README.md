# WEATHER-API

## Getting started

Weather API is the HTTP REST API that uses Open-Meteo API to get the latest weather data for the given city.

This projects uses nodejs for the developement.

## API Details

API:  /api/weather/city/{city_name}

HTTP: GET

**Example**

http://localhost:3000/api/weather/city/london

```
{"city":"London","country":"United Kingdom","temperature":{"current":14,"feelsLike":11,"unit":"°C"},"weather":{"main":"Rain Showers","description":"slight rain showers","icon":"09d"},"wind":{"speed":12.2,"direction":227,"unit":"km/h"},"humidity":60,"pressure":1001,"visibility":6000,"timezone":"Europe/London","timestamp":"2025-04-13T15:53:21.912Z"}
```

## Setup

```
git clone https://github.com/ai-srp/api-services.git
cd api-services/weather-api
npm install
npm start
```

By default the Service will start on 3000 port
