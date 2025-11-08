import * as XLSX from 'xlsx';

/**
 * Exporta datos a formato CSV
 */
export function exportToCSV<T extends Record<string, any>>(
  data: T[],
  filename: string,
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Obtener las columnas
  const columns = Object.keys(data[0]) as (keyof T)[];

  // Crear el encabezado CSV
  const headerRow = columns
    .map(col => headers?.[col] || String(col))
    .map(escapeCSVValue)
    .join(',');

  // Crear las filas de datos
  const dataRows = data.map(row =>
    columns
      .map(col => {
        const value = row[col];
        return escapeCSVValue(value);
      })
      .join(',')
  );

  // Combinar todo
  const csvContent = [headerRow, ...dataRows].join('\n');

  // Crear y descargar el archivo
  downloadFile(csvContent, `${filename}.csv`, 'text/csv;charset=utf-8;');
}

/**
 * Exporta datos a formato JSON
 */
export function exportToJSON<T>(data: T, filename: string): void {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    alert('No hay datos para exportar');
    return;
  }

  const jsonContent = JSON.stringify(data, null, 2);
  downloadFile(jsonContent, `${filename}.json`, 'application/json');
}

/**
 * Exporta datos a formato Excel
 */
export function exportToExcel<T extends Record<string, any>>(
  data: T[],
  filename: string,
  sheetName: string = 'Datos',
  headers?: Record<keyof T, string>
): void {
  if (data.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  // Si hay headers personalizados, renombrar las columnas
  let exportData = data;
  if (headers) {
    exportData = data.map(row => {
      const newRow: any = {};
      Object.keys(row).forEach(key => {
        const headerName = headers[key as keyof T] || key;
        newRow[headerName] = row[key];
      });
      return newRow;
    });
  }

  // Crear libro de trabajo
  const worksheet = XLSX.utils.json_to_sheet(exportData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);

  // Descargar archivo
  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Exporta múltiples hojas a un solo archivo Excel
 */
export function exportToExcelMultiSheet(
  sheets: Array<{
    data: any[];
    sheetName: string;
    headers?: Record<string, string>;
  }>,
  filename: string
): void {
  const workbook = XLSX.utils.book_new();

  sheets.forEach(({ data, sheetName, headers }) => {
    if (data.length === 0) return;

    let exportData = data;
    if (headers) {
      exportData = data.map(row => {
        const newRow: any = {};
        Object.keys(row).forEach(key => {
          const headerName = headers[key] || key;
          newRow[headerName] = row[key];
        });
        return newRow;
      });
    }

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    XLSX.utils.book_append_sheet(workbook, worksheet, sheetName);
  });

  if (workbook.SheetNames.length === 0) {
    alert('No hay datos para exportar');
    return;
  }

  XLSX.writeFile(workbook, `${filename}.xlsx`);
}

/**
 * Escapa valores para CSV
 */
function escapeCSVValue(value: any): string {
  if (value === null || value === undefined) {
    return '';
  }

  const stringValue = String(value);

  // Si contiene coma, comillas o salto de línea, envolver en comillas
  if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
    return `"${stringValue.replace(/"/g, '""')}"`;
  }

  return stringValue;
}

/**
 * Descarga un archivo con el contenido dado
 */
function downloadFile(content: string, filename: string, mimeType: string): void {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Formatea fecha para nombre de archivo
 */
export function getTimestampForFilename(): string {
  const now = new Date();
  return now.toISOString().replace(/[:.]/g, '-').slice(0, -5);
}
