import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { Parser as Json2CsvParser } from 'json2csv';

export const dynamic = 'force-dynamic';

function applyFilter(rows, filterColumns, filterValue, matchType, caseSensitive) {
  if (!filterColumns || filterColumns.length === 0 || filterValue === '') {
    return rows;
  }

  return rows.filter((row) => {
    return filterColumns.some((col) => {
      const cellValue = String(row[col] ?? '');
      const a = caseSensitive ? cellValue : cellValue.toLowerCase();
      const b = caseSensitive ? filterValue : filterValue.toLowerCase();

      if (matchType === 'exact') {
        return a === b;
      }
      return a.includes(b);
    });
  });
}

function pickColumns(rows, exportColumns) {
  return rows.map((row) => {
    const picked = {};
    exportColumns.forEach((col) => {
      picked[col] = row[col] ?? '';
    });
    return picked;
  });
}

function buildVcf(rows, phoneColumns, prefix, suffix) {
  const entries = [];
  const pre = prefix ? `${prefix.trim()} ` : '';
  const suf = suffix ? ` ${suffix.trim()}` : '';

  rows.forEach((row, index) => {
    const nameKeys = Object.keys(row).filter((k) =>
      /name|full.?name|contact/i.test(k)
    );
    const baseName =
      nameKeys.length > 0 && String(row[nameKeys[0]]).trim()
        ? String(row[nameKeys[0]]).trim()
        : `Contact${index + 1}`;

    const nameValue = `${pre}${baseName}${suf}`;

    phoneColumns.forEach((phoneCol) => {
      const phone = String(row[phoneCol] ?? '').trim();
      if (!phone) return;

      entries.push(
        [
          'BEGIN:VCARD',
          'VERSION:3.0',
          `FN:${nameValue}`,
          `TEL;TYPE=CELL:${phone}`,
          'END:VCARD',
        ].join('\r\n')
      );
    });
  });

  return entries.join('\r\n');
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file');

    if (!file) {
      return NextResponse.json({ error: 'No file provided.' }, { status: 400 });
    }

    const filename = file.name || '';
    const ext = filename.split('.').pop().toLowerCase();

    if (!['xlsx', 'xls'].includes(ext)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only .xlsx and .xls files are supported.' },
        { status: 400 }
      );
    }

    let filterColumns = [];
    let exportColumns = [];

    try {
      filterColumns = JSON.parse(formData.get('filterColumns') || '[]');
      exportColumns = JSON.parse(formData.get('exportColumns') || '[]');
    } catch {
      return NextResponse.json({ error: 'Invalid column selection data.' }, { status: 400 });
    }

    const filterValue = formData.get('filterValue') || '';
    const matchType = formData.get('matchType') || 'contains';
    const caseSensitive = formData.get('caseSensitive') === 'true';
    const format = formData.get('format') || 'csv';
    const vcfPrefix = formData.get('vcfPrefix') || '';
    const vcfSuffix = formData.get('vcfSuffix') || '';
    const previewOnly = formData.get('previewOnly') === 'true';

    if (!previewOnly && (!Array.isArray(exportColumns) || exportColumns.length === 0)) {
      return NextResponse.json({ error: 'No export columns selected.' }, { status: 400 });
    }

    if (!['csv', 'xlsx', 'vcf'].includes(format)) {
      return NextResponse.json({ error: 'Invalid export format.' }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      return NextResponse.json(
        { error: 'Could not parse the file. The file may be corrupted.' },
        { status: 422 }
      );
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: 'The file contains no sheets.' }, { status: 422 });
    }

    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const allRows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!allRows || allRows.length === 0) {
      return NextResponse.json(
        previewOnly ? { rows: [], total: 0 } : { error: 'The file is empty.' },
        { status: previewOnly ? 200 : 422 }
      );
    }

    const sheetHeaders = Object.keys(allRows[0]);

    const invalidFilterCols = filterColumns.filter((c) => !sheetHeaders.includes(c));
    const invalidExportCols = exportColumns.filter((c) => !sheetHeaders.includes(c));

    if (invalidFilterCols.length > 0) {
      return NextResponse.json(
        { error: `Filter column(s) not found in file: ${invalidFilterCols.join(', ')}` },
        { status: 400 }
      );
    }

    if (invalidExportCols.length > 0) {
      return NextResponse.json(
        { error: `Export column(s) not found in file: ${invalidExportCols.join(', ')}` },
        { status: 400 }
      );
    }

    const filteredRows = applyFilter(allRows, filterColumns, filterValue, matchType, caseSensitive);

    if (previewOnly) {
      const previewCols = exportColumns.length > 0 ? exportColumns : sheetHeaders;
      const previewData = pickColumns(filteredRows.slice(0, 10), previewCols);
      return NextResponse.json({ rows: previewData, total: filteredRows.length });
    }

    if (filteredRows.length === 0) {
      return NextResponse.json({ error: 'No rows matched the filter criteria.' }, { status: 422 });
    }

    if (format === 'vcf') {
      const phoneColumns = exportColumns;
      const baseFileName = filename.replace(/\.[^.]+$/, '');
      const vcfContent = buildVcf(filteredRows, phoneColumns, vcfPrefix, vcfSuffix);

      return new NextResponse(vcfContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/vcard; charset=utf-8',
          'Content-Disposition': `attachment; filename="${baseFileName}_export.vcf"`,
        },
      });
    }

    const exportRows = pickColumns(filteredRows, exportColumns);

    if (format === 'csv') {
      let csvContent;
      try {
        const parser = new Json2CsvParser({ fields: exportColumns });
        csvContent = parser.parse(exportRows);
      } catch {
        return NextResponse.json({ error: 'Failed to generate CSV output.' }, { status: 500 });
      }

      const baseFileName = filename.replace(/\.[^.]+$/, '');
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${baseFileName}_export.csv"`,
        },
      });
    }

    if (format === 'xlsx') {
      const newWorkbook = XLSX.utils.book_new();
      const newSheet = XLSX.utils.json_to_sheet(exportRows, { header: exportColumns });
      XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Export');

      const outputBuffer = XLSX.write(newWorkbook, { type: 'buffer', bookType: 'xlsx' });
      const baseFileName = filename.replace(/\.[^.]+$/, '');

      return new NextResponse(outputBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
          'Content-Disposition': `attachment; filename="${baseFileName}_export.xlsx"`,
        },
      });
    }

    return NextResponse.json({ error: 'Unhandled export format.' }, { status: 500 });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred during processing.' },
      { status: 500 }
    );
  }
}
