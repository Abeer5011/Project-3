const express = require("express")
const router = express.Router()
const { postJoi, Post, editPostJoi } = require("../modals/Post")
const JoiBody = require("../middleware/JoiBody")
const checkToken = require("../middleware/CheckToken")
const validId = require("../middleware/ValidId")
const { Comment, commentJoi } = require("../modals/Comment")
const { User } = require("../modals/User")
// const { Interest } = require("../modals/Interest")
const CheckAdmin = require("../middleware/CheckAdmin")

router.get("/", async (req, res) => {
  let posts = await Post.find()
    .populate({
      path: "comments",
      populate: {
        path: "owner",
      },
    })
    .populate({
      path: "interests",
    })
    .populate({
      path: "owner",
      select: "avatar firstName",
    })

  res.json(posts)
})

router.post("/", checkToken, JoiBody(postJoi), async (req, res) => {
  try {
    const { photo, caption, interests, video } = req.body

    const post = new Post({
      photo,
      caption,
      interests,
      video,

      owner: req.userId,
    })

    await User.findByIdAndUpdate(req.userId, { $push: { myPosts: post._id } })
    // const user = await User.findById(req.userId)
    // user.myPosts.push(post._id)
    // await user.save()

    await post.save()
    res.json(post)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put("/:postId", checkToken, validId("postId"), JoiBody(editPostJoi), async (req, res) => {
  try {
    const { photo, caption, interest, video } = req.body
    const post = await Post.findByIdAndUpdate(
      req.params.postId,
      { $set: { photo, caption, interest, video } },
      { new: true }
    )
    if (!post) return res.status(404).send("post not longer existed")

    await post.save()
    res.json(post)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/:postId", checkToken, validId("postId"), async (req, res) => {
  try {
    await Comment.deleteMany({ postId: req.params.postId })

    const post = await Post.findByIdAndRemove(req.params.postId)
    if (!post) return res.status(404).send("post no longer existed")

    const user = await User.findById(req.userId)

    if (user.role != "Admin" && post.owner != req.userId) return res.status(403).send("unathorized action")
    res.send("post is deleted")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/:postId/comments", checkToken, CheckAdmin, validId("postId"), async (req, res) => {
  const post = await Post.findById(req.params.postId)
  if (!post) return res.status(404).send("post no longer existed ")

  const comments = await Comment.find({ postId: req.params.postId })
  res.json(comments)
})

router.post("/:postId/comments", checkToken, validId("postId"), JoiBody(commentJoi), async (req, res) => {
  try {
    const { comment } = req.body
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post no longer existed ")

    const newComment = new Comment({
      comment,
      owner: req.userId,
      postId: req.params.postId,
    })

    await Post.findByIdAndUpdate(req.params.postId, { $push: { comments: newComment._id } })

    await newComment.save()

    res.json(newComment)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/:postId/comments/:commentId", checkToken, validId("postId", "commentId"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post no longer existed ")
    const comment = await Comment.findById(req.params.commentId)
    if (!comment) return res.status(404).send("comment not found")

    const user = await User.findById(req.userId)

    if (user.role != "Admin" && comment.owner != req.userId) return res.status(403).send("unathorized action")

    await Post.findByIdAndUpdate(req.params.postId, { $pull: { comments: comment._id } })
    await Comment.findByIdAndRemove(req.params.commentId)

    res.send("comment removed")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

// router.post("/:postId/interests", checkToken, validId("postId"), async (req, res) => {
//   const { interest } = req.body
//   const post = await Post.findById(req.params.postId)
//   if (!post) return res.status(404).send("post no longer existed ")
//   const newTag = new Interest({
//     interest,
//   })
//   await Post.findByIdAndUpdate(req.params.postId, { $push: { interests: newTag._id } })
//   await newTag.save()
//   res.json(newTag)
// })

router.get("/post/:id", checkToken, async (req, res) => {
  try {
    let post = await Post.findById(req.params.id).populate("owner")

    const user = await User.findById(req.userId)
    console.log(user.interestView)
    post.interests.forEach(interest => {
      const interestFound = user.interestView.find(ivc => ivc.interestId == interest.toString())
      console.log(interest)
      console.log(interestFound)
      if (!interestFound) {
        user.interestView.push({ interestId: interest, viewCount: 1 })
      } else {
        user.interestView = user.interestView.map(ivc =>
          ivc.interestId == interest.toString() ? { interestId: ivc.interestId, viewCount: ivc.viewCount + 1 } : ivc
        )
      }
    })

    await user.save()
    res.json(post)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/:postId/favorites", checkToken, validId("postId"), async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId)
    if (!post) return res.status(404).send("post not found")

    const userFound = post.favorites.find(favorite => favorite == req.userId)
    if (userFound) {
      await Post.findByIdAndUpdate(req.params.postId, { $pull: { favorites: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $pull: { favorites: req.params.postId } })

      res.send("like is removed")
    } else {
      await Post.findByIdAndUpdate(req.params.postId, { $push: { favorites: req.userId } })
      await User.findByIdAndUpdate(req.userId, { $push: { favorites: req.params.postId } })

      res.send("post liked")
    }
  } catch (error) {
    console.log(error)
    res.status(500).send(error.message)
  }
})

module.exports = router
