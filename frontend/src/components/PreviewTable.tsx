'use client';

import React, { useMemo, useRef } from 'react';
import { useVirtualizer } from '@tanstack/react-virtual';

interface PreviewTableProps {
    rows: Record<string, string>[];
}

export const PreviewTable: React.FC<PreviewTableProps> = ({ rows }) => {
    const parentRef = useRef<HTMLDivElement>(null);

    // Extract dynamic headers from the first row (if any)
    const headers = useMemo(() => {
        if (rows.length === 0) return [];
        return Object.keys(rows[0]);
    }, [rows]);

    const rowVirtualizer = useVirtualizer({
        count: rows.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => 41, // approximate row height in pixels
        overscan: 10,
    });

    if (rows.length === 0) {
        return (
            <div className="p-8 text-center text-gray-500 bg-gray-50 dark:bg-slate-900 rounded-lg border border-gray-200 dark:border-slate-800">
                No data to preview.
            </div>
        );
    }

    const virtualRows = rowVirtualizer.getVirtualItems();
    const paddingTop = virtualRows.length > 0 ? virtualRows[0]?.start || 0 : 0;
    const paddingBottom = virtualRows.length > 0
        ? rowVirtualizer.getTotalSize() - (virtualRows[virtualRows.length - 1]?.end || 0)
        : 0;

    return (
        <div className="w-full flex flex-col h-[500px] border border-gray-200 dark:border-slate-800 rounded-xl overflow-hidden bg-white dark:bg-slate-900 shadow-sm">
            <div className="bg-blue-50 dark:bg-blue-900/20 border-b border-blue-200 dark:border-blue-800/50 p-2 text-xs text-blue-700 dark:text-blue-400 text-center font-medium">
                Successfully parsed {rows.length.toLocaleString()} rows. Rendering via virtualized table.
            </div>
            
            <div className="flex-1 overflow-auto" ref={parentRef}>
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
                        {paddingTop > 0 && (
                            <tr><td style={{ height: `${paddingTop}px` }} colSpan={headers.length + 1} /></tr>
                        )}
                        {virtualRows.map((virtualRow) => {
                            const row = rows[virtualRow.index];
                            return (
                                <tr 
                                    key={virtualRow.key} 
                                    data-index={virtualRow.index} 
                                    ref={rowVirtualizer.measureElement}
                                    className="hover:bg-blue-50/50 dark:hover:bg-slate-800/80 transition-colors"
                                >
                                    <td className="px-4 py-2 border-r border-gray-200 dark:border-slate-800 text-center text-gray-400 dark:text-slate-500 font-mono text-xs">
                                        {virtualRow.index + 1}
                                    </td>
                                    {headers.map((header, colIndex) => (
                                        <td 
                                            key={`${virtualRow.index}-${colIndex}`} 
                                            className="px-4 py-2 border-r border-gray-200 dark:border-slate-800 text-gray-700 dark:text-slate-300 whitespace-nowrap overflow-hidden text-ellipsis max-w-xs"
                                            title={row[header] || ''}
                                        >
                                            {row[header] || <span className="text-gray-300 dark:text-slate-600 italic">empty</span>}
                                        </td>
                                    ))}
                                </tr>
                            );
                        })}
                        {paddingBottom > 0 && (
                            <tr><td style={{ height: `${paddingBottom}px` }} colSpan={headers.length + 1} /></tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
