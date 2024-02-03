const { getPagination } = require("../helper/utils");
const PackageCategorySchema = require("../models/PackageCategorySchema");
const PackageSchema = require("../models/PackageSchema");
const path = require('path')

const LIVE_BASE_URL =  process.env.LIVE_BASE_URL;
const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL;

const addNewPackageAndSticker = async(req, res) => {
    try{
        const body = req.body;
        // const findPackage = await PackageSchema.findOne({package_name: body.package_name})
        // if(findPackage || findPackage){
        //     return res.status(400).json({status:false, message: `Package: ${body.package_name} is already exists`})
        // }

        const stickerImages = req.files.sticker_url.map((file) => ({
            originalname: file.originalname,
            filename: file.filename,
            path: file.path,
            size: file.size
        }))

        let stickerCategory;
        stickerCategory = await PackageCategorySchema.findOne({category: body.package_category})
        if(!stickerCategory){
            return res.status(404).json({status:false, message: `Category: ${body.package_category} is not found in database`})
            // stickerCategory = await PackageCategorySchema.create({category: body.package_category})
        }

        //check if body.package is exists or not 
        let existingPackage = await PackageSchema.findOne({package_name:body.package_name});

        if(existingPackage){
            // existingPackage.stickers.push(...body.stickers)
            const addData = stickerImages.map((stickerImage) => ({
                sticker_title: body.sticker_title,
                sticker_url: stickerImage,
                emojis: body && body.emojis ? body.emojis : [],
                animated: body && body.animated ? body.animated : false,
                sticker_keyword: body && body.sticker_keyword ? body.sticker_keyword : []
            }))
            existingPackage.stickers.push(...addData)
            const updatePackage = await existingPackage.save()

            return res.status(200).json({status:true, message: `Stickers added to package ${existingPackage.package_name} successfully`,})
        }

        const createNewPackage = {
            package_name: body.package_name,
            category_id: stickerCategory._id,
            identifier: body && body.identifier ? body.identifier : null,
            publisher: body && body.publisher ? body.publisher : null,
            // tray_image_file: body.tray_image_file,
            tray_image_file: req.files.tray_image_file[0] ? req.files.tray_image_file[0].filename : null,
            size: body && body.size ? body.size : null, 
            package_keyword: body && body.package_keyword ? body.package_keyword : [],
            isPremium: body && body.isPremium ?  body.isPremium : false,
            country: body && body.country ? body.country : [],
            stickers: stickerImages.map((stickerImage) => ({
                sticker_title: body.sticker_title,
                sticker_url: stickerImage,
                emojis: body && body.emojis ? body.emojis : ['😄', '😀'],
                animated: body && body.animated ? body.animated : false,
                sticker_keyword: body && body.sticker_keyword ? body.sticker_keyword : []
            }))
        }

        const addNewPackage = await PackageSchema.create(createNewPackage)
        
        if(!addNewPackage){
            return res.status(400).json({status:false, message: "Create failed"})
        }
        res.status(200).json({status:true, message: "Create success", package:addNewPackage});
    }catch(err){
        console.log('Internal server error while adding new package: ',err);
        res.status(500).json({status:false, message: "Internal server error while adding new package", error: err.message})
    }
}



const getStickerPackageList = async(req, res) => {
    try{
        const page = req.query.page;
        const size = req.query.size;
        const searchById = req.query.id;
        const country = req.query.country;
        const {limit, offset } = getPagination(page, size || 20)
        let query = {}
        if(searchById){
            // const escapedSearchName = searchById.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$g');
            // query.package_name = {$regex: new RegExp(escapedSearchName, 'i')}
            query._id = searchById
            
        }
        if(country){
            query.country = {$regex: new RegExp(country, 'i')}
        }
        const findStickerPackage = await PackageSchema.find(query).select('-__v -updated_date').skip(offset).limit(limit);

        if(!findStickerPackage || findStickerPackage.length === 0){
            return res.status(404).json({status:false, message:"No data to show"})
        }
        
        if(searchById){
            let packageArray = []

            for(const stickerPackage of findStickerPackage){
                const packageId = stickerPackage._id;
                const categoryId = stickerPackage.category_id;

                const totalStickers = stickerPackage.stickers.length;
                
                const category = await PackageCategorySchema.findById(categoryId).select('category');

                let stickersArray = [];

                for(const stickers of stickerPackage.stickers){
                    const stickerUrl = stickers.sticker_url.map((data) => {
                        const stickerUrlPath = data.path.split('click_to_chat_backend').pop().replace(/\\/g, '/');
                        return `${LIVE_BASE_URL}${stickerUrlPath}`
                    })[0]
                    stickersArray.push({
                        _id: stickers._id,
                        sticker_title: stickers.sticker_title,
                        sticker_url: stickerUrl,
                        emojis: stickers.emojis,
                        sticker_keyword: stickers.sticker_keyword,
                        animated: stickers.animated,
                    });
                }
                packageArray.push({
                    _id: packageId,
                    identifier: stickerPackage.identifier,
                    package_name: stickerPackage.package_name,
                    publisher: stickerPackage.publisher,
                    tray_image_file: `${LIVE_BASE_URL}/src/uploads/${encodeURIComponent(category.category)}/${encodeURIComponent(stickerPackage.package_name)}/tray_image/${encodeURIComponent(stickerPackage.tray_image_file)}`,
                    size: stickerPackage.size,
                    isPremium: stickerPackage.isPremium,
                    country: stickerPackage.country,
                    // package_keyword: stickerPackage.package_keyword,
                    category: category ? category.category : null,
                    total_stickers: totalStickers,
                    stickers: stickersArray,
                })
            }
            res.status(200).json({status:true, message:"Sticker package fetch successfully", packages:packageArray})
         }
         else{
            let packageArray = [];
            for(const packages of findStickerPackage){
                const categoryId = packages.category_id;
                const totalStickers = packages.stickers.length;
                const findCategory = await PackageCategorySchema.findById({_id:categoryId}).select('category')
                packageArray.push({
                    _id: packages._id,
                    package_name: packages.package_name,
                    identifier: packages.identifier,
                    publisher: packages.publisher,
                    tray_image_file: `${LIVE_BASE_URL}/src/uploads/${encodeURIComponent(findCategory.category)}/${encodeURIComponent(packages.package_name)}/tray_image/${encodeURIComponent(packages.tray_image_file)}`,
                    size: packages.size,
                    isPremium: packages.isPremium,
                    country: packages.country,
                    package_keyword: packages.package_keyword,
                    total_stickers: totalStickers,
                    category: findCategory.category,

                })
            }

            res.status(200).json({ status: true, message: "Sticker package fetch successfully", packages: packageArray });
         }
    }catch(err){
        console.log('Internal server error while fetching package list: ',err);
        res.status(500).json({status:false, message:"Internal server error while fetching package list", error:err.message})
    }
}


module.exports = {
    addNewPackageAndSticker,
    getStickerPackageList,
}