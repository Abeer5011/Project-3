const Joi = require("joi")
const mongoose = require("mongoose")

const interestSchema = mongoose.Schema({
  interest: String,
  photo: String,
})

const interestJoi = {
  interest: Joi.string().required(),
  photo: Joi.string(),
}

const Interest = mongoose.model("Interest", interestSchema)

module.exports.Interest = Interest
module.exports.interestJoi = interestJoi
