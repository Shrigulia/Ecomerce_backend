import express from 'express';
import { config } from 'dotenv';
import userRouter from './routes/userRoute.js';
import orderRouter from './routes/orderRoutes.js';
import cookieParser from 'cookie-parser';
import bodyParser from 'body-parser';
import productRouter from './routes/productRoute.js';

export const app = express();

config({ path: "./data/config.env" })

// Middlewares
app.use(express.json());
app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));



// routes prefix
app.use("/api/v1", userRouter)
app.use("/api/v1", productRouter)
app.use("/api/v1", orderRouter)

app.get("/", (req, res) => {
    res.send("Server is working")
})