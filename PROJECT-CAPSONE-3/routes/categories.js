const express = require("express")
const JoiBody = require("../middleware/JoiBody")
const { Category } = require("../modals/Category")
const { Post, categeoryJoi } = require("../modals/Post")
const router = express.Router()

router.get("/", async (req, res) => {
  const categories = await Category.find()
  res.json(categories)
})

router.post("/", JoiBody(categeoryJoi), async (req, res) => {
  try {
    const { top, lastest } = req.body
    const category = new Category({
      top,
      lastest,
    })
    // let post = await Post.find()
    // category = category.lastest.sort((a, b) => b - a)
    // await Category.findByIdAndUpdate(category._id, { $push: { lastest: category._id } })

    await category.save()
    res.json(category)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router
