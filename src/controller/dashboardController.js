const PackageCategorySchema = require("../models/PackageCategorySchema");
const PackageSchema = require("../models/PackageSchema");

const getDataForDashboard = async(req, res) => {
    try{
        const [findTotalPackages, findTotalCategories, findPackages] = await Promise.all([
            PackageSchema.countDocuments(),
            PackageCategorySchema.countDocuments(),
            PackageSchema.find().select('_id package_name stickers')
        ])
        if (findTotalPackages === 0 && findTotalCategories === 0) {
            return res.status(404).json({ status: false, message: "No data found for dashboard" });
        }

        const totalStickersCount = findPackages.reduce((count, pkg) => count + pkg.stickers.length, 0);

        res.status(200).json({
            status: true,
            message: "Data fetch successfully",
            totalCategories: findTotalCategories,
            totalPackages: findTotalPackages,
            totalStickers: totalStickersCount,
        });
    }catch(error){
        console.log("Internal server error while fetching data for dashboard: ",error);
        res.status(500).json({status:false, message: 'Internal server error while fetching dashboard data', error: error.message})
    }
}

module.exports = {getDataForDashboard}