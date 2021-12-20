const mongoose = require("mongoose")
const Joi = require("joi")

const commentSchema = mongoose.Schema({
  comment: String,
  postId: {
    type: mongoose.Types.ObjectId,
    ref: "Post",
  },
  owner: {
    type: mongoose.Types.ObjectId,
    ref: "User",
  },
})

const commentJoi = Joi.object({
  comment: Joi.string().min(1).max(50).required(),
})

const Comment = mongoose.model("Comment", commentSchema)

module.exports.Comment = Comment
module.exports.commentJoi = commentJoi
