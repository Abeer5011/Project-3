const express = require("express")
const checkToken = require("../middleware/CheckToken")
const JoiBody = require("../middleware/JoiBody")
const validId = require("../middleware/ValidId")
const router = express.Router()
const { interestJoi, Interest } = require("../modals/Interest")
const { Post } = require("../modals/Post")

router.get("/", async (req, res) => {
  const tags = await Interest.find()

  res.json(tags)
})

router.post("/", checkToken, JoiBody(interestJoi), async (req, res) => {
  const { tag } = req.body

  const newTag = new Interest({
    tag,
  })

  await newTag.save()
  res.json(newTag)
})

// router.post("/:postId/tags", validId("postId"), async (req, res) => {
//   const { tag } = req.body
//   const post = await Post.findById(req.params.postId)
//   if (!post) return res.status(404).send("post no longer existed ")
//   const newTag = new Interest({
//     tag,
//   })
//   await Post.findByIdAndUpdate(req.params.postId, { $push: { tags: newTag._id } })
//   await newTag.save()
//   res.json(newTag)
// })

module.exports = router
