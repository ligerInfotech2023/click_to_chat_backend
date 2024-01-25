const express = require('express');
const { userLogin } = require('../controller/userController');
const { loginValidator } = require('../validator/userValidator');

const routes = express.Router();


//Login
routes.post('/login',loginValidator(), userLogin)

module.exports = routes;