const express = require('express');
const { addNewCategoryForSticker, getPackageCategoryList, getHomepageCategoryAndPackageList } = require('../controller/packageCategoryController');
const { uploadMiddleware } = require('../middlewares/uploadMiddleware');
const routes = express.Router();



//Add category for package
routes.post('/add', uploadMiddleware, addNewCategoryForSticker)

//Get Category list and list by _id
routes.get('/list', getPackageCategoryList)

//Get Sticker package and category list for homepage
routes.get('/home/list', getHomepageCategoryAndPackageList)

module.exports = routes;