'use client';

import React, { useState } from 'react';
import { CrmRecord, SkippedRecord } from '@/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertTriangle, Download } from 'lucide-react';

interface ResultsTableProps {
    imported: CrmRecord[];
    skipped: SkippedRecord[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ imported, skipped }) => {
    const [activeTab, setActiveTab] = useState<'imported' | 'skipped'>('imported');

    // Extract headers for imported (if we have any data)
    const importedHeaders = imported.length > 0 
        ? Object.keys(imported[0]) 
        : ['name', 'email', 'mobile_without_country_code', 'crm_status', 'crm_note'];

    // Extract headers for skipped original rows
    const skippedHeaders = skipped.length > 0
        ? Object.keys(skipped[0].original_row)
        : [];

    return (
        <div className="w-full flex flex-col h-[600px] border border-gray-200 rounded-xl overflow-hidden bg-white shadow-sm animate-in slide-in-from-bottom-4 duration-500">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 bg-gray-50">
                <button
                    onClick={() => setActiveTab('imported')}
                    className={twMerge(
                        'flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors relative',
                        activeTab === 'imported' ? 'text-blue-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Imported Records
                    <span className="bg-blue-100 text-blue-700 py-0.5 px-2 rounded-full text-xs ml-2 tabular-nums">
                        {imported.length}
                    </span>
                    {activeTab === 'imported' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('skipped')}
                    className={twMerge(
                        'flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors relative',
                        activeTab === 'skipped' ? 'text-amber-600 bg-white' : 'text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                    )}
                >
                    <AlertTriangle className="w-4 h-4" />
                    Skipped Records
                    <span className="bg-amber-100 text-amber-700 py-0.5 px-2 rounded-full text-xs ml-2 tabular-nums">
                        {skipped.length}
                    </span>
                    {activeTab === 'skipped' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600" />
                    )}
                </button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto bg-white">
                {activeTab === 'imported' ? (
                    imported.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">No imported records yet.</div>
                    ) : (
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm border-b border-gray-200">
                                <tr>
                                    <th className="px-4 py-3 border-r border-gray-200 w-16 text-center text-gray-400 font-medium bg-gray-50">#</th>
                                    {importedHeaders.map((header) => (
                                        <th key={header} className="px-4 py-3 border-r border-gray-200 font-semibold whitespace-nowrap bg-gray-50">
                                            {header.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {imported.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-blue-50/50 transition-colors">
                                        <td className="px-4 py-2 border-r border-gray-100 text-center text-gray-400 font-mono text-xs">{rowIndex + 1}</td>
                                        {importedHeaders.map((header, colIndex) => (
                                            <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 border-r border-gray-100 text-gray-700 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={(row as any)[header] || ''}>
                                                {(row as any)[header] || <span className="text-gray-300 italic">-</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                ) : (
                    skipped.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500">No skipped records yet.</div>
                    ) : (
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 uppercase bg-amber-50 sticky top-0 z-10 shadow-sm border-b border-amber-200">
                                <tr>
                                    <th className="px-4 py-3 border-r border-amber-100 w-16 text-center text-amber-700/60 font-medium bg-amber-50">#</th>
                                    <th className="px-4 py-3 border-r border-amber-100 font-bold text-amber-800 bg-amber-50 whitespace-nowrap">Failure Reason</th>
                                    {skippedHeaders.map((header) => (
                                        <th key={header} className="px-4 py-3 border-r border-amber-100 font-semibold bg-amber-50 whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100">
                                {skipped.map((row, rowIndex) => (
                                    <tr key={rowIndex} className="hover:bg-amber-50/30 transition-colors">
                                        <td className="px-4 py-2 border-r border-gray-100 text-center text-gray-400 font-mono text-xs">{rowIndex + 1}</td>
                                        <td className="px-4 py-2 border-r border-gray-100 text-amber-700 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]" title={row.reason}>
                                            {row.reason}
                                        </td>
                                        {skippedHeaders.map((header, colIndex) => (
                                            <td key={`${rowIndex}-${colIndex}`} className="px-4 py-2 border-r border-gray-100 text-gray-500 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={row.original_row[header] || ''}>
                                                {row.original_row[header] || <span className="text-gray-300 italic">-</span>}
                                            </td>
                                        ))}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
};
