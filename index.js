const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
require("dotenv").config()
const Joi = require("joi")
const JoiObjectId = require("joi-objectid")
Joi.objectId = JoiObjectId(Joi)
const users = require("./routes/users")
const posts = require("./routes/posts")
const interests = require("./routes/interests")

mongoose
  .connect("mongodb://localhost:27017/Project3DB")
  .then(() => {
    console.log("MnogoDb is connected")
  })
  .catch(error => {
    console.log("error connecting to MnogoDb", error)
  })

const app = express()
app.use(express.json())
app.use(cors())
app.use("/api/auth", users)
app.use("/api/posts", posts)
app.use("/api/interests", interests)

const port = 5000

app.listen(port, () => console.log("server is listening to the port", port))
