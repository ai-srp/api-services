const axios = require('axios');

exports.fetchWeatherByCoordinates = async (latitude, longitude) => {
  try {
    // Using Open-Meteo API which is free and doesn't require an API key
    const url = 'https://api.open-meteo.com/v1/forecast';
    
    const response = await axios.get(url, {
      params: {
        latitude,
        longitude,
        current: [
          'temperature_2m',
          'relative_humidity_2m',
          'apparent_temperature',
          'is_day',
          'precipitation',
          'rain',
          'showers',
          'snowfall',
          'weather_code',
          'cloud_cover',
          'pressure_msl',
          'surface_pressure',
          'wind_speed_10m',
          'wind_direction_10m',
        ],
        timezone: 'auto'
      }
    });
    
    return response.data;
  } catch (error) {
    console.error(`Error fetching weather data:`, error.message);
    throw error;
  }
};