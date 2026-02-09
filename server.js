import dotenv from 'dotenv';
dotenv.config({ path: "./.env" });

import express from 'express';
import cors from 'cors';
import analysisRoutes from './routes/analysisRoutes.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));

// Routes
app.get('/', (req, res) => {
  res.send('ATS Checker Backend is running.');
});

app.use('/', analysisRoutes);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
