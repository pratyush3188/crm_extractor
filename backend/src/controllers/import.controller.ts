import { Request, Response } from 'express';
import { parseCSV } from '../services/csv.service';
import { splitIntoBatches, extractBatch } from '../services/ai.service';
import crypto from 'crypto';
import {
    SSEStartedEvent,
    SSEBatchCompleteEvent,
    SSEDoneEvent,
    SSEErrorEvent
} from '../types';

// In-memory store for batches waiting to be processed
const jobs = new Map<string, Record<string, string>[][]>();

export const uploadCsvData = async (req: Request, res: Response) => {
    // a) Validate file was uploaded
    if (!req.file) {
        return res.status(400).json({ error: 'No CSV file uploaded.' });
    }

    try {
        // b) Parse CSV and split into batches immediately
        const rows = await parseCSV(req.file.buffer);
        const batches = splitIntoBatches(rows, 25);
        
        // c) Generate unique job ID and store the batches
        const jobId = crypto.randomUUID();
        jobs.set(jobId, batches);

        // d) Return the job ID to the client so they can start the GET stream
        res.json({ jobId, totalBatches: batches.length, totalRows: rows.length });
    } catch (err: any) {
        res.status(400).json({ error: err.message });
    }
};

export const streamCsvJob = async (req: Request, res: Response) => {
    const { jobId } = req.params;
    
    const batches = jobs.get(jobId);
    if (!batches) {
        return res.status(404).json({ error: 'Job not found or already processed.' });
    }

    // Remove from memory immediately so it can't be started twice
    jobs.delete(jobId);

    // Set standard SSE headers for GET request
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    res.setHeader('X-Accel-Buffering', 'no'); 
    
    // Disable Nagle's algorithm
    req.socket.setTimeout(0);
    req.socket.setNoDelay(true);
    req.socket.setKeepAlive(true);

    res.flushHeaders(); 

    // Handle client disconnect
    let clientDisconnected = false;
    req.on('close', () => {
        clientDisconnected = true;
    });

    try {
        const totalBatches = batches.length;
        const totalRows = batches.reduce((sum, b) => sum + b.length, 0);

        // e) Write "started" event
        const startedEvent: SSEStartedEvent = { totalRows, totalBatches };
        res.write(`event: started\ndata: ${JSON.stringify(startedEvent)}\n\n`);

        let totalImported = 0;
        let totalSkipped = 0;

        // f) Loop sequentially
        for (let i = 0; i < batches.length; i++) {
            if (clientDisconnected) break;

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
                // Smooth UX artificial delay
                await new Promise(resolve => setTimeout(resolve, 500));
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
        if (!clientDisconnected) {
            const errorEvent: SSEErrorEvent = { 
                message: err.message || 'An unexpected error occurred during processing.' 
            };
            res.write(`event: error\ndata: ${JSON.stringify(errorEvent)}\n\n`);
            res.end();
        }
    }
};
