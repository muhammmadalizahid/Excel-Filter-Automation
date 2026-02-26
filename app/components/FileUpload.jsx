'use client';

import { useCallback, useRef, useState } from 'react';

const ACCEPTED_TYPES = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.ms-excel',
];

const ACCEPTED_EXTENSIONS = ['.xlsx', '.xls'];

function isValidFile(file) {
  const ext = file.name.split('.').pop().toLowerCase();
  return ACCEPTED_EXTENSIONS.includes(`.${ext}`);
}

export default function FileUpload({ onFileAccepted, isLoading, error }) {
  const inputRef = useRef(null);
  const [isDragging, setIsDragging] = useState(false);
  const [localError, setLocalError] = useState('');

  const handleFile = useCallback(
    (file) => {
      setLocalError('');
      if (!file) return;

      if (!isValidFile(file)) {
        setLocalError('Unsupported file type. Please upload a .xlsx or .xls file.');
        return;
      }

      const maxSize = 20 * 1024 * 1024; // 20MB
      if (file.size > maxSize) {
        setLocalError('File is too large. Maximum supported size is 20MB.');
        return;
      }

      onFileAccepted(file);
    },
    [onFileAccepted]
  );

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFile(file);
    },
    [handleFile]
  );

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = useCallback(
    (e) => {
      handleFile(e.target.files[0]);
      e.target.value = '';
    },
    [handleFile]
  );

  const displayError = localError || error;

  return (
    <div>
      <div
        className={[
          'relative border-2 border-dashed rounded-xl p-10 text-center transition-colors duration-150 cursor-pointer',
          isDragging
            ? 'border-blue-400 bg-blue-50'
            : displayError
            ? 'border-red-300 bg-red-50'
            : 'border-slate-300 bg-white hover:border-slate-400 hover:bg-slate-50',
          isLoading ? 'pointer-events-none opacity-60' : '',
        ].join(' ')}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => !isLoading && inputRef.current?.click()}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            inputRef.current?.click();
          }
        }}
        aria-label="Upload Excel file"
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS.join(',')}
          className="hidden"
          onChange={handleInputChange}
          aria-hidden="true"
        />

        <div className="flex flex-col items-center gap-4">
          {isLoading ? (
            <div className="w-10 h-10 rounded-full border-2 border-blue-200 border-t-blue-600 animate-spin" />
          ) : (
            <div
              className={[
                'w-12 h-12 rounded-xl flex items-center justify-center',
                displayError ? 'bg-red-100' : 'bg-slate-100',
              ].join(' ')}
            >
              <svg
                width="22"
                height="22"
                viewBox="0 0 22 22"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M11 14V4M11 4L7 8M11 4L15 8"
                  stroke={displayError ? '#dc2626' : '#64748b'}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M4 17H18"
                  stroke={displayError ? '#dc2626' : '#64748b'}
                  strokeWidth="1.7"
                  strokeLinecap="round"
                />
              </svg>
            </div>
          )}

          <div>
            <p className="text-sm font-medium text-slate-800">
              {isLoading ? 'Reading file headers...' : 'Drop your file here, or click to browse'}
            </p>
            <p className="text-xs text-slate-400 mt-1">Supports .xlsx and .xls up to 20MB</p>
          </div>
        </div>
      </div>

      {displayError && (
        <p className="mt-2 text-xs text-red-600 flex items-center gap-1.5">
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" xmlns="http://www.w3.org/2000/svg">
            <circle cx="6" cy="6" r="5" stroke="#dc2626" strokeWidth="1.2"/>
            <path d="M6 3.5V6.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="8.5" r="0.6" fill="#dc2626"/>
          </svg>
          {displayError}
        </p>
      )}
    </div>
  );
}
