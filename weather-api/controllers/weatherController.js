const weatherService = require('../services/weatherService');
const geocoder = require('../utils/geocoder');

exports.getWeatherByCity = async (req, res, next) => {
  try {
    const { cityName } = req.params;
    
    if (!cityName) {
      return res.status(400).json({ error: 'City name is required' });
    }
    
    // Get coordinates for the city
    const locationData = await geocoder.getCoordinates(cityName);
    
    if (!locationData) {
      return res.status(404).json({ error: 'City not found' });
    }
    
    // Get weather data using the coordinates
    const weatherData = await weatherService.fetchWeatherByCoordinates(
      locationData.latitude,
      locationData.longitude
    );
    
    // Format the response
    const response = {
      city: locationData.name,
      country: locationData.country,
      temperature: {
        current: Math.round(weatherData.current.temperature_2m),
        feelsLike: Math.round(weatherData.current.apparent_temperature),
        unit: weatherData.current_units.temperature_2m
      },
      weather: {
        // Open-Meteo doesn't provide weather descriptions directly, 
        // so we derive it from the weather code
        main: getWeatherDescription(weatherData.current.weather_code).main,
        description: getWeatherDescription(weatherData.current.weather_code).description,
        icon: getWeatherIcon(weatherData.current.weather_code)
      },
      wind: {
        speed: weatherData.current.wind_speed_10m,
        direction: weatherData.current.wind_direction_10m,
        unit: weatherData.current_units.wind_speed_10m
      },
      humidity: weatherData.current.relative_humidity_2m,
      pressure: weatherData.current.surface_pressure,
      visibility: calculateVisibility(weatherData.current.relative_humidity_2m, weatherData.current.weather_code),
      timezone: locationData.timezone,
      timestamp: new Date().toISOString()
    };
    
    res.status(200).json(response);
  } catch (error) {
    console.error('Weather API error:', error);
    next(error);
  }
};

// Helper functions for weather descriptions and icons
function getWeatherDescription(code) {
  const descriptions = {
    0: { main: 'Clear', description: 'clear sky' },
    1: { main: 'Clear', description: 'mainly clear' },
    2: { main: 'Cloudy', description: 'partly cloudy' },
    3: { main: 'Cloudy', description: 'overcast' },
    45: { main: 'Fog', description: 'fog' },
    48: { main: 'Fog', description: 'depositing rime fog' },
    51: { main: 'Drizzle', description: 'light drizzle' },
    53: { main: 'Drizzle', description: 'moderate drizzle' },
    55: { main: 'Drizzle', description: 'dense drizzle' },
    56: { main: 'Freezing Drizzle', description: 'light freezing drizzle' },
    57: { main: 'Freezing Drizzle', description: 'dense freezing drizzle' },
    61: { main: 'Rain', description: 'slight rain' },
    63: { main: 'Rain', description: 'moderate rain' },
    65: { main: 'Rain', description: 'heavy rain' },
    66: { main: 'Freezing Rain', description: 'light freezing rain' },
    67: { main: 'Freezing Rain', description: 'heavy freezing rain' },
    71: { main: 'Snow', description: 'slight snow fall' },
    73: { main: 'Snow', description: 'moderate snow fall' },
    75: { main: 'Snow', description: 'heavy snow fall' },
    77: { main: 'Snow Grains', description: 'snow grains' },
    80: { main: 'Rain Showers', description: 'slight rain showers' },
    81: { main: 'Rain Showers', description: 'moderate rain showers' },
    82: { main: 'Rain Showers', description: 'violent rain showers' },
    85: { main: 'Snow Showers', description: 'slight snow showers' },
    86: { main: 'Snow Showers', description: 'heavy snow showers' },
    95: { main: 'Thunderstorm', description: 'thunderstorm' },
    96: { main: 'Thunderstorm', description: 'thunderstorm with slight hail' },
    99: { main: 'Thunderstorm', description: 'thunderstorm with heavy hail' }
  };
  
  return descriptions[code] || { main: 'Unknown', description: 'unknown weather condition' };
}

function getWeatherIcon(code) {
  // Simple mapping of WMO codes to icon identifiers (could be expanded)
  const iconMappings = {
    0: '01d', // Clear sky (day)
    1: '02d', // Mainly clear
    2: '03d', // Partly cloudy
    3: '04d', // Overcast
    45: '50d', // Fog
    48: '50d', // Rime fog
    51: '09d', // Light drizzle
    53: '09d', // Moderate drizzle
    55: '09d', // Dense drizzle
    56: '09d', // Freezing drizzle
    57: '09d', // Dense freezing drizzle
    61: '10d', // Slight rain
    63: '10d', // Moderate rain
    65: '10d', // Heavy rain
    66: '13d', // Freezing rain
    67: '13d', // Heavy freezing rain
    71: '13d', // Slight snow
    73: '13d', // Moderate snow
    75: '13d', // Heavy snow
    77: '13d', // Snow grains
    80: '09d', // Rain showers
    81: '09d', // Moderate rain showers
    82: '09d', // Violent rain showers
    85: '13d', // Snow showers
    86: '13d', // Heavy snow showers
    95: '11d', // Thunderstorm
    96: '11d', // Thunderstorm with hail
    99: '11d'  // Thunderstorm with heavy hail
  };
  
  return iconMappings[code] || '01d';
}

function calculateVisibility(humidity, weatherCode) {
  // Simple approximation of visibility based on humidity and weather code
  // In a real app, you'd use actual visibility data if available
  
  // Base visibility in meters (10km in clear conditions)
  let baseVisibility = 10000;
  
  // Reduce for high humidity
  if (humidity > 70) {
    baseVisibility = baseVisibility * (1 - ((humidity - 70) / 100));
  }
  
  // Reduce for certain weather conditions
  const fogCodes = [45, 48];
  const rainCodes = [51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82];
  const snowCodes = [71, 73, 75, 77, 85, 86];
  const thunderstormCodes = [95, 96, 99];
  
  if (fogCodes.includes(weatherCode)) {
    baseVisibility = baseVisibility * 0.1; // Heavy reduction for fog
  } else if (rainCodes.includes(weatherCode)) {
    baseVisibility = baseVisibility * 0.6; // Moderate reduction for rain
  } else if (snowCodes.includes(weatherCode)) {
    baseVisibility = baseVisibility * 0.4; // Significant reduction for snow
  } else if (thunderstormCodes.includes(weatherCode)) {
    baseVisibility = baseVisibility * 0.3; // Heavy reduction for thunderstorms
  }
  
  return Math.round(baseVisibility);
}