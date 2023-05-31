const asyncHandler = require("express-async-handler")
const User = require("../models/user")
const jwt = require("jsonwebtoken")
const dotenv = require("dotenv").config()
const nodemailer = require("nodemailer")

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.AUTH_EMAIL, // Replace with your Gmail email address
      pass: process.env.AUTH_PASS // Replace with your Gmail password
    }
  });



transporter.verify((error, success) => {
    if(error){
        console.log(error);
    }else{
        console.log("Ready for messages")
        console.log("success value",success)
    }
})




const registerUser = asyncHandler(async(req , res) => {
    const {email} = req.body;


    if(!email){
        res.status(404);
        throw new Error("email not found")
    }


    const user = await User.findOne({email})

    if(!user){
        const newUser = await User.create({email})
        const otp = (Math.floor(Math.random() * 9000) + 1000)
        newUser.otps.push({otp})
        await newUser.save()

        // email

        const mailOptions = {
            from: "whileforifelsedowhile@gmail.com",
            to: email,
            subject: "otp",
            text: `here is your otp -- ${otp.toString()} `
        }
    
        let info = await transporter.sendMail(mailOptions)
        console.log("Message sent: %s", info.messageId);

        // email


        return res.json({message: "user created and otp pushed"})
    }



    // user is already registered , now first check if he is requesting , the otp in between 1 minute
     
    const currentTime = Date.now()

    const timeToLastRequest =  user.lastRequest

    console.log("in minutes --> ", (currentTime - timeToLastRequest) / 60000)


    if( (currentTime - timeToLastRequest) < 60000){
        return res.json({message: "there should be a 1 min gap between 2 subsequent generate OTP requests"})
    }else{
        const otp = (Math.floor(Math.random() * 9000) + 1000);
        user.otps.push({otp})
        user.lastRequest = Date.now()
        user.save() 

        // email

        const mailOptions = {
            from: "whileforifelsedowhile@gmail.com",
            to: email,
            subject: "otp",
            text: `here is your otp -- ${otp.toString()} `
        }
    
    
        let info = await transporter.sendMail(mailOptions)
        console.log("Message sent: %s", info.messageId);



        // email
        return res.json({message: "user already existed so otp was generated and pushed"})

    }

})



const signin = asyncHandler(async(req , res) => {
    const {email , otp} = req.body
    let isMatched = false;
    let trueOtpId;

    if(!email || !otp ){
        res.status(404);
        throw new Error("email and otp are required")
    }

    // if the user is blocked or not ? if yes send the user the message and time until he will be blocked

    // if the user is not blocked , then I will check the otp which came in the request object and compare it with
    // the otp stored in the db , if the otp matched generate the jwt , else increment the attempt count


    const user = await User.findOne({email})

    if(!user){
        res.status(404)
        throw new Error("user not found please register")
    }


    const currentTime = Date.now()
    const lastLoginRequest = user.lastLoginRequest

    if(currentTime - lastLoginRequest >= 60000 ){
        user.isBlocked = false;
        user.attempts = 0;
        await user.save();
    }

// 1 hour -- 3600000 milliseconds

    if(user.isBlocked){
        return res.json({message: "user is blocked please try after 1 hour"})
    }else{
        console.log("otp array length --> ", user.otps.length)

        if(user.otps.length === 0){
            return res.json({message: "please generate a new otp"})
        }

        user.otps.map(data => {
            if(data.otp === otp){
                // return res.json({message: "otp matched"})
                isMatched = true
                // delete the otp
                trueOtpId = data.id
                
            }
        })

        // isMatched ? res.json({message: "otp matched"}) : res.json({message: "otp didn't match"})

        if(isMatched){
            // generate a jwt
            const otpIndex = user.otps.findIndex((otp) => otp.id === trueOtpId)
            user.otps.splice(otpIndex,1)
            user.lastLoginRequest = Date.now()
            await user.save()
            const token = jwt.sign({user: {
                email
            }}, process.env.SECRET, {"expiresIn":"1h"})
            return res.json({message: "otp matched", bearerToken: token})
        }else{
            user.attempts += 1
            user.lastLoginRequest = Date.now()
            console.log("1 user attempt exausted")
            if(user.attempts >= 5){
                user.isBlocked = true
                await user.save()
                console.log("all user attempt exhausted")
                return res.json({message: "all login attempts exhausted"})
            }
            user.save()
            return res.json({message: "oops your otp was wrong 1 login attempt exhausted"})
        }

    }

})




// const login = asyncHandler(async (req , res) => {
//     const {email , otp} = req.body
    
//     if(!email || !otp){
//         res.status(404)
//         throw new Error("all fields are required")
//     }

//     const user = await User.findOne({email})

//     if(!user){
//         res.status(404)
//         throw new Error("user not found")
//     }
//     // console.log("user --> ",user)

//     // user.otps.map(data => {
//     //     if(data.otp == otp){
//     //         return res.json({message: "otp matched", data: otp})
//     //     }
//     // })

//     // const matchedOtp = user.otps.find((userOtp => userOtp.otp === otp))

//     // console.log("matched otp -->",matchedOtp)

//     // if(matchedOtp){
//     //    return res.json({message: "otp matched"})
//     // }else{
//     //    res.status(400)
//     //    throw new Error("incorrect otp")
//     // } 

//     const matchedOtp = user.otps.find((userOtp) => console.log("find -->",userOtp));

//     if (matchedOtp) {
//       // OTP matches
//       return res.json({ message: "OTP matched successfully" });
//     } else {
//       // OTP does not match
//       res.status(400);
//       throw new Error("OTP does not match");
//     }

//     // return res.json({message: "wrong otp"})
// })

const listUser = asyncHandler(async (req , res) => {
    const {email} = req.body;

    const user = await User.findOne({email});

    console.log("user -->",user)

    res.json({message: "ok"})
})


module.exports = {registerUser , signin, listUser}