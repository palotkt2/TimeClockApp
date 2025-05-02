import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ExportService {
  exportToCSV(data: any[], filename: string) {
    const processedData = data.map((item) => {
      const processed = { ...item };

      // Add day name if there's a date field
      if (processed.date) {
        const date = new Date(processed.date);
        processed.dayName = this.getDayName(date);
      }

      return processed;
    });

    // Update headers to include day name
    const headers = this.getHeaders(processedData[0]);

    // Logic for CSV generation and file download
    const csvContent = this.generateCSVContent(processedData, headers);
    this.downloadCSV(csvContent, filename);
  }

  private getDayName(date: Date): string {
    const days = [
      'Sunday',
      'Monday',
      'Tuesday',
      'Wednesday',
      'Thursday',
      'Friday',
      'Saturday',
    ];
    return days[date.getDay()];
  }

  private getHeaders(item: any): string[] {
    const headers = Object.keys(item);
    return headers;
  }

  private generateCSVContent(data: any[], headers: string[]): string {
    const csvRows = [];
    csvRows.push(headers.join(','));

    data.forEach((item) => {
      const row = headers.map((header) => item[header] ?? '').join(',');
      csvRows.push(row);
    });

    return csvRows.join('\n');
  }

  private downloadCSV(content: string, filename: string): void {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);

    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
}
