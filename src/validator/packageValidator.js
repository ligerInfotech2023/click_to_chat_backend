const {Segments, Joi, celebrate} = require('celebrate');

module.exports ={
    addPackageValidator: () => celebrate({
        [Segments.BODY]: Joi.object().keys({
            package_name: Joi.string().required(),
            package_category: Joi.string().required(),
            package_keyword: Joi.array().items(Joi.string()),
            identifier: Joi.string().required(),
            publisher: Joi.string().required(),
            size: Joi.string().required(),
            tray_image_file: Joi.string().required(),
            isPremium: Joi.boolean().default(false),
            country: Joi.array().items(Joi.string()),
            stickers: Joi.array().items(Joi.object().keys({
                sticker_title: Joi.string().required(),
                sticker_url: Joi.array().items(Joi.object().keys({
                    originalname: Joi.string(),
                    filename: Joi.string(),
                    path: Joi.string(),
                })),
                emojis: Joi.array().items(Joi.string()),
                sticker_keyword: Joi.array().items(Joi.string()),
                animated: Joi.boolean().default(false),
            }))
        })
    })
}