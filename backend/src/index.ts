import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import { errorHandler } from './middlewares/error.middleware';
import importRoutes from './routes/import.routes';

const app = express();
const port = process.env.PORT || 3001;

// Middleware setup
app.use(cors());
app.use(express.json());

// Routes
app.use('/api/v1/import', importRoutes);

// Health check endpoint
app.get('/api/health', (req: Request, res: Response) => {
    res.json({ status: 'ok' });
});


// Global Error Handler (must be the last middleware)
app.use(errorHandler);

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
