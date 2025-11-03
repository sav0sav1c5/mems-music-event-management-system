import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

export interface ReportData {
  title: string;
  dateRange: string;
  summary: {
    totalNegotiations: number;
    activeNegotiations: number;
    completedNegotiations: number;
    totalValue: number;
    averageValue: number;
    successRate: number;
    averageDuration: number;
    conversionRate: number;
  };
  trends: Array<{
    date: string;
    started: number;
    completed: number;
    revenue: number;
    avgDuration: number;
  }>;
  performers: Array<{
    name: string;
    negotiations: number;
    success: number;
    revenue: number;
    avgDuration: number;
  }>;
  events: Array<{
    event: string;
    revenue: number;
    negotiations: number;
    avgValue: number;
  }>;
  phases: Array<{
    phase: string;
    avgDays: number;
    minDays: number;
    maxDays: number;
  }>;
}

export class ReportService {
  private formatCurrency(value: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  }

  private formatDate(date: Date): string {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }

  async generatePDFReport(data: ReportData): Promise<void> {
    const pdf = new jsPDF();
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    let yPosition = 20;

    // Header
    pdf.setFontSize(24);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Analytics Report', pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 15;

    pdf.setFontSize(12);
    pdf.setTextColor(100, 100, 100);
    pdf.text(data.title, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.text(`Generated on ${this.formatDate(new Date())}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 10;
    pdf.text(`Period: ${data.dateRange}`, pageWidth / 2, yPosition, { align: 'center' });
    yPosition += 20;

    // Summary Section
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Executive Summary', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    const summaryData = [
      ['Total Negotiations', data.summary.totalNegotiations.toString()],
      ['Active Negotiations', data.summary.activeNegotiations.toString()],
      ['Completed Negotiations', data.summary.completedNegotiations.toString()],
      ['Total Value', this.formatCurrency(data.summary.totalValue)],
      ['Average Value', this.formatCurrency(data.summary.averageValue)],
      ['Success Rate', `${data.summary.successRate}%`],
      ['Average Duration', `${data.summary.averageDuration} days`],
      ['Conversion Rate', `${data.summary.conversionRate}%`],
    ];

    summaryData.forEach(([label, value]) => {
      pdf.text(`${label}:`, 20, yPosition);
      pdf.text(value, 120, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Top Performers Section
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text('Top Performers', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    data.performers.slice(0, 5).forEach((performer) => {
      const successRate = Math.round((performer.success / performer.negotiations) * 100);
      pdf.text(`${performer.name}:`, 20, yPosition);
      pdf.text(`${performer.success}/${performer.negotiations} (${successRate}%)`, 80, yPosition);
      pdf.text(this.formatCurrency(performer.revenue), 140, yPosition);
      yPosition += 8;
    });

    yPosition += 10;

    // Revenue by Event Section
    if (yPosition > pageHeight - 50) {
      pdf.addPage();
      yPosition = 20;
    }

    pdf.setFontSize(16);
    pdf.text('Revenue by Event', 20, yPosition);
    yPosition += 15;

    pdf.setFontSize(10);
    data.events.forEach((event) => {
      pdf.text(`${event.event}:`, 20, yPosition);
      pdf.text(`${event.negotiations} negotiations`, 80, yPosition);
      pdf.text(this.formatCurrency(event.revenue), 140, yPosition);
      yPosition += 8;
    });

    // Footer
    pdf.setFontSize(8);
    pdf.setTextColor(150, 150, 150);
    pdf.text('Music Event Management System - Analytics Report', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Save the PDF
    pdf.save(`analytics-report-${new Date().toISOString().split('T')[0]}.pdf`);
  }

  async captureChartAsPDF(elementId: string, filename: string): Promise<void> {
    const element = document.getElementById(elementId);
    if (!element) {
      throw new Error(`Element with ID ${elementId} not found`);
    }

    const canvas = await html2canvas(element, {
      backgroundColor: '#1F2937',
      scale: 2,
      logging: false,
    });

    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF();
    const imgWidth = 210;
    const pageHeight = 295;
    const imgHeight = (canvas.height * imgWidth) / canvas.width;
    let heightLeft = imgHeight;

    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
    heightLeft -= pageHeight;

    while (heightLeft >= 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;
    }

    pdf.save(`${filename}.pdf`);
  }

  exportToCSV(data: ReportData, type: 'summary' | 'trends' | 'performers' | 'events' = 'summary'): void {
    let csvContent = '';
    let filename = '';

    switch (type) {
      case 'summary':
        csvContent = 'Metric,Value\n';
        csvContent += `Total Negotiations,${data.summary.totalNegotiations}\n`;
        csvContent += `Active Negotiations,${data.summary.activeNegotiations}\n`;
        csvContent += `Completed Negotiations,${data.summary.completedNegotiations}\n`;
        csvContent += `Total Value,${data.summary.totalValue}\n`;
        csvContent += `Average Value,${data.summary.averageValue}\n`;
        csvContent += `Success Rate,${data.summary.successRate}%\n`;
        csvContent += `Average Duration,${data.summary.averageDuration} days\n`;
        csvContent += `Conversion Rate,${data.summary.conversionRate}%\n`;
        filename = 'analytics-summary.csv';
        break;

      case 'trends':
        csvContent = 'Date,Started,Completed,Revenue,Average Duration\n';
        data.trends.forEach(trend => {
          csvContent += `${trend.date},${trend.started},${trend.completed},${trend.revenue},${trend.avgDuration}\n`;
        });
        filename = 'negotiation-trends.csv';
        break;

      case 'performers':
        csvContent = 'Performer,Negotiations,Success,Success Rate,Revenue,Average Duration\n';
        data.performers.forEach(performer => {
          const successRate = Math.round((performer.success / performer.negotiations) * 100);
          csvContent += `${performer.name},${performer.negotiations},${performer.success},${successRate}%,${performer.revenue},${performer.avgDuration}\n`;
        });
        filename = 'performer-analytics.csv';
        break;

      case 'events':
        csvContent = 'Event,Revenue,Negotiations,Average Value\n';
        data.events.forEach(event => {
          csvContent += `${event.event},${event.revenue},${event.negotiations},${event.avgValue}\n`;
        });
        filename = 'event-revenue.csv';
        break;
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }

  async exportToExcel(data: ReportData): Promise<void> {
    // For a full Excel export, you would typically use a library like xlsx
    // For now, we'll create multiple CSV files as a workbook alternative
    
    // Export summary
    this.exportToCSV(data, 'summary');
    
    // Small delay to prevent download conflicts
    setTimeout(() => this.exportToCSV(data, 'trends'), 100);
    setTimeout(() => this.exportToCSV(data, 'performers'), 200);
    setTimeout(() => this.exportToCSV(data, 'events'), 300);
    
    console.log('Excel-like export completed: Multiple CSV files downloaded');
  }

  generateReportPreview(data: ReportData): string {
    return `
      <div style="font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px;">
        <div style="text-align: center; margin-bottom: 30px;">
          <h1 style="color: #1f2937; margin-bottom: 10px;">Analytics Report</h1>
          <p style="color: #6b7280; margin: 5px 0;">${data.title}</p>
          <p style="color: #6b7280; margin: 5px 0;">Generated on ${this.formatDate(new Date())}</p>
          <p style="color: #6b7280; margin: 5px 0;">Period: ${data.dateRange}</p>
        </div>
        
        <div style="background: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Executive Summary</h2>
          <div style="display: grid; grid-template-columns: repeat(2, 1fr); gap: 10px;">
            <div><strong>Total Negotiations:</strong> ${data.summary.totalNegotiations}</div>
            <div><strong>Success Rate:</strong> ${data.summary.successRate}%</div>
            <div><strong>Total Value:</strong> ${this.formatCurrency(data.summary.totalValue)}</div>
            <div><strong>Average Duration:</strong> ${data.summary.averageDuration} days</div>
            <div><strong>Active:</strong> ${data.summary.activeNegotiations}</div>
            <div><strong>Completed:</strong> ${data.summary.completedNegotiations}</div>
            <div><strong>Average Value:</strong> ${this.formatCurrency(data.summary.averageValue)}</div>
            <div><strong>Conversion Rate:</strong> ${data.summary.conversionRate}%</div>
          </div>
        </div>
        
        <div style="margin-bottom: 20px;">
          <h2 style="color: #1f2937; margin-bottom: 15px;">Top Performers</h2>
          ${data.performers.slice(0, 5).map(performer => {
            const successRate = Math.round((performer.success / performer.negotiations) * 100);
            return `
              <div style="background: white; padding: 15px; border: 1px solid #e5e7eb; border-radius: 6px; margin-bottom: 10px;">
                <div style="display: flex; justify-content: space-between; align-items: center;">
                  <div>
                    <strong>${performer.name}</strong>
                    <span style="color: #6b7280; margin-left: 10px;">${performer.success}/${performer.negotiations} (${successRate}%)</span>
                  </div>
                  <div style="text-align: right;">
                    <div style="color: #059669; font-weight: bold;">${this.formatCurrency(performer.revenue)}</div>
                    <div style="color: #6b7280; font-size: 12px;">${performer.avgDuration}d avg</div>
                  </div>
                </div>
              </div>
            `;
          }).join('')}
        </div>
        
        <div style="text-align: center; margin-top: 30px; padding-top: 20px; border-top: 1px solid #e5e7eb;">
          <p style="color: #9ca3af; font-size: 12px;">Music Event Management System - Analytics Report</p>
        </div>
      </div>
    `;
  }
}

export const reportService = new ReportService();