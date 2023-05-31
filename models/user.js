
const mongoose = require("mongoose")


const otpSchema = new mongoose.Schema({
  otp:{
    type: String,
    required: [true , "Please enter your otp"],
  },
  createdAt: {
    type: Date,
    default: Date.now
  }

})



const userSchema = new mongoose.Schema({
  email:{
    type: String,
    required: [true, "please enter email"],
    unique: true
  },
  otps:[otpSchema],
  isBlocked: {
    type: Boolean,
    default: false
  },
  lastRequest:{
    type: Number,
    default: Date.now()
  },
  lastLoginRequest:{
    type:Number,
    default: Date.now()
  },
  attempts: {
    type: Number,
    default: 0
  }
})



const User = mongoose.model("User",userSchema);


module.exports = User