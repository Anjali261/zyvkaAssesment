const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config();
const PORT = 4000


// Database Connectivity
mongoose.set('strictQuery', false);
const connectDB = async() =>{
    try{
        const con = await mongoose.connect(process.env.MONGO_URI,{
            useNewUrlParser:true,

        })
        console.log(`MongoDB connected: ${con.connection.host}`);
        
    }catch(error){ 
        console.log(error);
        process.exit(1);

    }
}
connectDB(); 


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    });