import { Router } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { uploadCsvData, streamCsvJob } from '../controllers/import.controller';

const router = Router();

// POST /api/v1/import/upload - Parses CSV, splits into batches, returns Job ID
router.post('/upload', uploadMiddleware.single('file'), uploadCsvData);

// GET /api/v1/import/stream/:jobId - Native EventSource SSE endpoint
router.get('/stream/:jobId', streamCsvJob);

export default router;
