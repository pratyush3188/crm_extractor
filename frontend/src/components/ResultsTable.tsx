'use client';

import React, { useState, useRef } from 'react';
import { CrmRecord, SkippedRecord } from '@/types';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { CheckCircle2, AlertTriangle, Download } from 'lucide-react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface ResultsTableProps {
    imported: CrmRecord[];
    skipped: SkippedRecord[];
}

export const ResultsTable: React.FC<ResultsTableProps> = ({ imported, skipped }) => {
    const [activeTab, setActiveTab] = useState<'imported' | 'skipped'>('imported');
    const parentRef = useRef<HTMLDivElement>(null);

    // Extract headers for imported (if we have any data)
    const importedHeaders = imported.length > 0 
        ? Object.keys(imported[0]) 
        : ['name', 'email', 'mobile_without_country_code', 'crm_status', 'crm_note'];

    // Extract headers for skipped original rows
    const skippedHeaders = skipped.length > 0
        ? Object.keys(skipped[0].original_row)
        : [];

    const importedVirtualizer = useVirtualizer({
        count: imported.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 41,
        overscan: 10,
    });

    const skippedVirtualizer = useVirtualizer({
        count: skipped.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 41,
        overscan: 10,
    });

    const activeVirtualizer = activeTab === 'imported' ? importedVirtualizer : skippedVirtualizer;
    const virtualRows = activeVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
    const paddingBottom = virtualRows.length > 0
        ? activeVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end || 0)
        : 0;

    return (
        <div className="w-full flex flex-col h-[600px] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm animate-in slide-in-from-bottom-4 duration-500">
            {/* Tabs Header */}
            <div className="flex border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
                <button
                    onClick={() => setActiveTab('imported')}
                    className={twMerge(
                        'flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors relative',
                        activeTab === 'imported' ? 'text-blue-600 dark:text-blue-400 bg-white dark:bg-slate-900' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    )}
                >
                    <CheckCircle2 className="w-4 h-4" />
                    Imported Records
                    <span className="bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 py-0.5 px-2 rounded-full text-xs ml-2 tabular-nums">
                        {imported.length}
                    </span>
                    {activeTab === 'imported' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600 dark:bg-blue-500" />
                    )}
                </button>

                <button
                    onClick={() => setActiveTab('skipped')}
                    className={twMerge(
                        'flex items-center gap-2 px-6 py-4 font-medium text-sm transition-colors relative',
                        activeTab === 'skipped' ? 'text-amber-600 dark:text-amber-400 bg-white dark:bg-slate-900' : 'text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-800'
                    )}
                >
                    <AlertTriangle className="w-4 h-4" />
                    Skipped Records
                    <span className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 py-0.5 px-2 rounded-full text-xs ml-2 tabular-nums">
                        {skipped.length}
                    </span>
                    {activeTab === 'skipped' && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-600 dark:bg-amber-500" />
                    )}
                </button>
            </div>

            {/* Table Content */}
            <div className="flex-1 overflow-auto bg-white dark:bg-slate-900" ref={parentRef}>
                {activeTab === 'imported' ? (
                    imported.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-500">No imported records yet.</div>
                    ) : (
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm border-b border-gray-200 dark:border-slate-700">
                                <tr>
                                    <th className="px-4 py-3 border-r border-gray-200 dark:border-slate-700 w-16 text-center text-gray-400 dark:text-slate-500 font-medium bg-gray-50 dark:bg-slate-800">#</th>
                                    {importedHeaders.map((header) => (
                                        <th key={header} className="px-4 py-3 border-r border-gray-200 dark:border-slate-700 font-semibold whitespace-nowrap bg-gray-50 dark:bg-slate-800">
                                            {header.replace(/_/g, ' ')}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {paddingTop > 0 && (
                                    <tr><td style={{ height: `${paddingTop}px` }} colSpan={importedHeaders.length + 1} /></tr>
                                )}
                                {virtualRows.map((virtualRow) => {
                                    const row = imported[virtualRow.index];
                                    return (
                                        <tr 
                                            key={virtualRow.key} 
                                            data-index={virtualRow.index} 
                                            ref={activeVirtualizer.measureElement}
                                            className="hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-colors"
                                        >
                                            <td className="px-4 py-2 border-r border-gray-100 dark:border-slate-800 text-center text-gray-400 dark:text-slate-500 font-mono text-xs">{virtualRow.index + 1}</td>
                                            {importedHeaders.map((header, colIndex) => (
                                                <td key={`${virtualRow.index}-${colIndex}`} className="px-4 py-2 border-r border-gray-100 dark:border-slate-800 text-gray-700 dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={(row as any)[header] || ''}>
                                                    {(row as any)[header] || <span className="text-gray-300 dark:text-slate-600 italic">-</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                                {paddingBottom > 0 && (
                                    <tr><td style={{ height: `${paddingBottom}px` }} colSpan={importedHeaders.length + 1} /></tr>
                                )}
                            </tbody>
                        </table>
                    )
                ) : (
                    skipped.length === 0 ? (
                        <div className="h-full flex items-center justify-center text-gray-500 dark:text-slate-500">No skipped records yet.</div>
                    ) : (
                        <table className="min-w-full text-sm text-left">
                            <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-amber-50 dark:bg-amber-900/20 sticky top-0 z-10 shadow-sm border-b border-amber-200 dark:border-amber-800/50">
                                <tr>
                                    <th className="px-4 py-3 border-r border-amber-100 dark:border-amber-800/50 w-16 text-center text-amber-700/60 dark:text-amber-500/60 font-medium bg-amber-50 dark:bg-amber-900/20">#</th>
                                    <th className="px-4 py-3 border-r border-amber-100 dark:border-amber-800/50 font-bold text-amber-800 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 whitespace-nowrap">Failure Reason</th>
                                    {skippedHeaders.map((header) => (
                                        <th key={header} className="px-4 py-3 border-r border-amber-100 dark:border-amber-800/50 font-semibold bg-amber-50 dark:bg-amber-900/20 whitespace-nowrap">
                                            {header}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-slate-800">
                                {paddingTop > 0 && (
                                    <tr><td style={{ height: `${paddingTop}px` }} colSpan={skippedHeaders.length + 2} /></tr>
                                )}
                                {virtualRows.map((virtualRow) => {
                                    const row = skipped[virtualRow.index];
                                    return (
                                        <tr 
                                            key={virtualRow.key} 
                                            data-index={virtualRow.index} 
                                            ref={activeVirtualizer.measureElement}
                                            className="hover:bg-amber-50/30 dark:hover:bg-amber-900/10 transition-colors"
                                        >
                                            <td className="px-4 py-2 border-r border-gray-100 dark:border-slate-800 text-center text-gray-400 dark:text-slate-500 font-mono text-xs">{virtualRow.index + 1}</td>
                                            <td className="px-4 py-2 border-r border-gray-100 dark:border-slate-800 text-amber-700 dark:text-amber-500 font-medium whitespace-nowrap overflow-hidden text-ellipsis max-w-[250px]" title={row.reason}>
                                                {row.reason}
                                            </td>
                                            {skippedHeaders.map((header, colIndex) => (
                                                <td key={`${virtualRow.index}-${colIndex}`} className="px-4 py-2 border-r border-gray-100 dark:border-slate-800 text-gray-500 dark:text-slate-400 whitespace-nowrap overflow-hidden text-ellipsis max-w-[200px]" title={row.original_row[header] || ''}>
                                                    {row.original_row[header] || <span className="text-gray-300 dark:text-slate-600 italic">-</span>}
                                                </td>
                                            ))}
                                        </tr>
                                    );
                                })}
                                {paddingBottom > 0 && (
                                    <tr><td style={{ height: `${paddingBottom}px` }} colSpan={skippedHeaders.length + 2} /></tr>
                                )}
                            </tbody>
                        </table>
                    )
                )}
            </div>
        </div>
    );
};
