const express = require("express")
const {listUser, registerUser, signin } = require("../controllers/userController")

const router = express.Router()


router.post("/register", registerUser)

router.post("/login", signin)
router.post("/list", listUser)

module.exports = router