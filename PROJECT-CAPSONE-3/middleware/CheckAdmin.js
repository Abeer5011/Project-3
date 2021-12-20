const { User } = require("../modals/User")
const jwt = require("jsonwebtoken")
const CheckAdmin = async (req, res, next) => {
  try {
    const token = req.header("Authorization")
    if (!token) return res.status(401).send("token is required")

    const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)
    const userId = decryptToken.id
    const user = await User.findById(userId)

    if (user.role !== "Admin") return res.status(403).send("unathorized action")
    req.userId = userId
    next()
  } catch (error) {
    res.status(500).send(error.message)
  }
}

module.exports = CheckAdmin
