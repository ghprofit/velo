/**
 * Export table data to CSV format
 */
export const exportToCSV = (data: Record<string, unknown>[], filename: string) => {
  if (!data || data.length === 0) {
    alert('No data to export');
    return;
  }

  // Get headers from first data object
  const headers = Object.keys(data[0]);
  const csvHeaders = headers.join(',');

  // Convert data to CSV rows
  const csvRows = data.map((row) => {
    return headers.map((header) => {
      const value = row[header];
      // Escape values that contain commas or quotes
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(',');
  });

  // Combine headers and rows
  const csv = [csvHeaders, ...csvRows].join('\n');

  // Create blob and download
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename}_${new Date().toISOString().split('T')[0]}.csv`;
  link.click();
  URL.revokeObjectURL(url);
};

/**
 * Export to PDF format
 * Note: This requires jspdf and jspdf-autotable to be installed
 */
export const exportToPDF = async (data: Record<string, unknown>[], filename: string, title: string) => {
  try {
    // Dynamically import jsPDF to reduce bundle size
    const { default: jsPDF } = await import('jspdf');
    const { default: autoTable } = await import('jspdf-autotable');

    if (!data || data.length === 0) {
      alert('No data to export');
      return;
    }

    // Create new PDF document
    const doc = new jsPDF();

    // Add title
    doc.setFontSize(18);
    doc.text(title, 14, 20);

    // Add date
    doc.setFontSize(10);
    const currentDate = new Date().toLocaleDateString();
    doc.text(`Generated on: ${currentDate}`, 14, 28);

    // Get headers and rows
    const headers = Object.keys(data[0]);
    const rows = data.map((row) => headers.map((header) => String(row[header] ?? '')));

    // Add table
    autoTable(doc, {
      head: [headers],
      body: rows,
      startY: 35,
      theme: 'grid',
      styles: { fontSize: 8 },
      headStyles: { fillColor: [99, 102, 241] }, // Indigo color
    });

    // Save PDF
    doc.save(`${filename}_${new Date().toISOString().split('T')[0]}.pdf`);
  } catch (error) {
    console.error('Error exporting to PDF:', error);
    alert('Failed to export to PDF. Please make sure jspdf is installed.');
  }
};
