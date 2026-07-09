'use client';

import React, { useMemo } from 'react';

interface PreviewTableProps {
    rows: Record<string, string>[];
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ rows }) => {
    // Extract dynamic headers from the first row (if any)
    const headers = useMemo(() => {
        if (rows.length === 0) return [];
        return Object.keys(rows[0]);
    }, [rows]);

    if (rows.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
                No data to preview.
            </div>
        );
    }

    // Optimization note: For standard CRM uploads (e.g., < 5,000 rows), modern browsers 
    // handle native table rendering exceptionally well. If uploads scale into the tens 
    // of thousands of rows, replacing this standard table with `react-window` or slicing 
    // the preview to the first 500 rows is recommended to prevent DOM lag. 
    // For now, native sticky headers provide the best robust UX.
    const displayRows = rows.slice(0, 1000); // Cap preview to 1000 rows to prevent extreme lag
    const isTruncated = rows.length > 1000;

    return (
        <div className="w-full flex flex-col h-[500px] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            {isTruncated && (
                <div className="bg-amber-50 dark:bg-amber-900/30 border-b border-amber-200 dark:border-amber-800 p-2 text-xs text-amber-700 dark:text-amber-400 text-center font-medium">
                    Previewing the first 1000 of {rows.length} rows. All rows will be processed during import.
                </div>
            )}
            
            <div className="flex-1 overflow-auto">
                <table className="min-w-full text-sm text-left">
                    <thead className="text-xs text-gray-700 dark:text-slate-300 uppercase bg-gray-50 dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
                        <tr>
                            <th className="px-4 py-3 border-r border-gray-200 dark:border-slate-700 w-16 text-center text-gray-400 dark:text-slate-500 font-medium">
                                #
                            </th>
                            {headers.map((header) => (
                                <th key={header} className="px-4 py-3 border-r border-gray-200 dark:border-slate-700 font-semibold whitespace-nowrap">
                                    {header}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-200 dark:divide-slate-800">
                        {displayRows.map((row, rowIndex) => (
                            <tr key={rowIndex} className="hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-colors">
                                <td className="px-4 py-2 border-r border-gray-200 dark:border-slate-800 text-center text-gray-400 dark:text-slate-500 font-mono text-xs">
                                    {rowIndex + 1}
                                </td>
                                {headers.map((header, colIndex) => (
                                    <td 
                                        key={`${rowIndex}-${colIndex}`} 
                                        className="px-4 py-2 border-r border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
                                        title={row[header] || ''}
                                    >
                                        {row[header] || <span className="text-gray-300 dark:text-slate-600 italic">empty</span>}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
