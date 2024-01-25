const {Segments, Joi, celebrate} = require('celebrate');


module.exports = {

    loginValidator: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            username: Joi.string().required(),
            password: Joi.string().required()
        })

    })
}