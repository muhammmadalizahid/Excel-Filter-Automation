import { NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export const dynamic = 'force-dynamic';

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

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    let workbook;
    try {
      workbook = XLSX.read(buffer, { type: 'buffer' });
    } catch {
      return NextResponse.json(
        { error: 'Could not parse the file. The file may be corrupted or in an unsupported format.' },
        { status: 422 }
      );
    }

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      return NextResponse.json({ error: 'The file contains no sheets.' }, { status: 422 });
    }

    const firstSheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[firstSheetName];

    const rows = XLSX.utils.sheet_to_json(sheet, { defval: '' });

    if (!rows || rows.length === 0) {
      return NextResponse.json({ error: 'The sheet appears to be empty or has no data rows.' }, { status: 422 });
    }

    const headers = Object.keys(rows[0]);

    if (headers.length === 0) {
      return NextResponse.json({ error: 'No column headers could be detected.' }, { status: 422 });
    }

    return NextResponse.json({ headers });
  } catch {
    return NextResponse.json(
      { error: 'An unexpected error occurred while reading the file.' },
      { status: 500 }
    );
  }
}
