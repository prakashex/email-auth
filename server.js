const express = require("express")
const router = require("./routes/user")
const errorHandler = require("./middlewares/errorHandler")
const connectDb = require("./connection")
const dotenv = require("dotenv").config()

const app = express()

connectDb("mongodb://127.0.0.1:27017/email-auth")

// app.post("/", (req , res) => res.send("hello"))
app.use(express.json())
app.use("/api/user",router)
app.use(errorHandler)


const PORT = process.env.PORT || 5000

app.listen(PORT , () => console.log(`listening on port ${PORT} ` ))

