const express = require('express');
const routes = express.Router();

const packageCategoryRoutes = require('./packageCategoryRoute');
const packageStickerRoutes = require('./packageRoute');
const userRoutes = require('./userRoute');
const dashboardRoutes = require('./dashboardRoute')

routes.use('/sticker/category', packageCategoryRoutes);
routes.use('/sticker/package', packageStickerRoutes);
routes.use('/click-to-chat/admin', userRoutes)
routes.use('/click-to-chat/admin/dashboard', dashboardRoutes)

module.exports = routes;