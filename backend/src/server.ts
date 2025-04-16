import 'module-alias/register';

import cors from "cors"

import express from 'express';
import dotenv from 'dotenv';
import cookieParser from "cookie-parser"

import { connectDB } from './lib/db';

import authRoutes from './routes/auth.route';
import messageRoutes from './routes/message.route';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json({ limit: '10mb' }));
app.use(cookieParser());
app.use(cors({
  origin: "http://localhost:5173",
  credentials: true
})
);

app.use("/api/auth", authRoutes);
app.use("/api/messages", messageRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});