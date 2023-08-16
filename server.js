import { app } from "./app.js";
import { connectDB } from "./data/db.js";
import cloudinary from 'cloudinary';

// connecting DB
connectDB();

cloudinary.config({
    cloud_name: process.env.CLOUD_NAME,
    api_key: process.env.API_KEY,
    api_secret: process.env.API_SECRET
})

// starting server 
app.listen(process.env.PORT, () => {
    console.log(`Server started on - http://localhost:${process.env.PORT} in ${process.env.MODE} mode`)
})
