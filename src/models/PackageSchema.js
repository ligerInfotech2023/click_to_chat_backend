const mongoose = require('mongoose');

const packageSchema = new mongoose.Schema(
    {
        package_name: String,
        category_id: {
            type: mongoose.Schema.ObjectId,
            ref: "tbl_package_category",
        },
        package_keyword:{
            type: Array
        },
        identifier: String,
        publisher: String,
        tray_image_file: String,
        size: String,
        isPremium: {type: Boolean, default:false},
        country: {
            type:Array
        },
        stickers:[
            {
                sticker_title: String,
                sticker_url: String,
                emojis: Array,
                sticker_keyword: Array,
                animated: {type: Boolean, default:false},  
            }
        ],
    },
    {
        collection:"tbl_package",
        timestamps:{
            createdAt: "created_date",
            updatedAt: "updated_date"
        }
    }
);

const PackageSchema = mongoose.model('tbl_package', packageSchema);

module.exports = PackageSchema;