const express = require('express');
const { addNewPackageAndSticker, getStickerPackageList } = require('../controller/packageController');
const { uploadPackStickerMiddleware } = require('../middlewares/uploadPackageSticker');

const routes = express.Router();


//Add new Package and stickers
routes.post('/add', uploadPackStickerMiddleware, addNewPackageAndSticker)

//Get list of all packages and stickers
routes.get('/list', getStickerPackageList)



module.exports = routes;