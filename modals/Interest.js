const Joi = require("joi")
const mongoose = require("mongoose")

const interestSchema = mongoose.Schema({
  tag: String,
})

const interestJoi = {
  tag: Joi.string().required(),
}

const Interest = mongoose.model("Interest", interestSchema)

module.exports.Interest = Interest
module.exports.interestJoi = interestJoi
