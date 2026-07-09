'use client';

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { UploadCloud, FileType, AlertCircle } from 'lucide-react';
import { parseCSVClientSide } from '@/lib/csv';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

interface UploadDropzoneProps {
    onUploadComplete: (file: File, rows: Record<string, string>[]) => void;
}

export const UploadDropzone: React.FC<UploadDropzoneProps> = ({ onUploadComplete }) => {
    const [error, setError] = useState<string | null>(null);
    const [isProcessing, setIsProcessing] = useState(false);

    const onDrop = useCallback(async (acceptedFiles: File[]) => {
        setError(null);
        if (acceptedFiles.length === 0) return;

        const file = acceptedFiles[0];
        if (!file.name.toLowerCase().endsWith('.csv') && file.type !== 'text/csv') {
            setError('Please upload a valid CSV file.');
            return;
        }

        setIsProcessing(true);
        try {
            const rows = await parseCSVClientSide(file);
            onUploadComplete(file, rows);
        } catch (err: any) {
            setError(err.message || 'Failed to parse CSV file.');
        } finally {
            setIsProcessing(false);
        }
    }, [onUploadComplete]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({
        onDrop,
        accept: {
            'text/csv': ['.csv']
        },
        maxFiles: 1,
        disabled: isProcessing
    });

    return (
        <div className="w-full max-w-2xl mx-auto">
            <div
                {...getRootProps()}
                className={twMerge(
                    clsx(
                        'flex flex-col items-center justify-center w-full h-64 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-200 ease-in-out',
                        isDragActive ? 'border-blue-500 bg-blue-50/50 dark:bg-blue-900/20' : 'border-gray-300 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-800/80 hover:border-gray-400 dark:hover:border-slate-600',
                        isProcessing && 'opacity-50 cursor-not-allowed'
                    )
                )}
            >
                <input {...getInputProps()} />
                
                <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-6">
                    {isProcessing ? (
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4" />
                    ) : (
                        <UploadCloud className={clsx("w-12 h-12 mb-4", isDragActive ? "text-blue-500" : "text-gray-400 dark:text-slate-500")} />
                    )}
                    
                    <p className="mb-2 text-sm text-gray-700 dark:text-slate-300">
                        <span className="font-semibold text-blue-600 dark:text-blue-400">Click to upload</span> or drag and drop
                    </p>
                    <p className="text-xs text-gray-500 dark:text-slate-400">
                        CSV files only (max 10MB)
                    </p>
                </div>
            </div>

            {error && (
                <div className="mt-4 flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg border border-red-100 text-sm">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                </div>
            )}
        </div>
    );
};
