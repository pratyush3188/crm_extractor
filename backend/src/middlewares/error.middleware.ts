import { Request, Response, NextFunction } from 'express';

export const errorHandler = (
    err: any,
    req: Request,
    res: Response,
    next: NextFunction
) => {
    console.error('Error caught by global handler:', err);

    // If it's a Multer error (e.g., file size limit)
    if (err.name === 'MulterError') {
        if (err.code === 'LIMIT_FILE_SIZE') {
            return res.status(400).json({ 
                error: 'File size limit exceeded. Maximum allowed size is 10MB.' 
            });
        }
        return res.status(400).json({ error: `Upload error: ${err.message}` });
    }

    // Handle our custom file type error from multer fileFilter
    if (err.message === 'Invalid file type. Only CSV files are allowed.') {
         return res.status(400).json({ error: err.message });
    }

    // Default to 500 server error
    const status = err.status || 500;
    const message = err.message || 'Internal Server Error';

    res.status(status).json({
        error: message
    });
};
