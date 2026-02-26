'use client';

import { useMemo } from 'react';
import HeaderSelector from './HeaderSelector';

const PHONE_PATTERN = /phone|tel|mobile|cell|contact.?no|number/i;

const FORMAT_OPTIONS = [
  {
    value: 'csv',
    label: 'CSV',
    description: 'Comma-separated values',
  },
  {
    value: 'xlsx',
    label: 'XLSX',
    description: 'Excel workbook',
  },
  {
    value: 'vcf',
    label: 'VCF',
    description: 'vCard contact file',
  },
];

export default function ExportSection({
  headers,
  exportState,
  onChange,
  onExport,
  canExport,
  isExporting,
  exportError,
}) {
  const { columns, format, vcfPrefix, vcfSuffix } = exportState;

  function update(patch) {
    onChange({ ...exportState, ...patch });
  }

  const detectedPhoneColumns = useMemo(
    () => headers.filter((h) => PHONE_PATTERN.test(h)),
    [headers]
  );

  const vcfValidationError = useMemo(() => {
    if (format !== 'vcf') return null;
    if (columns.length === 0) return 'Select at least one column to use as the phone number.';
    const hasPhone = columns.some(
      (c) => PHONE_PATTERN.test(c)
    );
    if (!hasPhone) {
      return `None of the selected columns appear to contain phone numbers. Detected phone columns: ${
        detectedPhoneColumns.length > 0
          ? detectedPhoneColumns.join(', ')
          : 'none found in this file'
      }.`;
    }
    return null;
  }, [format, columns, detectedPhoneColumns]);

  const exportDisabled =
    !canExport || isExporting || (format === 'vcf' && !!vcfValidationError);

  return (
    <div className="card p-5 flex flex-col gap-5">
      <div>
        <p className="section-title mb-4">Export Options</p>

        {/* Export columns */}
        <div className="mb-4">
          <label className="label">Columns to export</label>
          <HeaderSelector
            headers={headers}
            selected={columns}
            onChange={(val) => update({ columns: val })}
            placeholder="Select columns to include..."
          />
          {columns.length === 0 && (
            <p className="error-text flex items-center gap-1">
              <svg width="11" height="11" viewBox="0 0 11 11" fill="none">
                <circle cx="5.5" cy="5.5" r="4.5" stroke="#dc2626" strokeWidth="1.1"/>
                <path d="M5.5 3V5.5" stroke="#dc2626" strokeWidth="1.1" strokeLinecap="round"/>
                <circle cx="5.5" cy="7.5" r="0.5" fill="#dc2626"/>
              </svg>
              At least one column must be selected for export.
            </p>
          )}
        </div>

        {/* Format selector */}
        <div className="mb-4">
          <label className="label">Export format</label>
          <div className="grid grid-cols-3 gap-2">
            {FORMAT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => update({ format: opt.value })}
                className={[
                  'flex flex-col items-start gap-0.5 rounded-lg border p-3 text-left transition-all duration-150',
                  format === opt.value
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300 hover:bg-slate-50',
                ].join(' ')}
              >
                <span className="text-sm font-semibold">{opt.label}</span>
                <span
                  className={[
                    'text-xs leading-snug',
                    format === opt.value ? 'text-blue-500' : 'text-slate-400',
                  ].join(' ')}
                >
                  {opt.description}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* VCF name prefix / suffix */}
        {format === 'vcf' && (
          <div className="mb-4 grid grid-cols-2 gap-3">
            <div>
              <label className="label" htmlFor="vcf-prefix">Name prefix</label>
              <input
                id="vcf-prefix"
                type="text"
                className="input-base"
                placeholder="e.g. Dr., Mr."
                value={vcfPrefix}
                onChange={(e) => update({ vcfPrefix: e.target.value })}
              />
            </div>
            <div>
              <label className="label" htmlFor="vcf-suffix">Name suffix</label>
              <input
                id="vcf-suffix"
                type="text"
                className="input-base"
                placeholder="e.g. Jr., Ltd."
                value={vcfSuffix}
                onChange={(e) => update({ vcfSuffix: e.target.value })}
              />
            </div>
          </div>
        )}

        {/* VCF-specific info */}
        {format === 'vcf' && (
          <div
            className={[
              'rounded-lg border p-3 text-xs',
              vcfValidationError
                ? 'bg-red-50 border-red-200 text-red-700'
                : 'bg-amber-50 border-amber-200 text-amber-700',
            ].join(' ')}
          >
            {vcfValidationError ? (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#dc2626" strokeWidth="1.2"/>
                  <path d="M6 3.5V6.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="6" cy="8.5" r="0.6" fill="#dc2626"/>
                </svg>
                <span>{vcfValidationError}</span>
              </div>
            ) : (
              <div className="flex items-start gap-2">
                <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
                  <circle cx="6" cy="6" r="5" stroke="#b45309" strokeWidth="1.2"/>
                  <path d="M6 3.5V6" stroke="#b45309" strokeWidth="1.2" strokeLinecap="round"/>
                  <circle cx="6" cy="8" r="0.6" fill="#b45309"/>
                </svg>
                <span>
                  VCF exports one contact per row. Each selected column is used as a phone number field.
                  {detectedPhoneColumns.length > 0 && (
                    <> Detected phone columns: <strong>{detectedPhoneColumns.join(', ')}</strong>.</>
                  )}
                </span>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Export error */}
      {exportError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2.5 text-xs text-red-700 flex items-start gap-2">
          <svg className="flex-shrink-0 mt-0.5" width="12" height="12" viewBox="0 0 12 12" fill="none">
            <circle cx="6" cy="6" r="5" stroke="#dc2626" strokeWidth="1.2"/>
            <path d="M6 3.5V6.5" stroke="#dc2626" strokeWidth="1.2" strokeLinecap="round"/>
            <circle cx="6" cy="8.5" r="0.6" fill="#dc2626"/>
          </svg>
          {exportError}
        </div>
      )}

      {/* Export button */}
      <div className="pt-1 border-t border-slate-100">
        <button
          type="button"
          className="btn-primary w-full"
          onClick={onExport}
          disabled={exportDisabled}
        >
          {isExporting ? (
            <>
              <span className="w-3.5 h-3.5 border-2 border-blue-300 border-t-white rounded-full animate-spin" />
              Exporting...
            </>
          ) : (
            <>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M7 2V9M7 9L4.5 6.5M7 9L9.5 6.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"/>
                <path d="M2.5 11.5H11.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round"/>
              </svg>
              Export as {format.toUpperCase()}
            </>
          )}
        </button>
      </div>
    </div>
  );
}
