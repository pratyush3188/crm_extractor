'use client';

import React, { useState } from 'react';
import { UploadDropzone } from '@/components/UploadDropzone';
import { PreviewTable } from '@/components/PreviewTable';
import { ProgressIndicator } from '@/components/ProgressIndicator';
import { ResultsTable } from '@/components/ResultsTable';
import { FileText, ArrowRight, CheckCircle2, AlertTriangle, Download, Copy } from 'lucide-react';
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

    const handleDownloadCSV = async () => {
        if (importedRecords.length === 0) return;
        const Papa = (await import('papaparse')).default;
        const csvString = Papa.unparse(importedRecords);
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `crm_imported_${file?.name || 'records'}`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    };

    const handleCopyCSV = async () => {
        if (importedRecords.length === 0) return;
        const Papa = (await import('papaparse')).default;
        const csvString = Papa.unparse(importedRecords);
        try {
            await navigator.clipboard.writeText(csvString);
            alert('CSV data copied to clipboard!');
        } catch (err) {
            alert('Failed to copy to clipboard.');
        }
    };

    return (
        <div suppressHydrationWarning className="flex flex-col gap-4 md:gap-8 fade-in transition-colors duration-300">
            {/* Stage Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-2 md:gap-4 text-xs md:text-sm font-medium">
                {/* 1. Upload */}
                <div className={`flex items-center gap-2 ${stage === 'upload' ? 'text-blue-600 dark:text-blue-400' : 'text-green-600 dark:text-green-400'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage === 'upload' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : 'border-green-600 bg-green-50 dark:bg-green-900/30'}`}>
                        {stage === 'upload' ? '1' : <CheckCircle2 className="w-5 h-5" />}
                    </div>
                    <span className="hidden sm:inline">Upload CSV</span>
                </div>
                
                <div className={`h-[2px] w-4 sm:w-8 md:w-12 ${stage !== 'upload' ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'}`} />
                
                {/* 2. Preview */}
                <div className={`flex items-center gap-2 ${stage === 'preview' ? 'text-blue-600 dark:text-blue-400' : (stage === 'processing' || stage === 'results') ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage === 'preview' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : (stage === 'processing' || stage === 'results') ? 'border-green-600 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-slate-700 dark:bg-slate-800'}`}>
                        {(stage === 'processing' || stage === 'results') ? <CheckCircle2 className="w-5 h-5" /> : '2'}
                    </div>
                    <span className="hidden sm:inline">Preview & Map</span>
                </div>

                <div className={`h-[2px] w-4 sm:w-8 md:w-12 ${(stage === 'processing' || stage === 'results') ? 'bg-blue-600 dark:bg-blue-500' : 'bg-gray-200 dark:bg-slate-700'}`} />

                {/* 3. Extract/Processing */}
                <div className={`flex items-center gap-2 ${stage === 'processing' ? 'text-blue-600 dark:text-blue-400' : stage === 'results' ? 'text-green-600 dark:text-green-400' : 'text-gray-400 dark:text-slate-500'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${stage === 'processing' ? 'border-blue-600 bg-blue-50 dark:bg-blue-900/30' : stage === 'results' ? 'border-green-600 bg-green-50 dark:bg-green-900/30' : 'border-gray-200 dark:border-slate-700 dark:bg-slate-800'}`}>
                        {stage === 'results' ? <CheckCircle2 className="w-5 h-5" /> : '3'}
                    </div>
                    <span className="hidden sm:inline">AI Extraction</span>
                </div>
            </div>

            {/* Stage 1: Upload */}
            {stage === 'upload' && (
                <div className="flex flex-col items-center justify-center mt-4 space-y-12">
                    {/* Hero Header */}
                    <div className="text-center max-w-2xl mx-auto space-y-4 px-4">
                        <h2 className="text-3xl md:text-5xl font-black text-gray-900 dark:text-white tracking-tight">
                            AI-Powered CSV Mapping
                        </h2>
                        <p className="text-lg text-gray-600 dark:text-gray-400 leading-relaxed">
                            Upload messy, unstructured data. Our AI automatically maps it to the standard CRM schema in real-time. No manual templates needed.
                        </p>
                    </div>

                    {/* How It Works Steps */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-4xl">
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-blue-500 group-hover:bg-purple-500 transition-colors"></div>
                            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">1</div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Upload CSV</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Drop your raw CSV file below. We handle missing columns and weird formats.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-purple-500 group-hover:bg-purple-600 transition-colors"></div>
                            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">2</div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">Preview Data</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Preview your raw data in the browser and confirm the start of the AI job.</p>
                        </div>
                        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm hover:shadow-md hover:border-purple-200 dark:hover:border-purple-800 transition-all relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-green-500 group-hover:bg-purple-500 transition-colors"></div>
                            <div className="w-12 h-12 bg-gray-50 dark:bg-slate-800 text-gray-900 dark:text-white border border-gray-200 dark:border-slate-700 rounded-xl flex items-center justify-center font-black text-xl mb-4 group-hover:scale-110 transition-transform">3</div>
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">AI Extraction</h3>
                            <p className="text-sm text-gray-500 dark:text-slate-400">Watch the AI map and standardize your data in real-time via live stream.</p>
                        </div>
                    </div>

                    {/* Upload Dropzone */}
                    <div className="w-full max-w-xl">
                        <UploadDropzone onUploadComplete={handleUploadComplete} />
                    </div>
                </div>
            )}

            {/* Stage 2: Preview */}
            {stage === 'preview' && file && (
                <div className="flex flex-col gap-6 animate-in slide-in-from-bottom-4 duration-500">
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
                                <FileText className="w-6 h-6 text-blue-600 dark:text-blue-500" />
                                {file.name}
                            </h2>
                            <p className="text-gray-500 dark:text-slate-400">
                                Found <span className="font-semibold text-gray-900 dark:text-white">{parsedRows.length}</span> valid rows. Please verify the raw data below before our AI processes it.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-0">
                            <button 
                                onClick={resetState}
                                className="flex-1 md:flex-none px-4 py-2 text-gray-600 dark:text-slate-300 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm text-center"
                            >
                                Cancel
                            </button>
                            <button 
                                onClick={handleConfirmImport}
                                className="flex-1 md:flex-none px-5 py-2 bg-blue-600 dark:bg-blue-600 text-white rounded-lg hover:bg-blue-700 dark:hover:bg-blue-500 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm"
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
                        <div className="w-full max-w-2xl mx-auto bg-white dark:bg-slate-900 border border-red-200 dark:border-red-900/50 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center text-center">
                            <div className="w-12 h-12 bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400 rounded-full flex items-center justify-center mb-4">
                                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                </svg>
                            </div>
                            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Extraction Failed</h3>
                            <p className="text-gray-500 dark:text-slate-400 mb-6">{sseError}</p>
                            <div className="flex gap-3">
                                <button onClick={resetState} className="px-4 py-2 border border-gray-300 dark:border-slate-700 rounded-lg font-medium text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800">
                                    Start Over
                                </button>
                                <button onClick={handleConfirmImport} className="px-4 py-2 bg-red-600 dark:bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 dark:hover:bg-red-500">
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
                                    <h3 className="text-lg font-bold text-gray-800 dark:text-white">Live Extraction Results</h3>
                                    <button onClick={resetState} className="text-sm font-medium text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:underline">
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
                    <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 bg-green-50/50 dark:bg-green-900/10 p-6 rounded-xl border border-green-100 dark:border-green-900/50">
                        <div>
                            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-7 h-7 text-green-600 dark:text-green-500" />
                                Extraction Complete!
                            </h2>
                            <p className="text-gray-600 dark:text-slate-300">
                                Successfully mapped <span className="font-semibold text-green-700 dark:text-green-400">{importedRecords.length}</span> records. 
                                Skipped <span className="font-semibold text-amber-700 dark:text-amber-500">{skippedRecords.length}</span> records.
                            </p>
                        </div>
                        
                        <div className="flex flex-wrap items-center gap-2 md:gap-3 mt-4 md:mt-0">
                            {skippedRecords.length > 0 && (
                                <button 
                                    onClick={() => {
                                        import('papaparse').then((Papa) => {
                                            const rowsToRetry = skippedRecords.map(s => s.original_row);
                                            const csvString = Papa.default.unparse(rowsToRetry);
                                            const newFile = new File([csvString], `retry_${file?.name || 'skipped.csv'}`, { type: 'text/csv' });
                                            
                                            // Reset file and rows to the skipped ones, putting them back in preview stage
                                            handleUploadComplete(newFile, rowsToRetry);
                                        });
                                    }}
                                    className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-amber-100 dark:bg-amber-900/30 border border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 rounded-lg hover:bg-amber-200 dark:hover:bg-amber-800/50 transition-colors font-medium text-sm shadow-sm flex items-center justify-center gap-2"
                                >
                                    <AlertTriangle className="w-4 h-4" />
                                    Retry Skipped
                                </button>
                            )}
                            <button 
                                onClick={resetState}
                                className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 rounded-lg hover:bg-gray-50 dark:hover:bg-slate-700 transition-colors font-medium text-sm shadow-sm text-center"
                            >
                                Import Another File
                            </button>
                            <div className="w-full md:w-auto flex flex-wrap gap-2 md:gap-3 mt-2 md:mt-0">
                                <button 
                                    onClick={handleCopyCSV}
                                    disabled={importedRecords.length === 0}
                                    className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Copy className="w-4 h-4" />
                                    Copy
                                </button>
                                <button 
                                    onClick={handleDownloadCSV}
                                    disabled={importedRecords.length === 0}
                                    className="flex-1 md:flex-none px-4 md:px-5 py-2.5 bg-green-600 dark:bg-green-600 text-white rounded-lg hover:bg-green-700 dark:hover:bg-green-500 transition-colors font-medium text-sm flex items-center justify-center gap-2 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    <Download className="w-4 h-4" />
                                    Download
                                </button>
                            </div>
                        </div>
                    </div>

                    <ResultsTable imported={importedRecords} skipped={skippedRecords} />
                </div>
            )}
        </div>
    );
}
