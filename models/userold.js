const mongoose = require("mongoose")


const otpSchema = new mongoose.Schema({
    otp: {
      type: String,
      required: true
    },
    expireAt: {
      type: Date,
      default: Date.now,
      expires: 5
    }
  },{timestamps: true});

 

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    otps: [otpSchema],
});



const User = mongoose.model("User", userSchema)

module.exports = User



// otpSchema.index({createdAt: 1},{expireAfterSeconds: 10});