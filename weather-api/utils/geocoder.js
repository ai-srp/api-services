const axios = require('axios');

exports.getCoordinates = async (cityName) => {
  try {
    // Using Open-Meteo Geocoding API which is free
    const response = await axios.get('https://geocoding-api.open-meteo.com/v1/search', {
      params: {
        name: cityName,
        count: 1,
        language: 'en',
        format: 'json'
      }
    });
    
    if (!response.data.results || response.data.results.length === 0) {
      return null;
    }
    
    const location = response.data.results[0];
    
    return {
      name: location.name,
      latitude: location.latitude,
      longitude: location.longitude,
      country: location.country,
      timezone: location.timezone
    };
  } catch (error) {
    console.error(`Error geocoding city ${cityName}:`, error.message);
    throw error;
  }
};