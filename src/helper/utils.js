const jwt = require('jsonwebtoken')
const passwordHash = require('pbkdf2-password-hash')

const encrypt = async(password) => {
    return await passwordHash.hash(password, {iterations: 100, digest: 'sha1', keylen: 16, saltlen: 16})
}

const comparePassword = async(plainPassword, hashedPassword) => {
    return await passwordHash.compare(plainPassword, hashedPassword)
}
const generateToken = async(user) => {
    try{
        const token = jwt.sign({user}, process.env.JWT_SECRET,{ expiresIn:process.env.jwt_expiration_time})
        return token;
    }catch(err){
        console.log('Error while generating token: ',err)
        throw new Error(err)
    }
}

const checkPermission = async(role, permission, user) => {
    
    if(!user || !user.permission || !user.role){
        return false;
    }
    //if user.permission is a string, check if it matches the required permission or not
    if(typeof user.permission === 'string' && typeof user.role === 'string'){
        if(user.permission !== permission || user.role !== role){
            return false;
        }
    } else if(Array.isArray(user.permission) && !user.permission.includes(permission) || Array.isArray(user.role) && !user.role.includes(role)){
        return false;
    }
    return true;
}

const getPagination = (page, size) => {
    const limit = Number.parseInt(size) || 10;
    const Page = Number.parseInt(page) || 1;
    const offset = (Page - 1) * limit;
    return {limit, offset}
}

module.exports = { encrypt,comparePassword,generateToken, checkPermission, getPagination }