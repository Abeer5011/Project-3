const mongoose = require("mongoose")

const validId = (...idArray) => {
  return (req, res, next) => {
    try {
      idArray.forEach(idName => {
        const id = req.params[idName]
        if (!mongoose.Types.ObjectId.isValid(id)) return res.status(400).send(`the path of ${idName} is not valid id`)
      })
      next()
    } catch (error) {
      console.log(error)
      res.status(500).send(error.message)
    }
  }
}

module.exports = validId
