const mongoose = require("mongoose")
const Joi = require("joi")

const interestViewSchema = mongoose.Schema({
  interestId: {
    type: mongoose.Types.ObjectId,
    ref: "Interest",
  },
  viewCount: Number,
})
const userSchema = mongoose.Schema({
  firstName: String,
  lastName: String,
  password: String,
  email: String,
  interestView: [interestViewSchema],
  gender: String,
  birthDate: Date,
  emailVerified: {
    type: Boolean,
    default: false,
  },
  avatar: {
    type: String,
    default:
      "https://upload.wikimedia.org/wikipedia/commons/thumb/7/7c/User_font_awesome.svg/2048px-User_font_awesome.svg.png",
  },

  role: {
    type: String,
    enum: ["Admin", "User"],
    default: "User",
  },
  myPosts: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
  interests: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Interest",
    },
  ],
  favorites: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Post",
    },
  ],
})

const userSignupJoi = Joi.object({
  firstName: Joi.string().max(11).min(1).required(),
  lastName: Joi.string().max(11).min(1).required(),
  email: Joi.string().email().max(100).min(1).required(),
  password: Joi.string().max(12).min(6).required(),
  avatar: Joi.string().uri().max(1000).min(1),
  birthDate: Joi.date().required(),
  gender: Joi.string().valid("male", "female").required(),
})
const userLoginJoi = Joi.object({
  email: Joi.string().email().max(100).min(1).required(),
  password: Joi.string().max(12).min(6).required(),
})

const userProfileJoi = Joi.object({
  firstName: Joi.string().max(50).min(1),
  lastName: Joi.string().max(50).min(1),
  email: Joi.string().email().max(100).min(1),
  avatar: Joi.string().uri().max(1000).min(1),
})

const interestsJoi = Joi.object({
  interests: Joi.array().items(Joi.objectId()).min(1).required(),
})
const User = mongoose.model("User", userSchema)

module.exports.User = User
module.exports.userLoginJoi = userLoginJoi
module.exports.userSignupJoi = userSignupJoi
module.exports.userProfileJoi = userProfileJoi
module.exports.interestsJoi = interestsJoi
