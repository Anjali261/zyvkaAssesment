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

const drawingSchema = new mongoose.Schema({
    shape: String,
    coordinates: {
         x: Number,
          y: Number },
    dimensions: 
    { length: Number, 
        breadth: Number },
    annotation: String,
  });
  const Drawing = mongoose.model('Drawing', drawingSchema);

  app.get('/api/drawings', async (req, res) => {
    try {
      const drawings = await Drawing.find();
      res.json(drawings);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  });
  
  app.post('/api/drawings', async (req, res) => {
    const drawing = new Drawing(req.body);
    try {
      const newDrawing = await drawing.save();
      res.status(201).json(newDrawing);
    } catch (err) {
      res.status(400).json({ message: err.message });
    }
  });


app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    });