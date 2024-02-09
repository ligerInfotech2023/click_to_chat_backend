const multer = require('multer')
const path = require('path');
const fs = require('fs').promises;
const sharp = require('sharp')


const storage = multer.diskStorage({
    destination: async(req, file, cb) => {
        const packageName = req.body.package_name;
        const categoryName = req.body.package_category;
        
        try{      
            let uploadDir;
            if(file.fieldname === 'sticker_url'){
                uploadDir = path.join(__dirname, `../uploads/${categoryName}`, packageName)

            } else if(file.fieldname === 'tray_image_file'){
                uploadDir = path.join(__dirname , `../uploads/${categoryName}/${packageName}/`, 'tray_image')
                
            }

            //Check if directory is exists or not if not then create it
            try{
                await fs.access(uploadDir)
            }catch(err){
                try {
                    await fs.mkdir(uploadDir, { recursive: true });
                } catch (mkdirError) {
                    return cb(mkdirError);
                }
            }
            cb(null, uploadDir);
        }catch(err){
            cb(`Error while uploading file`,err);
        }
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
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
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/.gif'];
                if(!allowedTypes.includes(file.mimetype)){
                    return cb(new Error(`Invalid sticker image file type: ${file.originalname}, only jpeg, jpg, png or gif files are allowed`));
                    
                }
            cb(null, true);
        } else if (file.fieldname === 'tray_image_file') {
            const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png',]
            if(!allowedTypes.includes(file.mimetype)){
                return cb(new Error(`Invalid tray image file type: ${file.originalname}  allowed types is jpg, jpeg or png`));
            }

            cb(null, true)
        }
    }  

const validateSticker = async (file) => {
    const maxSize = 100 * 1024; // 100KB
    const requiredDimensions = { width: 512, height: 512 };

    if (file.size > maxSize) {
        return `Error processing sticker file ${file.originalname}: Sticker file size is too large`;
    }

    const metadata = await sharp(file.path).metadata();
    const { width, height } = metadata;

    if (width !== requiredDimensions.width || height !== requiredDimensions.height) {
        return `One or more stickers have incorrect dimensions (512x512 required)`;
    }

    return null; // Validation passed
};

const validateTrayImage = async (file) => {
    const maxSize = 50 * 1024; // 50KB
    const maxDimensions = { width: 96, height: 96 };

    if (file.size > maxSize) {
        return `Tray file size is too large: ${file.originalname}, Please select less than 50KB file`;
    }

    const metadata = await sharp(file.path).metadata();
    const { width, height } = metadata;

    if (width !== maxDimensions.width || height !== maxDimensions.height) {
        return `Tray image dimension exceeds allowed size: ${maxDimensions.width}x${maxDimensions.height}`;
    }

    return null; // Validation passed
};

const uploadPackStickerMiddleware = async (req, res, next) => {
    upload(req, res, async (err) => {
        if (err) {
            return res.status(400).json({ status: false, message: 'Failed to upload files of tray image and sticker', error: err.message });
        }

        const errors = [];

        try {

            const stickersValidation = await Promise.all(

                req.files.sticker_url ? req.files.sticker_url.map(validateSticker) : []
                );
            errors.push(...stickersValidation.filter((error) => error !== null));


            const trayImageValidation = await Promise.all(req.files.tray_image_file ? req.files.tray_image_file.map(validateTrayImage) : []);
            errors.push(...trayImageValidation.filter((error) => error !== null));

            // If any validation errors, throw an error and delete all files:
            if (errors.length > 0) {
                await Promise.all(req.files.sticker_url.map(async (file) => await fs.unlink(file.path)));
                await Promise.all(req.files.tray_image_file.map(async (file) => await fs.unlink(file.path)));
                return res.status(400).json({ status: false, message: errors.join('\n') });
            }

            next();
        } catch (error) {
            console.log("Error: ",error);
            return res.status(500).json({ status: false, message: 'Error processing files', error: error.message });
        }
    });
};


module.exports = {uploadPackStickerMiddleware}