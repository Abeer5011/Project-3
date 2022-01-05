const mongoose = require("mongoose")
const Joi = require("joi")

const postSchema = mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  caption: String,
  photo: String,
  video: String,
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Comment",
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
      ref: "User",
    },
  ],
})

const postJoi = Joi.object({
  caption: Joi.string().min(1).max(50),
  photo: Joi.string().uri().min(50).max(1000),
  video: Joi.string().uri().min(50).max(1000),
  interests: Joi.array().items(Joi.objectId()).min(1),
})

const editPostJoi = Joi.object({
  caption: Joi.string().min(1).max(50),
  photo: Joi.string().uri().min(50).max(1000),
  video: Joi.string().uri().min(50).max(1000),
  interests: Joi.array().items(Joi.objectId()).min(1),
})

const Post = mongoose.model("Post", postSchema)

module.exports.Post = Post
module.exports.postJoi = postJoi
module.exports.editPostJoi = editPostJoi
