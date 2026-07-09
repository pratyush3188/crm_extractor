'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { PreviewTable } from '@/components/PreviewTable';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ResultsTable } from '@/components/ResultsTable';
import { FileText, ArrowRight, CheckCircle2 } from 'lucide-react';
import { CrmRecord, SkippedRecord } from '@/types';

export default function Home() {
    const [file, setFile] = useState<File | null>(null);
    const [parsedRows, setParsedRows] = useState<Record<string, string>[]>([]);
    const [stage, setStage] = useState<'upload' | 'preview' | 'processing' | 'results'>('upload');
    
    // SSE State
    const [totalBatches, setTotalBatches] = useState(0);
    const [completedBatches, setCompletedBatches] = useState(0);
    const [importedRecords, setImportedRecords] = useState<CrmRecord[]>([]);
    const [skippedRecords, setSkippedRecords] = useState<SkippedRecord[]>([]);
    const [sseError, setSseError] = useState<string | null>(null);
    const [abortStream, setAbortStream] = useState<(() => void) | null>(null);

    const resetState = () => {
        if (abortStream) abortStream();
        setFile(null);
        setParsedRows([]);
        setStage('upload');
        setTotalBatches(0);
        setCompletedBatches(0);
        setImportedRecords([]);
        setSkippedRecords([]);
        setSseError(null);
        setAbortStream(null);
    };

    const handleUploadComplete = (uploadedFile: File, rows: Record<string, string>[]) => {
        setFile(uploadedFile);
        setParsedRows(rows);
        setStage('preview');
        // Pre-reset SSE state for fresh start
        setTotalBatches(0);
        setCompletedBatches(0);
        setImportedRecords([]);
        setSkippedRecords([]);
        setSseError(null);
    };

    const handleConfirmImport = async () => {
        if (!file) return;
        setStage('processing');
        setSseError(null);
        setImportedRecords([]);
        setSkippedRecords([]);

        try {
            const { streamImport } = await import('@/lib/api');
            const { abort } = streamImport(file, {
                onStarted: (data) => {
                    setTotalBatches(data.totalBatches);
                },
                onBatchComplete: (data) => {
                    setCompletedBatches(data.batchIndex + 1);
                    setImportedRecords(prev => [...prev, ...data.imported]);
                    setSkippedRecords(prev => [...prev, ...data.skipped]);
                },
                onDone: () => {
                    setStage('results');
                    setAbortStream(null);
                },
                onError: (data) => {
                    setSseError(data.message);
                    setAbortStream(null);
                }
            });
            setAbortStream(() => abort);
        } catch (err: any) {
            setSseError(err.message || 'Failed to connect to the server.');
        }
    };

    return (
        <div className="flex flex-col gap-8 fade-in">
            {/* Stage Indicators */}
            <div className="flex items-center justify-center gap-4 text-sm font-medium">
                {/* 1. Upload */}
                <div className={`flex items-center gap-2 ${stage === 'upload' ? 'text-blue-600' : 'text-green-600'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage === 'upload' ? 'border-blue-600 bg-blue-50' : 'border-green-600 bg-green-50'}`}>
                        {stage === 'upload' ? '1' : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <span>Upload CSV</span>
                </div>
                
                <div className={`h-[2px] w-8 md:w-12 ${stage !== 'upload' ? 'bg-blue-600' : 'bg-gray-200'}`} />
                
                {/* 2. Preview */}
                <div className={`flex items-center gap-2 ${stage === 'preview' ? 'text-blue-600' : (stage === 'processing' || stage === 'results') ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage === 'preview' ? 'border-blue-600 bg-blue-50' : (stage === 'processing' || stage === 'results') ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                        {(stage === 'processing' || stage === 'results') ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                    </div>
                    <span>Preview & Map</span>
                </div>

                <div className={`h-[2px] w-8 md:w-12 ${(stage === 'processing' || stage === 'results') ? 'bg-blue-600' : 'bg-gray-200'}`} />

                {/* 3. Extract/Processing */}
                <div className={`flex items-center gap-2 ${stage === 'processing' ? 'text-blue-600' : stage === 'results' ? 'text-green-600' : 'text-gray-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage === 'processing' ? 'border-blue-600 bg-blue-50' : stage === 'results' ? 'border-green-600 bg-green-50' : 'border-gray-200'}`}>
                        {stage === 'results' ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                    </div>
                    <span>AI Extraction</span>
                </div>
            </div>

            {/* Stage 1: Upload */}
            {stage === 'upload' && (
                <div className="flex flex-col items-center justify-center mt-8 space-y-6">
                    <div className="text-center max-w-lg">
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Upload your contacts</h2>
                        <p className="text-gray-500">
                            Upload a CSV file containing your leads. Don't worry about formatting—our AI will intelligently map your columns to the CRM schema.
                        </p>
                    </div>
                    <UploadDropzone onUploadComplete={handleUploadComplete} />
                </div>
            )}

            {/* Stage 2: Preview */}
            {stage === 'preview' && file && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-1 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600" />
                                {file.name}
                            </h2>
                            <p className="text-gray-500">
                                Found <span className="font-semibold text-gray-900">{parsedRows.length}</span> valid rows. Please verify the raw data below before our AI processes it.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={resetState}
                                className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors font-medium text-sm"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmImport}
                                className="px-5 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium text-sm flex items-center gap-2 shadow-sm"
                            >
                                Confirm & Import with AI
                                <ArrowRight className="w-4 h-4" />
                            </button>
                        </div>
                    </div>
                    <PreviewTable rows={parsedRows} />
                </div>
            )}

            {/* Stage 3: Processing & Error Handling */}
            {stage === 'processing' && (
                <div className="flex flex-col gap-8 animate-in slide-in-from-bottom-4 duration-500 w-full mt-4">
                    {sseError ? (
                        <div className="w-full max-w-2xl mx-auto bg-white border border-red-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-red-100 text-red-600 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2">Extraction Failed</h3>
                            <p className="text-gray-500 mb-6">{sseError}</p>
                            <div className="flex gap-3">
                                <button onClick={resetState} className="px-4 py-2 border border-gray-300 rounded-lg font-medium text-gray-700 hover:bg-gray-50">
                                    Start Over
                                </button>
                                <button onClick={handleConfirmImport} className="px-4 py-2 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700">
                                    Retry Extraction
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <ProgressIndicator 
                                currentBatch={completedBatches}
                                totalBatches={totalBatches}
                                runningImportedCount={importedRecords.length}
                                runningSkippedCount={skippedRecords.length}
                            />
                            
                            {/* Live Streaming ResultsTable during Stage 3 */}
                            <div className="mt-4">
                                <div className="flex justify-between items-end mb-4">
                                    <h3 className="text-lg font-bold text-gray-800">Live Extraction Results</h3>
                                    <button onClick={resetState} className="text-sm font-medium text-red-600 hover:text-red-700 hover:underline">
                                        Cancel Import
                                    </button>
                                </div>
                                <ResultsTable imported={importedRecords} skipped={skippedRecords} />
                            </div>
                        </>
                    )}
                </div>
            )}

            {/* Stage 4: Final Results */}
            {stage === 'results' && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500 w-full mt-4">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-green-50/50 p-6 rounded-xl border border-green-100">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-7 h-7 text-green-600" />
                                Extraction Complete!
                            </h2>
                            <p className="text-gray-600">
                                Successfully mapped <span className="font-semibold text-green-700">{importedRecords.length}</span> records. 
                                Skipped <span className="font-semibold text-amber-700">{skippedRecords.length}</span> records.
                            </p>
                        </div>
                        
                        <div className="flex items-center gap-3">
                            <button 
                                onClick={resetState}
                                className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium shadow-sm"
                            >
                                Import Another File
                            </button>
                            <button 
                                onClick={() => alert('Download or save functionality would trigger here!')}
                                className="px-5 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium flex items-center gap-2 shadow-sm"
                            >
                                Finish & Save
                            </button>
                        </div>
                    </div>

                    <ResultsTable imported={importedRecords} skipped={skippedRecords} />
                </div>
            )}
        </div>
    );
}
