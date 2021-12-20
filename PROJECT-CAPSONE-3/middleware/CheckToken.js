const jwt = require("jsonwebtoken")
const { User } = require("../modals/User")

const checkToken = async (req, res, next) => {
  const token = req.header("Authorization")
  if (!token) return res.status(401).send("token is required")

  const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
  const userId = decryptToken.id

  const user = await User.findById(userId).select("-__v -password")
  if (!user) return res.status(404).send("user not found")

  req.userId = userId

  next()
}

module.exports = checkToken
