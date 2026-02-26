'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

export default function HeaderSelector({
  headers,
  selected,
  onChange,
  placeholder = 'Select columns...',
  disabled = false,
  id,
}) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const containerRef = useRef(null);
  const searchRef = useRef(null);

  const filtered = headers.filter((h) =>
    h.toLowerCase().includes(search.toLowerCase())
  );

  const toggleColumn = useCallback(
    (col) => {
      if (selected.includes(col)) {
        onChange(selected.filter((c) => c !== col));
      } else {
        onChange([...selected, col]);
      }
    },
    [selected, onChange]
  );

  const removeColumn = useCallback(
    (col, e) => {
      e.stopPropagation();
      onChange(selected.filter((c) => c !== col));
    },
    [selected, onChange]
  );

  useEffect(() => {
    function handleClickOutside(e) {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setIsOpen(false);
        setSearch('');
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (isOpen && searchRef.current) {
      searchRef.current.focus();
    }
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative" id={id}>
      {/* Trigger */}
      <div
        className={[
          'min-h-[38px] w-full rounded-lg border bg-white px-3 py-1.5 text-sm cursor-pointer transition-colors duration-150',
          disabled
            ? 'border-slate-200 bg-slate-50 cursor-not-allowed opacity-60'
            : isOpen
            ? 'border-blue-500 ring-2 ring-blue-500'
            : 'border-slate-300 hover:border-slate-400',
        ].join(' ')}
        onClick={() => {
          if (!disabled) setIsOpen((v) => !v);
        }}
        role="combobox"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        tabIndex={disabled ? -1 : 0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            if (!disabled) setIsOpen((v) => !v);
          }
          if (e.key === 'Escape') setIsOpen(false);
        }}
      >
        {selected.length === 0 ? (
          <span className="text-slate-400 text-sm leading-6">{placeholder}</span>
        ) : (
          <div className="flex flex-wrap gap-1 py-0.5">
            {selected.map((col) => (
              <span
                key={col}
                className="inline-flex items-center gap-1 rounded-md bg-blue-50 border border-blue-200 pl-2 pr-1 py-0.5 text-xs font-medium text-blue-700"
              >
                {col}
                <button
                  type="button"
                  onClick={(e) => removeColumn(col, e)}
                  className="rounded hover:bg-blue-100 p-0.5 transition-colors"
                  aria-label={`Remove ${col}`}
                >
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2.5 2.5L7.5 7.5M7.5 2.5L2.5 7.5" stroke="#3b82f6" strokeWidth="1.4" strokeLinecap="round"/>
                  </svg>
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 mt-1 w-full bg-white border border-slate-200 rounded-lg shadow-lg overflow-hidden">
          <div className="p-2 border-b border-slate-100">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search columns..."
              className="w-full text-sm px-2 py-1.5 rounded-md border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-400"
            />
          </div>
          <div className="max-h-52 overflow-y-auto py-1">
            {filtered.length === 0 ? (
              <p className="text-sm text-slate-400 text-center py-4">No columns match your search.</p>
            ) : (
              filtered.map((col) => {
                const isSelected = selected.includes(col);
                return (
                  <div
                    key={col}
                    className={[
                      'flex items-center gap-2.5 px-3 py-2 text-sm cursor-pointer transition-colors',
                      isSelected ? 'bg-blue-50 text-blue-700' : 'text-slate-700 hover:bg-slate-50',
                    ].join(' ')}
                    onClick={() => toggleColumn(col)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <div
                      className={[
                        'w-4 h-4 rounded border flex items-center justify-center flex-shrink-0 transition-colors',
                        isSelected ? 'bg-blue-600 border-blue-600' : 'border-slate-300',
                      ].join(' ')}
                    >
                      {isSelected && (
                        <svg width="9" height="9" viewBox="0 0 9 9" fill="none">
                          <path d="M1.5 4.5L3.5 6.5L7.5 2.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      )}
                    </div>
                    <span className="truncate">{col}</span>
                  </div>
                );
              })
            )}
          </div>
          {headers.length > 0 && (
            <div className="border-t border-slate-100 px-3 py-2 flex gap-2">
              <button
                type="button"
                className="text-xs font-medium text-blue-600 hover:text-blue-700 transition-colors"
                onClick={() => onChange([...headers])}
              >
                Select all
              </button>
              <span className="text-slate-300">·</span>
              <button
                type="button"
                className="text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors"
                onClick={() => onChange([])}
              >
                Clear
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
