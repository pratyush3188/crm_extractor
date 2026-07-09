'use client';

import React from 'react';
import { Loader2 } from 'lucide-react';

interface ProgressIndicatorProps {
    currentBatch: number;
    totalBatches: number;
    runningImportedCount: number;
    runningSkippedCount: number;
}

export const ProgressIndicator: React.FC<ProgressIndicatorProps> = ({
    currentBatch,
    totalBatches,
    runningImportedCount,
    runningSkippedCount
}) => {
    const percentage = totalBatches > 0 ? Math.round((currentBatch / totalBatches) * 100) : 0;

    return (
        <div className="w-full max-w-2xl mx-auto bg-white border border-gray-200 rounded-xl p-8 shadow-sm flex flex-col items-center justify-center animate-in zoom-in-95 duration-500">
            <div className="flex items-center gap-3 mb-6">
                <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
                <h3 className="text-xl font-bold text-gray-900">AI is mapping your data...</h3>
            </div>

            <div className="w-full space-y-2 mb-8">
                <div className="flex justify-between text-sm font-medium text-gray-700">
                    <span>Processing batch {currentBatch} of {totalBatches}</span>
                    <span>{percentage}%</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-4 overflow-hidden relative">
                    <div 
                        className="bg-blue-600 h-full transition-all duration-700 ease-out absolute left-0 top-0"
                        style={{ width: `${percentage}%` }}
                    />
                    {/* Add a subtle shimmer effect to the progress bar to make it feel active */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full animate-[shimmer_1.5s_infinite]" />
                </div>
            </div>

            <div className="flex gap-12 w-full justify-center">
                <div className="flex flex-col items-center">
                    <div className="text-3xl font-black text-green-600 tabular-nums">{runningImportedCount}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Imported</div>
                </div>
                <div className="w-px bg-gray-200" />
                <div className="flex flex-col items-center">
                    <div className="text-3xl font-black text-amber-500 tabular-nums">{runningSkippedCount}</div>
                    <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mt-1">Skipped</div>
                </div>
            </div>
        </div>
    );
};
