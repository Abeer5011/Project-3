const express = require("express")
const router = express.Router()
const jwt = require("jsonwebtoken")
const JoiBody = require("../middleware/JoiBody")
const nodemailer = require("nodemailer")
const bcrypt = require("bcrypt")
const {
  User,
  userSignupJoi,
  userLoginJoi,
  userProfileJoi,
  foregtPasswordJoi,
  restPasswordJoi,
  interestsJoi,
} = require("../modals/User")
const checkToken = require("../middleware/CheckToken")
const CheckAdmin = require("../middleware/CheckAdmin")
const { Comment } = require("../modals/Comment")
const validId = require("../middleware/ValidId")
const { Post } = require("../modals/Post")
const { Interest } = require("../modals/Interest")

router.post("/signup", JoiBody(userSignupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, birthDate, gender } = req.body

    const user = await User.findOne({ email })
    if (user) return res.status(400).send("user is already registerd")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      birthDate,
      gender,
      emaiVerified: false,
      role: "User",
    })

    const transporter = nodemailer.createTransport({
      service: "gmail",
      port: 587,
      secure: false, // true for 465, false for other ports
      auth: {
        user: process.env.SENDER_EMAIL, // generated ethereal user
        pass: process.env.SENDER_PASSWORD, // generated ethereal password
      },
    })

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, { expiresIn: "100d" })

    await transporter.sendMail({
      from: `"Forproject ." <${process.env.SENDER_EMAIL}>`, // sender address
      to: email, // list of receivers
      subject: "Email Verification", // Subject line

      html: `Hello, please click on this link to verify your email.
      <a href="http://localhost:3000/email_verified/${token}">verify email</a>`, // html body
    })
    res.send("user created, please check the link in your email")
    await newUser.save()
    delete newUser._doc.password
    // res.json(newUser)
  } catch (error) {
    res.status(500).json(error.message)
  }
})
router.get("/verify_email/:token", async (req, res) => {
  try {
    const decryptToken = jwt.verify(req.params.token, process.env.JWT_SECRET_KEY)
    const userId = decryptToken.id

    const userFound = await User.findByIdAndUpdate(userId, { $set: { emailVerified: true } }).select("-__v -password")
    if (!userFound) return res.status(404).send("user not found")

    res.send("user verified")
  } catch (error) {
    res.status(500).json(error.message)
  }
})

// router.get("/forget-password", JoiBody(foregtPasswordJoi), async (req, res) => {
//   try {
//     const user = await User.findOne({ email })
//     if (user) return res.status(400).json("user already registerd")

//     const transporter = nodemailer.createTransport({
//       service: "gmail",
//       port: 587,
//       secure: false, // true for 465, false for other ports
//       auth: {
//         user: process.env.SENDER_EMAIL, // generated ethereal user
//         pass: process.env.SENDER_PASSWORD, // generated ethereal password
//       },
//     })

//     const token = jwt.sign({ id: user._id, forgetPassword }, process.env.JWT_SECRET_KEY, { expiresIn: "20d" })

//     // await transporter.sendMail({
//     //   from: `"Forproject ." <${process.env.SENDER_PASSWORD}>`, // sender address
//     //   to: email, // list of receivers
//     //   subject: "rest password", // Subject line

//     //   html: `Hello, please click on this link to rest the password.
//     // <a href="http://localhost:3000/forget-password/${token}">rest passwod</a>`, // html body
//     // })

//     await user.save()
//     delete user._doc.password

//     // res.send("rest password is sent, please check the link in your email")
//   } catch (error) {
//     res.status(500).json(error.message)
//   }
// })

// router.post("/rest-password/:token", JoiBody(restPasswordJoi), async (req, res) => {
//   try {
//     const decryptToken = jwt.verify(token, process.env.JWT_SECRET_KEY)

//     if (!decryptToken.forgetPassword) return res.status(403).send("unathorized action")
//     const userId = decryptToken.id

//     const userFound = await User.findById(userId).select("-__v -password")
//     if (!userFound) return res.status(404).send("user not found")
//     const { password } = req.body
//     const salt = await bcrypt.genSalt(10)
//     const hash = await bcrypt.hash(password, salt)

//     const newPassword = new User({
//       password: hash,
//     })
//     await newPassword.save()
//     delete newUser._doc.password
//     res.send("done")
//   } catch (error) {
//     res.status(500).json(error.message)
//   }
// })

router.post("/add-admin", JoiBody(userSignupJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, birthDate } = req.body

    const user = await User.findOne({ email })
    if (user) return res.status(400).send("user is already registerd")

    const salt = await bcrypt.genSalt(10)
    const hash = await bcrypt.hash(password, salt)

    const newUser = new User({
      firstName,
      lastName,
      email,
      password: hash,
      avatar,
      birthDate,
      role: "Admin",
    })
    await newUser.save()
    delete newUser._doc.password
    res.json(newUser)
  } catch (error) {
    res.status(500).json(error.message)
  }
})
router.post("/login", JoiBody(userLoginJoi), async (req, res) => {
  try {
    const { email, password } = req.body

    const user = await User.findOne({ email })
    if (!user) return res.status(400).send("user not registerd")

    const compare = await bcrypt.compare(password, user.password)
    if (!compare) return res.status(400).send("password incorrect")

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, { expiresIn: "5d" })

    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/profile", checkToken, async (req, res) => {
  try {
    const user = await User.findById(req.userId)
      .select("-__v -role -password")
      .populate("interests")
      .populate("myPosts")
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.put("/profile", checkToken, JoiBody(userProfileJoi), async (req, res) => {
  try {
    const { firstName, lastName, email, password, avatar, birthDate } = req.body
    let hash
    if (password) {
      const salt = await bcrypt.genSalt(10)
      hash = await bcrypt.hash(password, salt)
    }
    const user = await User.findByIdAndUpdate(
      req.userId,
      { $set: { firstName, lastName, email, password: hash, avatar, birthDate } },
      { new: true }
    )
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.get("/users", async (req, res) => {
  try {
    const user = await User.find({ role: "User" }).select("-__v -password").populate("interests")
    res.json(user)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/login/admin", JoiBody(userLoginJoi), async (req, res) => {
  try {
    const { password, email } = req.body

    const userFound = await User.findOne({ email })
    if (!userFound) return res.status(404).send("user not registerd")

    if (userFound.role !== "Admin") return res.status(403).send("you not admin")
    const comparison = await bcrypt.compare(password, userFound.password)
    if (!comparison) return res.status(400).send("password incorrect")
    const token = jwt.sign({ id: userFound._id }, process.env.JWT_SECRET_KEY, { expiresIn: "20d" })

    res.send(token)
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.delete("/user/:id", CheckAdmin, validId("id"), async (req, res) => {
  try {
    const user = await User.findByIdAndRemove(req.params.id)
    if (!user) return res.status(404).send("user not found")
    await Comment.deleteMany({ owner: req.params.id })
    res.send("user is deleted")
  } catch (error) {
    res.status(500).send(error.message)
  }
})

router.post("/interests", checkToken, JoiBody(interestsJoi), async (req, res) => {
  const { interests } = req.body
  const interestsSet = new Set(interests)
  if (interestsSet.size < interests.length) return res.status(400).send("there is a duplicated interest")
  const interestsFound = await Interest.find({ _id: { $in: interests } })
  if (interestsFound.length < interests.length) return res.status(404).send("some of interests is not found")

  await User.findByIdAndUpdate(req.userId, { $set: { interests } })

  res.send("interests added")
})

module.exports = router
