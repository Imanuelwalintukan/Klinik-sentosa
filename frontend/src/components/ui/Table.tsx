import React from 'react';
import { motion } from 'framer-motion';
import { staggerContainer, staggerItem, fadeIn } from '../../lib/motion';

export interface Column<T> {
    header: string;
    accessor: keyof T | ((item: T) => React.ReactNode);
    className?: string;
    headerClassName?: string;
}

interface TableProps<T> {
    data: T[];
    columns: Column<T>[];
    keyExtractor: (item: T) => string | number;
    onRowClick?: (item: T) => void;
    loading?: boolean;
}

function TableSkeleton<T>({ columns }: { columns: Column<T>[] }) {
    return (
        <tbody>
            {Array.from({ length: 5 }).map((_, rowIndex) => (
                <tr key={rowIndex} className="animate-pulse">
                    {columns.map((_, colIndex) => (
                        <td key={colIndex} className="px-6 py-4 whitespace-nowrap">
                            <div className="h-4 bg-white/10 rounded w-full"></div>
                        </td>
                    ))}
                </tr>
            ))}
        </tbody>
    );
}

export function Table<T>({ data, columns, keyExtractor, onRowClick, loading }: TableProps<T>) {
    return (
        <motion.div
            className="overflow-x-auto rounded-2xl border border-white/10 shadow-glass bg-bg-card backdrop-blur-md"
            variants={fadeIn}
            initial="initial"
            animate="animate"
        >
            <table className="min-w-full divide-y divide-white/10">
                <thead className="sticky top-0 z-10 bg-bg-card-hover backdrop-blur-lg border-b border-white/10">
                    <tr>
                        {columns.map((col, index) => (
                            <th
                                key={index}
                                className={`px-6 py-4 text-left text-xs font-semibold text-text-muted uppercase tracking-wider ${col.headerClassName || ''}`}
                            >
                                {col.header}
                            </th>
                        ))}
                    </tr>
                </thead>
                {loading ? (
                    <TableSkeleton columns={columns} />
                ) : (
                    <motion.tbody
                        className="divide-y divide-white/10"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                    >
                        {data.length === 0 ? (
                            <motion.tr variants={staggerItem}>
                                <td colSpan={columns.length} className="px-6 py-8 text-center text-text-muted text-sm">
                                    No data available
                                </td>
                            </motion.tr>
                        ) : (
                            data.map((item) => (
                                <motion.tr
                                    key={keyExtractor(item)}
                                    onClick={() => onRowClick?.(item)}
                                    className={onRowClick ? 'cursor-pointer hover:bg-white/5 transition-colors duration-200' : ''}
                                    variants={staggerItem}
                                    whileHover={{ scale: 1.002, backgroundColor: "rgba(255,255,255,0.03)" }}
                                >
                                    {columns.map((col, index) => (
                                        <td key={index} className="px-6 py-4 whitespace-nowrap text-sm text-text-default">
                                            {typeof col.accessor === 'function'
                                                ? col.accessor(item)
                                                : (item[col.accessor] as React.ReactNode)}
                                        </td>
                                    ))}
                                </motion.tr>
                            ))
                        )}
                    </motion.tbody>
                )}
            </table>
        </motion.div>
    );
}
