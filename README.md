Developer - Muhammad Ali Zahid

# Excel Filter & Export Tool

A production-ready web application for uploading, filtering, and exporting Excel data in multiple formats.

## Features

- **Universal Excel Support** — Upload `.xlsx` and `.xls` files up to 20MB
- **Dynamic Column Detection** — Automatically detects and displays all column headers
- **Advanced Filtering** — Filter rows by one or multiple columns with:
  - Contains / Exact match modes
  - Optional case sensitivity
- **Multi-Format Export** — Choose from:
  - **CSV** — Comma-separated values (using json2csv)
  - **XLSX** — Excel workbook format
  - **VCF** — vCard contacts (with optional name prefix/suffix)
- **Live Preview** — See filtered results before export (first 10 rows + total count)
- **Responsive Design** — Works on desktop, tablet, and mobile
- **Zero Dependencies on External Services** — No database, no authentication, no third-party APIs

## Tech Stack

- **Framework**: Next.js 14 (App Router)
- **UI**: React 18 + Tailwind CSS
- **Excel Processing**: XLSX (SheetJS)
- **CSV Export**: json2csv
- **Styling**: Tailwind CSS with custom components
- **Deployment**: Vercel-ready

## Installation

### Prerequisites

- Node.js 18+ (LTS recommended)
- npm or yarn

### Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd "Excel Automation Tool"
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run development server**
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser

## Usage

### Workflow

1. **Upload** — Drag and drop or click to upload an Excel file
2. **Configure Filter** (optional)
   - Select filter columns
   - Enter filter value
   - Choose match type (Contains / Exact match)
   - Toggle case sensitivity
3. **Preview** — Click "Preview results" to see matched rows
4. **Select Export Columns** — Choose which columns to include
5. **Choose Format** — Select CSV, XLSX, or VCF
6. **Export** — Download the processed file

### VCF-Specific Options

When exporting as VCF:
- Select phone number columns
- Optionally add a **Name Prefix** (e.g., `Dr.`, `Mr.`)
- Optionally add a **Name Suffix** (e.g., `Jr.`, `Ltd.`)
- One contact per phone number per row

Example output:
```
BEGIN:VCARD
VERSION:3.0
FN:Dr. John Smith Jr.
TEL;TYPE=CELL:555-1234
END:VCARD
```

## Project Structure

```
Excel Automation Tool/
├── app/
│   ├── api/
│   │   ├── headers/
│   │   │   └── route.js          # Parse Excel, extract headers
│   │   └── process/
│   │       └── route.js          # Filter rows, generate exports
│   ├── components/
│   │   ├── FileUpload.jsx        # Drag-and-drop file input
│   │   ├── HeaderSelector.jsx    # Searchable multi-select dropdown
│   │   ├── FilterSection.jsx     # Filter configuration UI
│   │   ├── ExportSection.jsx     # Export options and format selector
│   │   └── ResultPreview.jsx     # Results table with skeleton loading
│   ├── globals.css               # Tailwind + custom component library
│   ├── layout.jsx                # Root layout
│   └── page.jsx                  # Main application page
├── .gitignore
├── .env.example
├── next.config.js
├── package.json
├── postcss.config.js
├── tailwind.config.js
└── README.md
```

## API Endpoints

### `POST /api/headers`

Extract column headers from an Excel file.

**Request:**
```
Content-Type: multipart/form-data
- file: File (.xlsx or .xls)
```

**Response:**
```json
{
  "headers": ["Name", "Email", "Phone", "Company"]
}
```

### `POST /api/process`

Filter rows and export in selected format.

**Request:**
```
Content-Type: multipart/form-data
- file: File (.xlsx or .xls)
- filterColumns: JSON array of column names
- filterValue: String to filter by
- matchType: "contains" or "exact"
- caseSensitive: "true" or "false"
- exportColumns: JSON array of columns to export
- format: "csv", "xlsx", or "vcf"
- vcfPrefix: Optional name prefix (VCF only)
- vcfSuffix: Optional name suffix (VCF only)
- previewOnly: "true" for preview, omit for actual export
```

**Response (Preview):**
```json
{
  "rows": [
    { "Name": "John Doe", "Email": "john@example.com" },
    { "Name": "Jane Smith", "Email": "jane@example.com" }
  ],
  "total": 42
}
```

**Response (Export):**
- CSV: `text/csv` with attachment header
- XLSX: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`
- VCF: `text/vcard` with attachment header

## Available Scripts

```bash
# Development server (localhost:3000)
npm run dev

# Production build
npm run build

# Start production server
npm start

# Run ESLint
npm run lint
```

## Configuration

### Environment Variables

Create a `.env.local` file for local development (optional):

```env
# No required environment variables
# The app works completely standalone
```

### Tailwind CSS

Customization available in `tailwind.config.js`:
- Extended color palette
- Font family configuration
- Spacing scale

### Next.js

Configuration in `next.config.js`:
- Server component external packages
- Build optimization

## Edge Cases Handled

- ✅ Empty Excel files
- ✅ Files with no headers
- ✅ No rows matching filter criteria
- ✅ Large files (≤20MB)
- ✅ No export columns selected (uses all columns)
- ✅ VCF selected without phone columns (validation error)
- ✅ Invalid file types (`.xlsx`, `.xls` only)
- ✅ Duplicate phone numbers in one row (generates multiple vCards)

## Design Principles

- **Minimal & Modern** — SaaS-style interface
- **Production-Ready** — Not a demo or prototype
- **Accessible** — Keyboard navigation, ARIA labels
- **Responsive** — Mobile-first, works at all breakpoints
- **Fast** — Optimized bundle, no unnecessary dependencies
- **Professional** — No AI-generated styling, clean typography

## Performance

- Build size: ~94KB First Load JS
- API routes: Dynamic rendering, no unnecessary computation
- Client components: React 18 optimizations
- File handling: Streaming FormData parsing

## Deployment

### Deploy to Vercel (Recommended)

1. **Push to GitHub**
   ```bash
   git push origin main
   ```

2. **Connect to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Import the repository
   - No environment variables needed
   - Click "Deploy"

### Deploy Elsewhere

The app is a standard Next.js 14 project. To deploy to other platforms:

```bash
npm run build
npm start
```

Then deploy the `.next/` folder according to your platform's requirements.

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers (iOS Safari, Chrome Mobile)

## Known Limitations

- Maximum file size: 20MB
- Single sheet processing (uses first sheet if multiple exist)
- VCF exports basic vCard 3.0 format (FN, TEL only)

## Troubleshooting

### File upload fails
- Check file is valid `.xlsx` or `.xls`
- Verify file size is under 20MB
- Ensure file isn't corrupted (try exporting fresh from Excel)

### Preview shows no results
- Verify filter value matches your data
- Try "Contains" mode instead of "Exact match"
- Check case sensitivity setting

### VCF export shows validation error
- Select at least one column for export
- Ensure selected columns are recognized phone fields (e.g., "Phone", "Mobile", "Tel")

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT License — Feel free to use commercially.

## Support

For issues, questions, or suggestions, please open an issue in the repository.

---

**Version 1.0.0** | Built with Next.js 14 | Last updated February 26, 2026
