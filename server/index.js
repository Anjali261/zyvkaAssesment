const express = require('express');
const app = express();
const cors = require('cors')
const mongoose = require('mongoose');
const dotenv = require('dotenv')
dotenv.config();
const PORT = 4000

app.use(cors());


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

  app.use(express.json());

  app.get('/api/drawings', async (req, res) => {
    try {
      const drawings = await Drawing.find();
      res.json(drawings);
    } catch (err) {
      res.status(500).json({
        message: err.message
      });
    }
  });
  
  app.post('/api/updateDrawings', async (req, res) => {
    const updatedDrawings = req.body;
  
    try {
      // Update the database with the provided drawings
      for (const updatedDrawing of updatedDrawings) {
        await Drawing.updateOne({ _id: updatedDrawing._id }, updatedDrawing, { upsert: true });
      }
  
      res.json({ message: 'Drawings updated successfully' });
    } catch (error) {
      res.status(500).json({ message: 'Failed to update drawings' });
    }
  });
    

  app.delete('/api/drawings/:id', async (req, res) => {
    const id = req.params.id;
    try {
        const deletedDrawing = await Drawing.findByIdAndDelete(id);
        if (deletedDrawing) {
            res.json({ message: 'Drawing deleted successfully' });
        } else {
            res.status(404).json({ message: 'Drawing not found' });
        }
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`)
    });
