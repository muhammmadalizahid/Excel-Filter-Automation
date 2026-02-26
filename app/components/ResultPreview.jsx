'use client';

function SkeletonRow({ cols }) {
  return (
    <tr>
      {Array.from({ length: cols }).map((_, i) => (
        <td key={i} className="px-4 py-2.5">
          <div className="h-3 bg-slate-100 rounded animate-pulse" style={{ width: `${60 + (i * 17) % 40}%` }} />
        </td>
      ))}
    </tr>
  );
}

export default function ResultPreview({
  rows,
  totalMatches,
  error,
  isLoading,
  exportColumns,
  headers,
}) {
  const displayColumns =
    exportColumns && exportColumns.length > 0 ? exportColumns : headers;

  const hasData = rows && rows.length > 0;

  return (
    <div className="card overflow-hidden">
      {/* Header */}
      <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
        <p className="section-title">Preview</p>
        {totalMatches !== null && !isLoading && (
          <span
            className={[
              'text-xs font-medium px-2.5 py-1 rounded-full',
              totalMatches === 0
                ? 'bg-red-50 text-red-600'
                : 'bg-green-50 text-green-700',
            ].join(' ')}
          >
            {totalMatches === 0
              ? 'No matches'
              : `${totalMatches.toLocaleString()} row${totalMatches === 1 ? '' : 's'} matched`}
          </span>
        )}
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="px-5 py-6 text-center">
          <div className="inline-flex items-center gap-2 text-sm text-red-600">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="7" r="6" stroke="#dc2626" strokeWidth="1.3"/>
              <path d="M7 4V7" stroke="#dc2626" strokeWidth="1.3" strokeLinecap="round"/>
              <circle cx="7" cy="9.5" r="0.7" fill="#dc2626"/>
            </svg>
            {error}
          </div>
        </div>
      )}

      {/* Loading skeleton */}
      {isLoading && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-100">
                {(displayColumns.length > 0 ? displayColumns : Array.from({ length: 4 })).map((col, i) => (
                  <th
                    key={i}
                    className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                  >
                    {col || <div className="h-3 w-16 bg-slate-200 rounded animate-pulse" />}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {Array.from({ length: 5 }).map((_, i) => (
                <SkeletonRow key={i} cols={displayColumns.length || 4} />
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !error && totalMatches === 0 && (
        <div className="px-5 py-10 text-center">
          <p className="text-sm font-medium text-slate-700 mb-1">No rows matched</p>
          <p className="text-xs text-slate-400">
            Try adjusting your filter criteria or clearing the filter value.
          </p>
        </div>
      )}

      {/* Data table */}
      {!isLoading && !error && hasData && (
        <>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100">
                  {displayColumns.map((col) => (
                    <th
                      key={col}
                      className="px-4 py-2.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wide whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {rows.map((row, rowIdx) => (
                  <tr
                    key={rowIdx}
                    className="hover:bg-slate-50 transition-colors"
                  >
                    {displayColumns.map((col) => (
                      <td
                        key={col}
                        className="px-4 py-2.5 text-slate-700 whitespace-nowrap max-w-[200px] overflow-hidden text-ellipsis"
                        title={String(row[col] ?? '')}
                      >
                        {String(row[col] ?? '') || (
                          <span className="text-slate-300">—</span>
                        )}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalMatches > rows.length && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-xs text-slate-400">
                Showing {rows.length} of {totalMatches.toLocaleString()} matched rows. Export to see all data.
              </p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
