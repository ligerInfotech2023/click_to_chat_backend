const multer = require('multer')
const fs = require('fs')
const path = require('path')

//configure multer storege and file name
const storege = multer.diskStorage({
    destination: path.join(__dirname, '../uploads/'),
    // destination: (req, file, cb) => {
    //     cb(null, 'public/uploads')
    // },
    filename: (req, file, cb) => {
        cb(null, file.originalname)
        // cb(null, Date.now() + '-' + file.originalname)
    }

})

//create upload instance
const upload = multer({storage: storege});

//custom file upload middleware
const uploadMiddleware = (req, res, next) => {
    //use multer upload instance
    upload.single('category_image')(req, res, (err) => {
        if(err){
            return res.status(400).json({status:false, message: "Failed to upload image", error:err.message})
        }
        const file = req.file;
        //Retrieve uploaded files
        const errors = [];

        // Validate file type and size
        const allowedTypes = ['image/jpeg', 'image/png'];
        const maxSize = 5 * 1024 * 1024; // 5MB

        if (!allowedTypes.includes(file.mimetype)) {
            // Remove uploaded file
            fs.unlinkSync(file.path);
            return res.status(400).json({ status: false, message: `Invalid file type: ${file.originalname}` });
        }

        // if (file.size > maxSize) {
        //     // Remove uploaded file
        //     fs.unlinkSync(file.path);
        //     return res.status(400).json({ status: false, message: `File too large: ${file.originalname}` });
        // }

         // Attach file to the request object
         req.file = file;

        //proceed to the next middleware
        next();


        //validate file type and size
        // files.forEach((file) => {
        //     const allowedTypes = ['image/jpeg', 'image/png'];
        //     const maxSize = 5 * 1024 * 1024; // 5MB
                
        //     if (!allowedTypes.includes(file.mimetype)) {
        //         errors.push(`Invalid file type: ${file.originalname}`);
        //     }
            
        //     // if (file.size > maxSize) {
        //     //  errors.push(`File too large: ${file.originalname}`);
        //     // }

        // });

        //Handle validation errors

        // if(errors.length > 0){
        //     //Remove uploaded files
        //     files.forEach((file) => {
        //         fs.unlinkSync(file.path)
        //     })
        //     return res.status(400).json({status:false, message:errors });
        // }

        //Attach files to the request object
        // req.files = files;

        //proceed to the next middleware
        // next();

    })
}
module.exports = {uploadMiddleware};