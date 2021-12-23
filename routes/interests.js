const express = require("express")
const CheckAdmin = require("../middleware/CheckAdmin")
const checkToken = require("../middleware/CheckToken")
const JoiBody = require("../middleware/JoiBody")
const router = express.Router()
const { interestsJoi, Interest } = require("../modals/Interest")

router.get("/", async (req, res) => {
  const tags = await Interest.find()

  res.json(tags)
})

router.post("/", checkToken, CheckAdmin, JoiBody(interestsJoi), async (req, res) => {
  const { tag } = req.body

  const newTag = new Interest({
    tag,
  })

  await newTag.save()
  res.json(newTag)
})

module.exports = router
