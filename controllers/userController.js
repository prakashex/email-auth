const asyncHandler = require("express-async-handler")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()
const nodemailer = require("nodemailer")
const sendMail = require("../lib/mail")

const registerUser = asyncHandler(async (req, res) => {
    const { email } = req.body;


    if (!email) {
        res.status(404);
        throw new Error("email not found")
    }


    const user = await User.findOne({ email })

    if (!user) {
        const newUser = await User.create({ email })
        const otp = (Math.floor(Math.random() * 9000) + 1000)
        newUser.otps.push({ otp })
        await newUser.save()
        // email
        await sendMail(otp, email)

        return res.json({ message: "user created and otp pushed" })
    }

    const currentTime = Date.now()

    const timeToLastRequest = user.lastRequest

    console.log("in minutes --> ", (currentTime - timeToLastRequest) / 60000)


    if ((currentTime - timeToLastRequest) < 60000) {
        return res.json({ message: "there should be a 1 min gap between 2 subsequent generate OTP requests" })
    } else {
        const otp = (Math.floor(Math.random() * 9000) + 1000);
        user.otps.push({ otp })
        user.lastRequest = Date.now()
        user.save()

        // email
        await sendMail(otp, email)

        return res.json({ message: "user already existed so otp was generated and pushed" })

    }

})



const signin = asyncHandler(async (req, res) => {
    const { email, otp } = req.body
    let isMatched = false;
    let trueOtpId;

    if (!email || !otp) {
        res.status(404);
        throw new Error("email and otp are required")
    }

    const user = await User.findOne({ email })

    if (!user) {
        res.status(404)
        throw new Error("user not found please register")
    }


    const currentTime = Date.now()
    const lastLoginRequest = user.lastLoginRequest

    if (currentTime - lastLoginRequest >= 60000) {
        user.isBlocked = false;
        user.attempts = 0;
        await user.save();
    }

    // 1 hour -- 3600000 milliseconds

    if (user.isBlocked) {
        return res.json({ message: "user is blocked please try after 1 hour" })
    } else {
        console.log("otp array length --> ", user.otps.length)

        if (user.otps.length === 0) {
            return res.json({ message: "please generate a new otp" })
        }

        user.otps.map(data => {
            if (data.otp === otp) {
                isMatched = true
                trueOtpId = data.id
            }
        })

        if (isMatched) {
            // generate a jwt
            const otpIndex = user.otps.findIndex((otp) => otp.id === trueOtpId)
            user.otps.splice(otpIndex, 1)
            user.lastLoginRequest = Date.now()
            await user.save()
            const token = jwt.sign({
                user: {
                    email
                }
            }, process.env.SECRET, { "expiresIn": "1h" })
            return res.json({ message: "otp matched", bearerToken: token })
        } else {
            user.attempts += 1
            user.lastLoginRequest = Date.now()
            console.log("1 user attempt exausted")
            if (user.attempts >= 5) {
                user.isBlocked = true
                await user.save()
                console.log("all user attempt exhausted")
                return res.json({ message: "all login attempts exhausted" })
            }
            user.save()
            return res.json({ message: "oops your otp was wrong 1 login attempt exhausted" })
        }

    }

})


const listUser = asyncHandler(async (req, res) => {
    const { email } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
        res.status(404)
        throw new Error("user not found")
    }

    console.log("user -->", user)


    res.json({ message: "ok" })
})


module.exports = { registerUser, signin, listUser }