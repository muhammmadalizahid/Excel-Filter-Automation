'use client';

import HeaderSelector from './HeaderSelector';

export default function FilterSection({
  headers,
  filterState,
  onChange,
  onPreview,
  isProcessing,
}) {
  const { columns, value, matchType, caseSensitive } = filterState;

  function update(patch) {
    onChange({ ...filterState, ...patch });
  }

  const canPreview = headers.length > 0;

  return (
    <div className="card p-5 flex flex-col gap-5">
      <div>
        <p className="section-title mb-4">Filter Rows</p>

        {/* Filter columns */}
        <div className="mb-4">
          <label className="label">Filter by column(s)</label>
          <HeaderSelector
            headers={headers}
            selected={columns}
            onChange={(val) => update({ columns: val })}
            placeholder="Any column (no filter)"
          />
          <p className="text-xs text-slate-400 mt-1.5">
            Leave empty to include all rows.
          </p>
        </div>

        {/* Filter value */}
        <div className="mb-4">
          <label className="label" htmlFor="filter-value">
            Filter value
          </label>
          <input
            id="filter-value"
            type="text"
            className="input-base"
            placeholder="Enter a value to filter by..."
            value={value}
            onChange={(e) => update({ value: e.target.value })}
          />
        </div>

        {/* Match type */}
        <div className="mb-4">
          <label className="label">Match type</label>
          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            {[
              { value: 'contains', label: 'Contains' },
              { value: 'exact', label: 'Exact match' },
            ].map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ matchType: opt.value })}
                className={[
                  'px-3 py-1.5 rounded-md text-xs font-medium transition-all duration-150',
                  matchType === opt.value
                    ? 'bg-white text-slate-900 shadow-sm border border-slate-200'
                    : 'text-slate-500 hover:text-slate-700',
                ].join(' ')}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>

        {/* Case sensitivity */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            role="switch"
            aria-checked={caseSensitive}
            onClick={() => update({ caseSensitive: !caseSensitive })}
            className={[
              'relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1',
              caseSensitive ? 'bg-blue-600' : 'bg-slate-200',
            ].join(' ')}
          >
            <span
              className={[
                'inline-block h-3.5 w-3.5 transform rounded-full bg-white shadow transition-transform duration-200',
                caseSensitive ? 'translate-x-4' : 'translate-x-1',
              ].join(' ')}
            />
          </button>
          <label
            className="text-sm text-slate-600 cursor-pointer select-none"
            onClick={() => update({ caseSensitive: !caseSensitive })}
          >
            Case sensitive
          </label>
        </div>
      </div>

      {/* Preview button */}
      <div className="pt-1 border-t border-slate-100">
        <button
          type="button"
          className="btn-secondary w-full"
          onClick={onPreview}
          disabled={!canPreview || isProcessing}
        >
          {isProcessing ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-slate-300 border-t-slate-600 rounded-full animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="7" cy="7" r="5.5" stroke="currentColor" strokeWidth="1.3"/>
                <path d="M5 7H9M7 5V9" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/>
              </svg>
              Preview results
            </>
          )}
        </button>
      </div>
    </div>
  );
}
