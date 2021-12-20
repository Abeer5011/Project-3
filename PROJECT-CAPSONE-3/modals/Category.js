const Joi = require("joi")
const mongoose = require("mongoose")

const categorySchema = mongoose.Schema({
  top: Array,
  lastest: Array,
})

const categeoryJoi = {
  top: Joi.array().items(Joi.objectId()).min(1).required(),
  lastest: Joi.array().items(Joi.objectId()).min(1).required(),
}

const Category = mongoose.model("Category", categorySchema)

module.exports.Category = Category
module.exports.categeoryJoi = categeoryJoi
