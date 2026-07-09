import multer from 'multer';

// Use memoryStorage because we are stateless and will stream the parsed 
// buffer directly or batch it for the AI without needing disk cleanup.
const storage = multer.memoryStorage();

const fileFilter = (
    req: Express.Request,
    file: Express.Multer.File,
    cb: multer.FileFilterCallback
) => {
    // Basic check for CSV extensions and MIME types
    if (
        file.mimetype === 'text/csv' ||
        file.mimetype === 'application/vnd.ms-excel' ||
        file.originalname.toLowerCase().endsWith('.csv')
    ) {
        cb(null, true);
    } else {
        cb(new Error('Invalid file type. Only CSV files are allowed.'));
    }
};

export const uploadMiddleware = multer({
    storage,
    fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024, // 10 MB limit
    },
});
