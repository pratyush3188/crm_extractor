import { Request, Response } from 'express';
import { parseCSV } from '../services/csv.service';
import { splitIntoBatches, extractBatch } from '../services/ai.service';
import {
    SSEStartedEvent,
    SSEBatchCompleteEvent,
    SSEDoneEvent,
    SSEErrorEvent
} from '../types';

export const extractCsvData = async (req: Request, res: Response) => {
    // a) Validate file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    console.log('UPLOAD DEBUG:', {
        originalname: req.file.originalname,
        mimetype: req.file.mimetype,
        size: req.file.size,
        bufferLength: req.file.buffer ? req.file.buffer.length : 0
    });

    let rows: Record<string, string>[];

    // b) Parse CSV
    try {
        rows = await parseCSV(req.file.buffer);
    } catch (err: any) {
        // HTTP 400 error because SSE hasn't started yet
        return res.status(400).json({ error: err.message });
    }

    // c) Set SSE headers
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    // Important: flush headers immediately so client connection establishes
    res.flushHeaders(); 

    // Handle client disconnect
    let clientDisconnected = false;
    req.on('close', () => {
        console.log('Client disconnected from SSE stream early.');
        clientDisconnected = true;
    });

    try {
        // d) Split into batches
        const batches = splitIntoBatches(rows, 25);
        const totalRows = rows.length;
        const totalBatches = batches.length;

        // e) Write "started" event
        const startedEvent: SSEStartedEvent = { totalRows, totalBatches };
        res.write(`event: started\ndata: ${JSON.stringify(startedEvent)}\n\n`);

        let totalImported = 0;
        let totalSkipped = 0;

        // f) Loop sequentially
        for (let i = 0; i < batches.length; i++) {
            if (clientDisconnected) {
                break;
            }

            const batch = batches[i];
            
            // Wait for this batch to complete entirely before moving on
            const { imported, skipped } = await extractBatch(batch);
            
            totalImported += imported.length;
            totalSkipped += skipped.length;

            const batchEvent: SSEBatchCompleteEvent = {
                batchIndex: i,
                totalBatches,
                imported,
                skipped
            };
            
            if (!clientDisconnected) {
                res.write(`event: batch_complete\ndata: ${JSON.stringify(batchEvent)}\n\n`);
            }
        }

        // g & h) Accumulate totals and send "done" event
        if (!clientDisconnected) {
            const doneEvent: SSEDoneEvent = {
                totalImported,
                totalSkipped,
                totalProcessed: totalRows
            };
            res.write(`event: done\ndata: ${JSON.stringify(doneEvent)}\n\n`);
        }

        // i) Clean exit
        res.end();

    } catch (err: any) {
        // j) Mid-loop unexpected error
        console.error('Unexpected error mid-stream:', err);
        if (!clientDisconnected) {
            const errorEvent: SSEErrorEvent = { 
                message: err.message || 'An unexpected error occurred during processing.' 
            };
            res.write(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`);
            res.end();
        }
    }
};
