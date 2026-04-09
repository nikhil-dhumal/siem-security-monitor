import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const LogTable = ({ logs }) => {
  const data = useMemo(
    () => logs.map((log) => ({
      time: log.timestamp ? new Date(log.timestamp).toLocaleTimeString() : '—',
      host: log.host || log.src_ip || '—',
      category: log.category || '—',
      event: log.event_type || '—',
      source: log.src_ip || '—',
      outcome: log.outcome || 'unknown',
    })),
    [logs]
  );

  const columns = useMemo(
    () => [
      { header: 'Time', accessorKey: 'time', size: 120 },
      { header: 'Host', accessorKey: 'host', size: 100 },
      { header: 'Category', accessorKey: 'category', size: 100 },
      { header: 'Event', accessorKey: 'event', size: 120 },
      { header: 'Source IP', accessorKey: 'source', size: 120 },
      { header: 'Outcome', accessorKey: 'outcome', size: 100 },
    ],
    []
  );

  const table = useReactTable({ data, columns, getCoreRowModel: getCoreRowModel() });

  return (
    <div className="flex-1 min-h-0 overflow-auto flex flex-col">
      <div className="min-w-full overflow-x-auto">
        <table className="min-w-full text-left text-sm">
        <thead className="sticky top-0 bg-white z-10 border-b border-gray-100">
          {table.getHeaderGroups().map((headerGroup) => (
            <tr key={headerGroup.id}>
              {headerGroup.headers.map((header) => (
                <th key={header.id} className="px-3 py-2 font-medium text-gray-600 text-xs uppercase tracking-wider whitespace-nowrap">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr className="h-12">
              <td colSpan={6} className="px-4 py-3 text-gray-400 text-center text-sm">
                No logs yet
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="h-11 border-b border-gray-100 hover:bg-gray-50">
                {row.getVisibleCells().map((cell) => {
                  const isOutcome = cell.column.id === 'outcome';
                  const outcomeColor = isOutcome
                    ? cell.getValue() === 'success' || cell.getValue() === 'allowed'
                      ? 'text-green-600'
                      : cell.getValue() === 'failure' || cell.getValue() === 'blocked'
                      ? 'text-red-600'
                      : 'text-gray-600'
                    : 'text-gray-700';
                  return (
                    <td
                      key={cell.id}
                      className={`px-3 py-2 text-xs truncate font-medium ${outcomeColor}`}
                      title={cell.getValue()}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  );
                })}
              </tr>
            ))
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(LogTable);
