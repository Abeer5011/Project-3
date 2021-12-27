const express = require("express")
const CheckAdmin = require("../middleware/CheckAdmin")
const checkToken = require("../middleware/CheckToken")
const JoiBody = require("../middleware/JoiBody")
const validId = require("../middleware/ValidId")
const router = express.Router()
const { Interest } = require("../modals/Interest")

router.get("/", async (req, res) => {
  const interests = await Interest.find()

  res.json(interests)
})

router.post("/", CheckAdmin, async (req, res) => {
  const { interest, photo } = req.body

  const newTag = new Interest({
    interest,
    photo,
  })

  await newTag.save()
  res.json(newTag)
})

router.delete("/:id", CheckAdmin, validId("id"), async (req, res) => {
  try {
    const interest = await Interest.findByIdAndRemove(req.params.id)
    if (!interest) return res.status(404).send("interest is not longer exsited")

    res.send("interest is deleted")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

module.exports = router
