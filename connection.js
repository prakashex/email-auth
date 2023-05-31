const mongoose = require("mongoose")


const connectDb = async (url) => {
    try{
        const connect = await mongoose.connect(url)
        console.log("database connected ",connect.connection.name)
    }catch(err){
        console.log("error --> ",err)
    }
}

module.exports = connectDb