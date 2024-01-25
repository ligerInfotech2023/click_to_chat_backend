const express = require('express');
const { getDataForDashboard } = require('../controller/dashboardController');
const routes = express.Router();

//Get Category list and list by _id
routes.get('/data', getDataForDashboard)


module.exports = routes;