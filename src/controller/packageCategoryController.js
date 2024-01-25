const { getPagination } = require("../helper/utils");
const PackageCategorySchema = require("../models/PackageCategorySchema");
const PackageSchema = require("../models/PackageSchema");


const addNewCategoryForSticker = async(req, res, next) => {
    try{
        const body = req.body;
        
        const category_image = req.file ? req.file.filename  :null     //Get filename from uploaded file
        const addCategory = {
            category: body.category,
            category_image: category_image
        }

        const findCategory = await PackageCategorySchema.findOne({category: body.category})
        if(findCategory){
            return res.status(400).json({status:false, message:`Category: '${body.category}' is already exists`})
        }
        const addStickerCategory = await PackageCategorySchema.create(addCategory)
        if(!addStickerCategory){
            return res.status(400).json({status:false, message:"Create failed"})
        }
        return res.status(200).json({status:true, message:"Create success", category: addStickerCategory})
    }catch(err){
        console.log('Internal server error while adding new category: ',err);
        res.status(500).json({status:false, message: "Internal server error while adding new category", error: err.message})
    }
};


const getPackageCategoryList = async(req, res) => {
    try{
        const page = req.query.page;
        const size = req.query.size;
        const searchById = req.query.id;
        const getAll = req.query.category;
        const { limit, offset } = getPagination(page, size || 20)

        let query = {}
        if(searchById){
            // const escapedSearchName = searchById.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$g');
            // query.category = {$regex: new RegExp(escapedSearchName, 'i')}
            query._id = searchById
        }
        
        let findCategory ;
    
        if(getAll && getAll.toLowerCase() === 'all')
        {
            findCategory = await PackageCategorySchema.find().select('-__v -created_date -updated_date');
        }
        else{
            findCategory = await PackageCategorySchema.find(query).select('-__v -updated_date').skip(offset).limit(limit);
        }
        // if(!findCategory || findCategory.length === 0){
        //     return res.status(404).json({status:false, message:`No data to show`})
        // }

        if(searchById){
            let categoryArray = [];
            let packageArray = [];
            let stickersArray = [];
            const { limit: packageLimit, offset: packageOffset } = getPagination(page, size || 10);
            const findPackage = await PackageSchema.find({ category_id: searchById }).skip(packageOffset).limit(packageLimit);
            
            if(!findPackage || findPackage.length === 0 ){
                return res.status(404).json({status:false, message:`No data to show`})
            }
            // const findCat = await PackageCategorySchema.find(query).select('-__v -updated_date').skip(categoryOffset).limit(categoryLimit || 20)
            const findTotalStickers = await PackageSchema.countDocuments({category_id: searchById })
            for(const package of findPackage){
                const categoryId = package._id; 

                const totalStickers = package.stickers.length;

                const findCategory = await PackageCategorySchema.findOne({_id:package.category_id })
                
                const categoryName = findCategory.category
                // const stickersForPackage = package.stickers.slice(stickersOffset, stickersOffset + stickersLimit)
                const stickersForPackage = package.stickers.slice(0,5)

               
                packageArray.push({
                    _id: package._id,
                    package_name: package.package_name,
                    category: categoryName,
                    total_packages: findTotalStickers,
                    identifier: package.identifier,
                    publisher: package.publisher,
                    tray_image_file: package.tray_image_file,
                    size: package.size,
                    isPremium: package.isPremium,
                    country: package.country,
                    // package_keyword: package.package_keyword,
                    total_stickers: totalStickers,
                    stickers: stickersForPackage,
                });
                const packagesForCategory = await PackageSchema.find({ category_id: categoryId })//.skip(packageLimit).limit(packageOffset);
                
            }
            res.status(200).json({ status: true, message: "Category packages fetch successfully", packages: packageArray });
        
        }else{

            let categoryArray = [];
            for(const category of findCategory){
                const categoryId = category._id
                
                const totalPackages = await PackageSchema.countDocuments({category_id: categoryId})
                
                categoryArray.push({
                    _id: category._id,
                    category_name: category.category,
                    category_image: category.category_image,
                    total_packages: totalPackages,
                })
            }
            res.status(200).json({status: true, message:"Category fetch successfully", category: categoryArray})
        }

    }catch(err){
        console.log('Internl server error while get category list: ',err);
        res.status(500).json({status:false, message: "Internal server error while fetch category list", error: err.message});
    }
}

const getHomepageCategoryAndPackageList = async(req, res) => {
    try{
        const page = req.query.page;
        const size = req.query.size;
        const country = req.query.country;

        const { limit, offset } = getPagination(page, size || 10)
        let findQuery = {};
        if(country){
            findQuery.country = {$regex: new RegExp(country, 'i')}
        }

        const findCategory = await PackageCategorySchema.find().skip(offset).limit(limit).select('-__v -created_date -updated_date').limit(10)
        const countTotalCategory = await PackageCategorySchema.countDocuments();
        // if(!findCategory || findCategory.length === 0){
        //     return res.status(404).json({status:false, message:"No category found"})
        // }

        const findPackage = await PackageSchema.find(findQuery).populate({path:"category_id", model:"tbl_package_category", select:"category"}).skip(offset).limit(limit).select('-__v -created_date -updated_date').limit(10)
        // if(!findPackage ||findPackage.length === 0 ){
        //     return res.status(404).json({status:false, message: "No package to show"})
        // }
        let categoryArray = []
        let packageArray = []
        for(const category of findCategory){
            const categoryId = category._id;
            const countTotalPackage = await PackageSchema.countDocuments({category_id:categoryId})
          
            categoryArray.push({
                _id: category._id,
                category_name: category.category,
                category_image: category.category_image,
                total_packages: countTotalPackage
            })
        }

        
        for(const package of findPackage){
            
            const totalStickers = package.stickers.length;
            const stickersForPackage = package.stickers.slice(0,5)
            
            packageArray.push({
                _id: package._id,
                package_name: package.package_name,
                identifier: package.identifier,
                publisher: package.publisher,
                tray_image_file: package.tray_image_file,
                size: package.size,
                isPremium: package.isPremium,
                country: package.country,
                // package_keyword: package.package_keyword,
                total_stickers: totalStickers,
                category: package.category_id.category,
                stickers: stickersForPackage
            })
        }

        if((page === '1' && categoryArray.length === 0) || (page === '2' && packageArray.length === 0)){
            return res.status(404).json({status:false, message:"No data to show"})
        }
        else if(page === '1'){
            res.status(200).json({status:true, message: "Data fetch successfully", totalCategory:countTotalCategory, categories: categoryArray,packages: packageArray})
        }
        else if(page === '2'){
            res.status(200).json({status:true, message:"Data fetch successfully", packages: packageArray})
        } 
        else if(page > 2){
            res.status(404).json({ status: false, message: "No data to show" });
        }
        else{
            res.status(200).json({status:true, message: "Data fetch successfully", categories: categoryArray, packages: packageArray})
        }

    }catch(err){
        console.log('Error while get sticker and category list: ',err);
        res.status(500).json({status:false, message:"Internal server error while fetching sticker category and package list", error: err.message})
    }
}

module.exports = { 
    addNewCategoryForSticker, 
    getPackageCategoryList,
    getHomepageCategoryAndPackageList 
};