const {Segments, Joi, celebrate} = require('celebrate');


module.exports = {

    addCategoryValidator: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            category: Joi.string().required(),
            category_image: Joi.string().required()
        })

    })
}