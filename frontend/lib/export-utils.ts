import ExcelJS from 'exceljs';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import Papa from 'papaparse';
import { format } from 'date-fns';

export interface ColumnDefinition {
  header: string;
  key: string;
  width?: number;
  align?: 'left' | 'center' | 'right';
  format?: 'currency' | 'number' | 'date' | 'text';
}

export interface ExportReportOptions {
  title: string;
  subtitle?: string;
  filename: string;
  columns: ColumnDefinition[];
  data: Record<string, any>[];
  summaryTotals?: Record<string, number | string>;
}

/**
 * Export data to a professional styled Excel (.xlsx) workbook
 * Styled with ConstructCMS brand colors (Safety Orange #EA580C, Dark Steel Slate #1E293B)
 */
export async function exportToStyledExcel(options: ExportReportOptions) {
  const { title, subtitle, filename, columns, data, summaryTotals } = options;
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'ConstructCMS';
  workbook.created = new Date();

  const worksheet = workbook.addWorksheet('Report', {
    views: [{ showGridLines: true }],
  });

  // Set column configurations
  worksheet.columns = columns.map((col) => ({
    key: col.key,
    width: col.width || Math.max(col.header.length + 5, 14),
  }));

  const totalCols = columns.length;

  // 1. Title Banner (Row 1)
  const titleRow = worksheet.addRow([title.toUpperCase()]);
  worksheet.mergeCells(1, 1, 1, totalCols);
  titleRow.height = 32;
  titleRow.getCell(1).font = {
    name: 'Arial',
    size: 14,
    bold: true,
    color: { argb: 'FFFFFFFF' },
  };
  titleRow.getCell(1).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF1E293B' }, // Dark Steel Slate
  };
  titleRow.getCell(1).alignment = {
    vertical: 'middle',
    horizontal: 'center',
  };

  // 2. Subtitle / Metadata (Row 2 & 3)
  const dateStr = format(new Date(), 'MMM dd, yyyy HH:mm');
  
  const metaRow1 = worksheet.addRow([
    subtitle || 'ConstructCMS Enterprise Management Platform',
    ...Array(totalCols - 1).fill(''),
  ]);
  worksheet.mergeCells(2, 1, 2, Math.max(2, Math.floor(totalCols / 2)));
  metaRow1.getCell(1).font = { name: 'Arial', size: 9, italic: true, color: { argb: 'FF64748B' } };

  const metaRow2 = worksheet.addRow([
    `Generated On: ${dateStr}   |   Total Records: ${data.length}`,
    ...Array(totalCols - 1).fill(''),
  ]);
  worksheet.mergeCells(3, 1, 3, totalCols);
  metaRow2.getCell(1).font = { name: 'Arial', size: 9, color: { argb: 'FF64748B' } };

  // Empty Spacer Row (Row 4)
  worksheet.addRow([]);

  // 3. Table Header Row (Row 5)
  const headerRow = worksheet.addRow(columns.map((c) => c.header));
  headerRow.height = 24;
  headerRow.eachCell((cell, colNumber) => {
    cell.font = {
      name: 'Arial',
      size: 10,
      bold: true,
      color: { argb: 'FFFFFFFF' },
    };
    cell.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFEA580C' }, // Construction Safety Orange
    };
    cell.alignment = {
      vertical: 'middle',
      horizontal: columns[colNumber - 1]?.align || 'left',
    };
    cell.border = {
      top: { style: 'thin', color: { argb: 'FFC2410C' } },
      bottom: { style: 'medium', color: { argb: 'FFC2410C' } },
      left: { style: 'thin', color: { argb: 'FFEA580C' } },
      right: { style: 'thin', color: { argb: 'FFEA580C' } },
    };
  });

  // 4. Data Rows
  data.forEach((item, index) => {
    const rowValues = columns.map((col) => item[col.key] ?? '');
    const row = worksheet.addRow(rowValues);
    row.height = 20;

    const isEven = index % 2 === 0;
    const bgColor = isEven ? 'FFFFFFFF' : 'FFF8FAFC'; // Clean zebra striping

    row.eachCell((cell, colNumber) => {
      const colDef = columns[colNumber - 1];
      cell.font = { name: 'Arial', size: 9.5, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: bgColor },
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colDef?.align || 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        bottom: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };

      if (colDef?.format === 'currency' && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00 "ETB"';
      } else if (colDef?.format === 'number' && typeof cell.value === 'number') {
        cell.numFmt = '#,##0.00';
      }
    });
  });

  // 5. Totals / Summary Row (if provided)
  if (summaryTotals) {
    const summaryRowValues = columns.map((col, idx) => {
      if (idx === 0) return 'TOTAL / SUMMARY';
      return summaryTotals[col.key] ?? '';
    });
    const summaryRow = worksheet.addRow(summaryRowValues);
    summaryRow.height = 22;
    summaryRow.eachCell((cell, colNumber) => {
      const colDef = columns[colNumber - 1];
      cell.font = { name: 'Arial', size: 10, bold: true, color: { argb: 'FF0F172A' } };
      cell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFFF7ED' }, // Soft orange highlight
      };
      cell.alignment = {
        vertical: 'middle',
        horizontal: colDef?.align || 'left',
      };
      cell.border = {
        top: { style: 'thin', color: { argb: 'FFEA580C' } },
        bottom: { style: 'double', color: { argb: 'FFEA580C' } },
        left: { style: 'thin', color: { argb: 'FFE2E8F0' } },
        right: { style: 'thin', color: { argb: 'FFE2E8F0' } },
      };
    });
  }

  // 6. Generate and download buffer
  const buffer = await workbook.xlsx.writeBuffer();
  const blob = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.xlsx`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Export data to a professional styled PDF report with ConstructCMS branding
 */
export function exportToStyledPdf(options: ExportReportOptions) {
  const { title, subtitle, filename, columns, data } = options;
  const doc = new jsPDF({
    orientation: columns.length > 6 ? 'landscape' : 'portrait',
    unit: 'mm',
    format: 'a4',
  });

  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Top Brand Banner Bar
  doc.setFillColor(30, 41, 59); // Dark Steel Slate (#1E293B)
  doc.rect(0, 0, pageWidth, 18, 'F');

  // Brand Accent Line
  doc.setFillColor(234, 88, 12); // Construction Safety Orange (#EA580C)
  doc.rect(0, 18, pageWidth, 2, 'F');

  // Title Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(12);
  doc.setFont('helvetica', 'bold');
  doc.text('CONSTRUCT CMS', 14, 11);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text(title.toUpperCase(), pageWidth - 14, 11, { align: 'right' });

  // 2. Metadata Section
  doc.setTextColor(15, 23, 42);
  doc.setFontSize(14);
  doc.setFont('helvetica', 'bold');
  doc.text(title, 14, 28);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(100, 116, 139);
  const dateStr = format(new Date(), 'MMM dd, yyyy HH:mm');
  doc.text(subtitle || 'Construction Management Platform Report', 14, 34);
  doc.text(`Generated: ${dateStr}   |   Records: ${data.length}`, 14, 39);

  // 3. AutoTable Data
  const head = [columns.map((c) => c.header)];
  const body = data.map((item) => columns.map((col) => String(item[col.key] ?? '—')));

  autoTable(doc, {
    head: head,
    body: body,
    startY: 44,
    theme: 'grid',
    styles: {
      fontSize: 8,
      cellPadding: 2.5,
      textColor: [15, 23, 42],
      lineColor: [226, 232, 240],
      lineWidth: 0.2,
    },
    headStyles: {
      fillColor: [234, 88, 12], // Construction Safety Orange (#EA580C)
      textColor: [255, 255, 255],
      fontStyle: 'bold',
      halign: 'left',
    },
    alternateRowStyles: {
      fillColor: [248, 250, 252], // #F8FAFC
    },
    didDrawPage: (data) => {
      // Footer page numbering
      const str = `Page ${data.pageNumber} of ${doc.getNumberOfPages()}`;
      doc.setFontSize(8);
      doc.setTextColor(148, 163, 184);
      doc.text(str, pageWidth - 14, doc.internal.pageSize.getHeight() - 8, { align: 'right' });
      doc.text('ConstructCMS — Confidential Project Record', 14, doc.internal.pageSize.getHeight() - 8);
    },
  });

  doc.save(`${filename}.pdf`);
}

/**
 * Standard CSV export helper
 */
export function exportToCsv<T>(data: T[], filename: string) {
  const csv = Papa.unparse(data as any);
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);
  link.setAttribute('href', url);
  link.setAttribute('download', `${filename}.csv`);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
