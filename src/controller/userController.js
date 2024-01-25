const { comparePassword, generateToken, encrypt } = require("../helper/utils");
const UserSchema = require("../models/userSchema");

const userLogin = async(req, res) => {
    try{
        const body = req.body;
    
        const user = await UserSchema.findOne({username: body.username})
        if(!user){
            return res.status(404).json({status:false, message: `User not found with username '${body.username}'`})
          
        }

        //for add new user
        // const encrypePassword = await encrypt(body.password)
        // const createUser = {
        //        username: body.username,
        //        password: encrypePassword
        // }
        //await UserSchema.create(createUser)
        
        const isMatch = await comparePassword(body.password, user.password)
        if(!isMatch){
            return res.status(401).json({status:false, message: "Invalid password"})
        }
        const userObject = {
            _id: user._id, 
            username: user.username,
        }
        const token = await generateToken(userObject)
        await UserSchema.updateOne({_id: user._id}, {login_time:new Date()})
        return res.status(200).json({status:true, message: "Successfully login", data:userObject, token:token})
    }catch(error){
        console.log('Internal server error while login: ',error);
        return res.status(500).json({status:false, message: "Internal server error while login", error: error.message})
    }
    
}

module.exports = {
    userLogin,
}