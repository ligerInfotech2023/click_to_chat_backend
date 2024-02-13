const { getPagination } = require("../helper/utils");
const PackageCategorySchema = require("../models/PackageCategorySchema");
const PackageSchema = require("../models/PackageSchema");

const LIVE_BASE_URL =  process.env.LIVE_BASE_URL;
const LOCAL_BASE_URL = process.env.LOCAL_BASE_URL;


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

        let query = searchById ? { _id: searchById } : {};
        
        let findCategory ;
    
        if(getAll && getAll.toLowerCase() === 'all')
        {
            findCategory = await PackageCategorySchema.find({}, '-__v -created_date -updated_date').lean();
        }
        else{
            findCategory = await PackageCategorySchema.find(query, '-__v -updated_date').skip(offset).limit(limit).lean();
        }
 
        if(searchById){
          
            const { limit: packageLimit, offset: packageOffset } = getPagination(page, size || 10);
            const findPackage = await PackageSchema.find({ category_id: searchById }).skip(packageOffset).limit(packageLimit).lean();
            
            if(!findPackage || findPackage.length === 0 ){
                return res.status(404).json({status:false, message:`No data to show`})
            }
            const findCategory = await PackageCategorySchema.findOne({_id:searchById }).lean()
            const findTotalStickers = await PackageSchema.countDocuments({category_id: searchById })

            const packageArray = findPackage.map((package) => {
                const updatedStickers = package.stickers.map((st) => ({
                    sticker_title: st.sticker_title,
                    sticker_url: st.sticker_url.map((data) => {
                        const relativePath = data.path.split('click_to_chat_backend').pop().replace(/\\/g, '/');
                        const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/')
                        return `${LIVE_BASE_URL}${encodedPath}`;
                    })[0],
                    emojis: st.emojis,
                    sticker_keyword: st.sticker_keyword,
                    animated: st.animated,
                    _id: st._id
                }));
                const slicedStickers = updatedStickers.slice(0, 5);
                const packObj = {
                    id: package._id,
                    package_name: package.package_name,
                    category: findCategory.category,
                    // total_packages: findTotalStickers,
                    total_stickers: package.stickers.length,
                    identifier: package.identifier,
                    publisher: package.publisher,
                    tray_image_file:`${LIVE_BASE_URL}/src/uploads/${encodeURIComponent(findCategory.category)}/${encodeURIComponent(package.package_name)}/tray_image/${encodeURIComponent(package.tray_image_file)}`,
                    size: package.size,
                    isPremium: package.isPremium,
                    country: package.country,
                    stickers: slicedStickers,
                    // stickers: package.stickers.slice(0,5)
                };
            
                return packObj;
            });
            
            res.status(200).json({ status: true, message: "Category packages fetch successfully", packages: packageArray });
        
        }else{

          const [findCategory, totalPackages] = await Promise.all([
            PackageCategorySchema.find().skip(offset).limit(limit).select('-__v -created_date -updated_date').lean(),
            PackageSchema.aggregate([
            { $group: { _id: '$category_id', total_packages: { $sum: 1 } } },
            ]),
        ]);
            const categoryArray = findCategory.map((category) => {
                const totalPackagesForCategory = totalPackages.find((p) => p._id.toString() === category._id.toString());
                const imageUrl = `${LIVE_BASE_URL}/src/uploads/${encodeURIComponent(category.category)}/${encodeURIComponent(category.category_image)}`;
                return {
                _id: category._id,
                category_name: category.category,
                category_image: imageUrl,
                total_packages: totalPackagesForCategory?.total_packages || 0, // Handle potential missing packages
                };
            })    
            res.status(200).json({ status: true, message: "Category fetch successfully", category: categoryArray });
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

        const [findCategory, countTotalCategory, findPackage] = await Promise.all([
            PackageCategorySchema.find().limit(10).select('-__v -created_date -updated_date').lean(),
            PackageCategorySchema.countDocuments(),
            PackageSchema.find(findQuery)
                .populate({ path: "category_id", model: "tbl_package_category", select: "category" })
                .skip(offset)
                .limit(limit)
                .select('-__v -created_date -updated_date')
                .sort({ created_date: -1 })
                .lean()
        ]);

        let catObj = {}
        const categoryArray = findCategory.map(category => {
            catObj = {
                _id: category._id,
                category_name: category.category,
                category_image: `${LIVE_BASE_URL}/src/uploads/${encodeURIComponent(category.category)}/${encodeURIComponent(category.category_image)}`,
                total_packages: findPackage.filter(pkg => pkg.category_id && pkg.category_id._id.equals(category._id)).length
            }
            return catObj
        });
        const packageArrayData = findPackage.map(package => {
            const updatedStickers = package.stickers.slice(0,5).map((st) => {
                
                const obj = {
                    sticker_title: st.sticker_title,
                    sticker_url: st.sticker_url.map((data) => {
                        const relativePath = data.path.split('click_to_chat_backend').pop().replace(/\\/g, '/');
                        const encodedPath = relativePath.split('/').map(encodeURIComponent).join('/')
                        return `${LIVE_BASE_URL}${encodedPath}`;
                    })[0],
                    emojis: st.emojis,
                    sticker_keyword: st.sticker_keyword,
                    animated: st.animated,
                    _id: st._id
                }
                return obj;
            });
            
            const packObj = {
                _id: package._id,
                package_name: package.package_name,
                identifier: package.identifier,
                publisher: package.publisher,
                tray_image_file:`${LIVE_BASE_URL}/src/uploads/${encodeURIComponent(package.category_id.category)}/${encodeURIComponent(package.package_name)}/tray_image/${encodeURIComponent(package.tray_image_file)}`,
                size: package.size,
                isPremium: package.isPremium,
                country: package.country,
                // package_keyword: package.package_keyword,
                total_stickers: package.stickers.length,
                category: package.category_id ? package.category_id.category : "",
                stickers: updatedStickers,
                // stickers: package.stickers.slice(0, 5)
            }
            return packObj;
        });

        const newestRecords = packageArrayData.shift()

        const shuffleRecords = shuffle(packageArrayData)

        const packageArray = [newestRecords, ...shuffleRecords]

        if (page == 1) {
            res.status(200).json({ status: true, message: "Data fetch successfully", totalCategory: countTotalCategory, categories: categoryArray, packages: packageArray });
        } 
        else if (page > 1) {
            res.status(200).json({ status: true, message: "Data fetch successfully", packages: packageArray });
        } 
        else {
            res.status(200).json({ status: true, message: "Data fetch successfully", categories: categoryArray, packages: packageArray });
        }

    }catch(err){
        console.log('Error while get sticker and category list: ',err);
        res.status(500).json({status:false, message:"Internal server error while fetching sticker category and package list", error: err.message})
    }
}

const shuffle = (array) => {
    let currentIndex = array.length, randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex !== 0) {

        // Pick a remaining element...
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;

        // And swap it with the current element.
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }

    return array;
}

module.exports = { 
    addNewCategoryForSticker, 
    getPackageCategoryList,
    getHomepageCategoryAndPackageList 
};