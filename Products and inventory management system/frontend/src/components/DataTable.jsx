import React from 'react';

const DataTable = ({ columns, data, loading, emptyIcon, emptyMessage, emptySubMessage }) => {
  return (
    <div className="overflow-x-auto flex-1">
      <table className="w-full text-left text-sm text-slate-600">
        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 sticky top-0">
          <tr>
            {columns.map((col, i) => (
              <th key={i} className={`px-6 py-4 font-medium ${col.headerClassName || ''}`}>
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {loading ? (
            Array(5).fill(0).map((_, idx) => (
              <tr key={idx} className="animate-pulse">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                    <div className={`h-4 bg-slate-200 rounded ${colIdx === columns.length - 1 ? 'w-16 ml-auto' : 'w-3/4'}`}></div>
                  </td>
                ))}
              </tr>
            ))
          ) : data.length > 0 ? (
            data.map((row, rowIdx) => (
              <tr key={row.id || rowIdx} className="hover:bg-slate-50 transition-colors">
                {columns.map((col, colIdx) => (
                  <td key={colIdx} className={`px-6 py-4 ${col.className || ''}`}>
                    {typeof col.accessor === 'function' ? col.accessor(row) : row[col.accessor]}
                  </td>
                ))}
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan={columns.length} className="px-6 py-12 text-center text-slate-500">
                <div className="flex flex-col items-center justify-center">
                  {emptyIcon && React.cloneElement(emptyIcon, { className: "w-12 h-12 text-slate-300 mb-3" })}
                  <p className="font-medium text-slate-600 text-base">{emptyMessage || "No data found."}</p>
                  {emptySubMessage && <p className="text-sm mt-1">{emptySubMessage}</p>}
                </div>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
