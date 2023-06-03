const dotenv = require("dotenv").config()
const nodemailer = require("nodemailer")
const asyncHandler = require("express-async-handler")

const transporter = nodemailer.createTransport({
    service: 'Gmail',
    auth: {
      user: process.env.AUTH_EMAIL,
      pass: process.env.AUTH_PASS 
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



const sendMail = asyncHandler(async(otp , email) => {
    const mailOptions = {
        from: "whileforifelsedowhile@gmail.com",
        to: email,
        subject: "otp",
        text: `here is your otp -- ${otp.toString()} `
    }

    let info = await transporter.sendMail(mailOptions)
    console.log("Message sent: %s", info.messageId);
})

module.exports = sendMail