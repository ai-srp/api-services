const express = require('express');
const weatherController = require('../controllers/weatherController');

const router = express.Router();

router.get('/city/:cityName', weatherController.getWeatherByCity);

module.exports = router;