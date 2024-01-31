const multer = require('multer')
const path = require('path');
const fs = require('fs');


const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        
        if(file.fieldname === 'sticker_url'){
            const packageName = req.body.package_name;
            const categoryName = req.body.package_category;
            const uploadDir = path.join(__dirname, `../uploads/${categoryName}`, packageName)

            //check if dir is exists not if not then created
            if(!fs.existsSync(uploadDir)){
                fs.mkdirSync(uploadDir, {recursive: true})
            }
            cb(null, uploadDir)
        }
        else if(file.fieldname === 'tray_image_file'){
    
            const packageName = req.body.package_name;
            const categoryName = req.body.package_category;
            const trayUploadDir = path.join(__dirname , `../uploads/${categoryName}/${packageName}/`, 'tray_image')
            if(!fs.existsSync(trayUploadDir)){
                fs.mkdirSync(trayUploadDir, {recursive: true})
            }
            cb(null, trayUploadDir)
        }
    },
    filename: (req, file, cb) => {
        if (file.fieldname === 'sticker_url') {
            cb(null, file.originalname);
        } else if (file.fieldname === 'tray_image_file') {
            cb(null, file.originalname);
        }
    }
})

const upload  = multer({
        storage:storage,
        fileFilter: (req, file, cb) => {
            checkFileType(file, cb);
        }
    }).fields([
        {
            name: 'sticker_url',
            maxCount: 100
        },
        {
            name: 'tray_image_file',
            maxCount: 1
        }
    ])

const checkFileType = (file, cb) => {
    if (file.fieldname === 'sticker_url') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
        const maxSize = 5 * 1024 * 1024 //5MB
   
        // for(const fileData of file){
            if(!allowedTypes.includes(file.mimetype)){
                //Remove uploaded file
                fs.unlinkSync(file.path);
                return res.status(400).json({ status: false, message: `Invalid file type: ${file.originalname}` });
            }
            // if(fileData.size > maxSize){
            //     //Remove uploaded file
            //     fs.unlinkSync(fileData.path);
            //     return res.status(400).json({ status: false, message: `File too large: ${fileData.originalname}` });
            // }
        // }
    } else if (file.fieldname === 'tray_image_file') {
        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png']
        const maxSize = 5 * 1024 * 1024; //5mb
        if(!allowedTypes.includes(file.mimetype)){
            fs.unlinkSync(file.path);
            return res.status(400).json({status:false, message: `Invalid file type: ${file.originalname}`})
        }
        // if(file.size > maxSize){
        //     //Remove uploaded file
        //     fs.unlinkSync(file.path);
        //     return res.status(400).json({ status: false, message: `File too large: ${file.originalname}` });
        // }
    }
    cb(null, true)
}


// Use the combined middleware in your route/controller
const uploadPackStickerMiddleware = (req, res, next) => {
    upload(req, res, (err) => {
        if (err) {
            // Handle upload error
            return res.status(400).json({ status: false, message: 'Failed to upload files of tray image and sticker', error: err.message });
        }

        // Access uploaded files as req.files.profile and req.files.sticker_url
        next();
    });
};


module.exports = {uploadPackStickerMiddleware}