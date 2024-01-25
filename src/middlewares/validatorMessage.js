const {isCelebrateError} = require('celebrate')

const HandleErrorMessage = async(err, req, res, next) => {
    try{
        if(isCelebrateError(err)){
            let errorBody = {}
            if(err.details.get('body')){
                errorBody = err.details.get('body')
            } else if(err.details.get('query')){
                errorBody = err.details.get('query')
            } else if(err.details.get('headers')){
                errorBody = err.details.get('headers');
            }
            return res.status(400).send({status:false, message: errorBody.details[0].message})
        }
    } catch(error){
        console.log('ERROR-> ',error)
        return res.status(400).send({ status: false, message: error.message })
    }
}

module.exports = HandleErrorMessage;