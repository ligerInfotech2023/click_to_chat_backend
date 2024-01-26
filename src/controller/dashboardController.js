const PackageCategorySchema = require("../models/PackageCategorySchema");
const PackageSchema = require("../models/PackageSchema");

const getDataForDashboard = async(req, res) => {
    try{
        const findTotalPackages = await PackageSchema.countDocuments()
        const findTotalCategories = await PackageCategorySchema.countDocuments()
        
        if(findTotalPackages === 0 && findTotalCategories === 0){
            return res.status(404).json({status:false, message: "No data found for dashboard"})
        }
        res.status(200).json({status:true, message:"Data fetch successfully", totalPackages: findTotalPackages, findTotalCategories: findTotalCategories})
    }catch(error){
        console.log("Internal server error while fetching data for dashboard: ",error);
        res.status(500).json({status:false, message: 'Internal server error while fetching dashboard data', error: error.message})
    }
}

module.exports = {getDataForDashboard}