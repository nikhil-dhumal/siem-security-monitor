import React, { useMemo } from 'react';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const AlertTable = ({ alerts }) => {
  const data = useMemo(
    () => alerts.map((alert) => {
      const timestamp = alert.timestamp || alert.triggered_at || alert.created_at;
      return {
        time: timestamp ? new Date(timestamp).toLocaleString() : '—',
        rule: alert.rule || alert.rule_name || '—',
        severity: alert.severity || 'medium',
        description: alert.description || '—',
      };
    }),
    [alerts]
  );

  const columns = useMemo(
    () => [
      { header: 'Time', accessorKey: 'time' },
      { header: 'Rule', accessorKey: 'rule' },
      { header: 'Severity', accessorKey: 'severity' },
      { header: 'Description', accessorKey: 'description' },
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
                <th key={header.id} className="px-4 py-2 font-medium text-gray-600 text-xs uppercase tracking-wider">
                  {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody>
          {table.getRowModel().rows.length === 0 ? (
            <tr className="h-12">
              <td colSpan={4} className="px-4 py-3 text-gray-400 text-center text-sm">
                No alerts yet
              </td>
            </tr>
          ) : (
            table.getRowModel().rows.map((row) => {
              const severity = row.original.severity.toLowerCase();
              const severityColorClass =
                severity === 'high' || severity === 'critical'
                  ? 'text-red-600'
                  : severity === 'medium'
                  ? 'text-amber-600'
                  : 'text-green-600';
              return (
                <tr key={row.id} className="h-12 border-b border-gray-100 hover:bg-gray-50">
                  {row.getVisibleCells().map((cell) => (
                    <td
                      key={cell.id}
                      className={`px-4 py-2 text-sm truncate ${
                        cell.column.id === 'severity'
                          ? `font-semibold ${severityColorClass}`
                          : 'text-gray-700'
                      }`}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              );
            })
          )}
        </tbody>
        </table>
      </div>
    </div>
  );
};

export default React.memo(AlertTable);
