import 'module-alias/register';

import express from 'express';
import dotenv from 'dotenv';

import { connectDB } from './lib/db';

import authRoutes from './routes/auth.route';

dotenv.config();
const app = express();

const PORT = process.env.PORT || 5001;

app.use(express.json())

app.use("/api/auth", authRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
  connectDB();
});