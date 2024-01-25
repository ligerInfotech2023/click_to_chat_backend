const jwt = require('jsonwebtoken');
const UserSchema = require('../models/userSchema');



const userAuth = async(req, res, next) => {
    try{
        //check if token is present in header 
        if(!req.header('Authorization')){
            return res.status(403).json({status:false, message:'Token is required'})
        }
        //removing bearer keyword
        const token = req.header('Authorization').replace('Bearer ', '').trim()
        //verifying token
        const decoded = jwt.verify(token, process.env.JWT_SECRET, {ignoreExpiration:false})
        //finding user with details decoded from token
        const userData = await UserSchema.findOne({_id: decoded.user.userId})
        if(!userData){
            return res.status(403).json({status:false, message: "Invalid token"})
        }
        req.token = token
        req.user = userData
        next()

    }catch(err){
        console.log('Error in userAuth-> ',err);
        if(err.message == 'jwt malformed'){
            return res.status(400).json({status:false, message: "Invalid token"})
        }else{
            return res.status(400).json({status:false, message: err.message})
        }
    }
}

module.exports = {userAuth}