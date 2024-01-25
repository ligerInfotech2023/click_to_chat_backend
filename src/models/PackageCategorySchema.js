const mongoose = require('mongoose');

const packageCategorySchema = new mongoose.Schema(
    {
        category:String,
        category_image: String,
    },
    {
        collection:"tbl_package_category",
        timestamps:{
            createdAt: "created_date",
            updatedAt: "updated_date"
        }
    }
)

const PackageCategorySchema = mongoose.model('tbl_package_category', packageCategorySchema);

module.exports = PackageCategorySchema;
