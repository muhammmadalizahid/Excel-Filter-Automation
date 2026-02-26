'use client';

import { useState, useCallback } from 'react';
import FileUpload from './components/FileUpload';
import FilterSection from './components/FilterSection';
import ExportSection from './components/ExportSection';
import ResultPreview from './components/ResultPreview';

const initialFilterState = {
  columns: [],
  value: '',
  matchType: 'contains',
  caseSensitive: false,
};

const initialExportState = {
  columns: [],
  format: 'csv',
  vcfPrefix: '',
  vcfSuffix: '',
};

export default function HomePage() {
  const [file, setFile] = useState(null);
  const [headers, setHeaders] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const [filterState, setFilterState] = useState(initialFilterState);
  const [exportState, setExportState] = useState(initialExportState);

  const [previewRows, setPreviewRows] = useState([]);
  const [totalMatches, setTotalMatches] = useState(null);
  const [previewError, setPreviewError] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);

  const [isExporting, setIsExporting] = useState(false);
  const [exportError, setExportError] = useState('');

  const handleFileAccepted = useCallback(async (acceptedFile) => {
    setFile(acceptedFile);
    setHeaders([]);
    setUploadError('');
    setPreviewRows([]);
    setTotalMatches(null);
    setPreviewError('');
    setFilterState(initialFilterState);
    setExportState(initialExportState);
    setIsUploading(true);

    const formData = new FormData();
    formData.append('file', acceptedFile);

    try {
      const res = await fetch('/api/headers', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setUploadError(data.error || 'Failed to read file headers.');
        setFile(null);
        return;
      }

      if (!data.headers || data.headers.length === 0) {
        setUploadError('No column headers were detected in this file.');
        setFile(null);
        return;
      }

      setHeaders(data.headers);
    } catch {
      setUploadError('An unexpected error occurred while reading the file.');
      setFile(null);
    } finally {
      setIsUploading(false);
    }
  }, []);

  const handleReset = useCallback(() => {
    setFile(null);
    setHeaders([]);
    setUploadError('');
    setPreviewRows([]);
    setTotalMatches(null);
    setPreviewError('');
    setFilterState(initialFilterState);
    setExportState(initialExportState);
    setExportError('');
  }, []);

  const buildFormData = useCallback(() => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('filterColumns', JSON.stringify(filterState.columns));
    formData.append('filterValue', filterState.value);
    formData.append('matchType', filterState.matchType);
    formData.append('caseSensitive', String(filterState.caseSensitive));
    formData.append('exportColumns', JSON.stringify(exportState.columns));
    formData.append('format', exportState.format);
    formData.append('vcfPrefix', exportState.vcfPrefix || '');
    formData.append('vcfSuffix', exportState.vcfSuffix || '');
    return formData;
  }, [file, filterState, exportState]);

  const handlePreview = useCallback(async () => {
    if (!file) return;
    setPreviewError('');
    setIsProcessing(true);
    setPreviewRows([]);
    setTotalMatches(null);

    const formData = buildFormData();
    formData.append('previewOnly', 'true');

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        setPreviewError(data.error || 'Failed to process file.');
        return;
      }

      setPreviewRows(data.rows || []);
      setTotalMatches(data.total);
    } catch {
      setPreviewError('An unexpected error occurred while processing.');
    } finally {
      setIsProcessing(false);
    }
  }, [file, buildFormData]);

  const handleExport = useCallback(async () => {
    if (!file) return;
    setExportError('');
    setIsExporting(true);

    const formData = buildFormData();

    try {
      const res = await fetch('/api/process', {
        method: 'POST',
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        setExportError(data.error || 'Export failed.');
        return;
      }

      const contentDisposition = res.headers.get('Content-Disposition');
      let filename = `export.${exportState.format}`;
      if (contentDisposition) {
        const match = contentDisposition.match(/filename="?([^"]+)"?/);
        if (match) filename = match[1];
      }

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      setExportError('An unexpected error occurred during export.');
    } finally {
      setIsExporting(false);
    }
  }, [file, buildFormData, exportState.format]);

  const canExport =
    file &&
    headers.length > 0 &&
    exportState.columns.length > 0 &&
    (exportState.format !== 'vcf' || exportState.columns.length > 0);

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-7 h-7 rounded-md bg-blue-600 flex items-center justify-center">
              <svg width="15" height="15" viewBox="0 0 15 15" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M2 3C2 2.44772 2.44772 2 3 2H9.17157C9.43679 2 9.69114 2.10536 9.87868 2.29289L12.7071 5.12132C12.8946 5.30886 13 5.56321 13 5.82843V12C13 12.5523 12.5523 13 12 13H3C2.44772 13 2 12.5523 2 12V3Z" stroke="white" strokeWidth="1.5"/>
                <path d="M5 7.5H10M5 10H10M5 5H7" stroke="white" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </div>
            <span className="text-sm font-semibold text-slate-900">Excel Filter & Export</span>
          </div>
          {file && (
            <button
              onClick={handleReset}
              className="text-xs font-medium text-slate-500 hover:text-slate-800 transition-colors"
            >
              Start over
            </button>
          )}
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-10">
        {!file || headers.length === 0 ? (
          /* Upload State */
          <div className="max-w-xl mx-auto">
            <div className="text-center mb-8">
              <h1 className="text-2xl font-semibold text-slate-900 mb-2">
                Filter and export Excel data
              </h1>
              <p className="text-sm text-slate-500">
                Upload any .xlsx or .xls file to filter rows and export in CSV, XLSX, or VCF format.
              </p>
            </div>
            <FileUpload
              onFileAccepted={handleFileAccepted}
              isLoading={isUploading}
              error={uploadError}
            />
          </div>
        ) : (
          /* Processing State */
          <div className="space-y-6">
            {/* File info bar */}
            <div className="flex items-center justify-between py-3 px-4 bg-white border border-slate-200 rounded-xl">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-md bg-green-50 border border-green-200 flex items-center justify-center flex-shrink-0">
                  <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M2.5 2C2.5 1.72386 2.72386 1.5 3 1.5H8.37868C8.51 1.5 8.63566 1.55268 8.72855 1.64645L11.3536 4.30355C11.4473 4.39734 11.5 4.52301 11.5 4.65353V12C11.5 12.2761 11.2761 12.5 11 12.5H3C2.72386 12.5 2.5 12.2761 2.5 12V2Z" stroke="#16a34a" strokeWidth="1.2"/>
                    <path d="M4.5 7H9.5M4.5 9H9.5M4.5 5H6.5" stroke="#16a34a" strokeWidth="1.2" strokeLinecap="round"/>
                  </svg>
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-800">{file.name}</p>
                  <p className="text-xs text-slate-400">{headers.length} columns detected</p>
                </div>
              </div>
              <button
                onClick={handleReset}
                className="text-xs font-medium text-slate-400 hover:text-slate-700 transition-colors px-2 py-1 rounded-md hover:bg-slate-100"
              >
                Change file
              </button>
            </div>

            {/* Two-column layout */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              {/* Left: Filter */}
              <FilterSection
                headers={headers}
                filterState={filterState}
                onChange={setFilterState}
                onPreview={handlePreview}
                isProcessing={isProcessing}
              />

              {/* Right: Export */}
              <ExportSection
                headers={headers}
                exportState={exportState}
                onChange={setExportState}
                onExport={handleExport}
                canExport={canExport}
                isExporting={isExporting}
                exportError={exportError}
              />
            </div>

            {/* Preview */}
            {(previewRows.length > 0 || totalMatches !== null || previewError || isProcessing) && (
              <ResultPreview
                rows={previewRows}
                totalMatches={totalMatches}
                error={previewError}
                isLoading={isProcessing}
                exportColumns={exportState.columns}
                headers={headers}
              />
            )}
          </div>
        )}
      </main>
    </div>
  );
}
