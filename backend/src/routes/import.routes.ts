import { Router } from 'express';
import { uploadMiddleware } from '../middlewares/upload.middleware';
import { extractCsvData } from '../controllers/import.controller';

const router = Router();

// POST /api/v1/import/extract
router.post('/extract', uploadMiddleware.single('file'), extractCsvData);

export default router;
