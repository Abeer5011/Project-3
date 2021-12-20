const mongoose = require("mongoose")
const Joi = require("joi")

const postSchema = mongoose.Schema({
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
  caption: String,
  photo: String,
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
  tags: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Interest",
    },
  ],
  favorites: Number,
  tops: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  ],
  lastests: [
    {
      type: mongoose.Types.ObjectId,
      ref: "Category",
    },
  ],
})

const postJoi = Joi.object({
  caption: Joi.string().min(1).max(50).required(),
  photo: Joi.string().uri().min(50).max(1000).required(),
  tags: Joi.array().items(Joi.objectId()).min(1).required(),
  favorites: Joi.number(),
})

const categeoryJoi = Joi.object({
  top: Joi.array().items(Joi.objectId()).min(1),
  lastest: Joi.array().items(Joi.objectId()).min(1),
})
const Post = mongoose.model("Post", postSchema)

module.exports.Post = Post
module.exports.postJoi = postJoi
module.exports.categeoryJoi = categeoryJoi
