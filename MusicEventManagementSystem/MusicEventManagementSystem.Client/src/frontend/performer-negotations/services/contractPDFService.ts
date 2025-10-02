// Note: You need to install jsPDF first: npm install jspdf
import type { ContractDto } from './contractService';

// Dynamic import for jsPDF to handle cases where it's not installed
const getJsPDF = async () => {
  try {
    const jsPDF = await import('jspdf');
    return jsPDF.default;
  } catch (error) {
    throw new Error('jsPDF is not installed. Please run: npm install jspdf');
  }
};

export class ContractPDFGenerator {
  private pdf: any;
  private pageWidth: number = 210; // A4 width in mm
  private pageHeight: number = 297; // A4 height in mm
  private margin: number = 20;
  private currentY: number = 20;
  private lineHeight: number = 6;

  constructor(pdf: any) {
    this.pdf = pdf;
    this.pageWidth = this.pdf.internal.pageSize.getWidth();
    this.pageHeight = this.pdf.internal.pageSize.getHeight();
  }

  static async create(): Promise<ContractPDFGenerator> {
    const jsPDF = await getJsPDF();
    const pdf = new jsPDF();
    return new ContractPDFGenerator(pdf);
  }

  private formatDate(dateString: string | null | undefined): string {
    if (!dateString) return 'Not specified';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  }

  private formatCurrency(amount: number | null | undefined): string {
    if (!amount) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  }

  private addText(text: string, fontSize: number = 10, isBold: boolean = false, isCenter: boolean = false): void {
    this.pdf.setFontSize(fontSize);
    this.pdf.setFont('helvetica', isBold ? 'bold' : 'normal');
    
    if (isCenter) {
      this.pdf.text(text, this.pageWidth / 2, this.currentY, { align: 'center' });
    } else {
      this.pdf.text(text, this.margin, this.currentY);
    }
    
    this.currentY += this.lineHeight + (fontSize > 10 ? 2 : 0);
  }

  private addSectionHeader(title: string): void {
    this.currentY += 5;
    this.addText(title, 12, true);
    this.currentY += 2;
  }

  private addKeyValuePair(key: string, value: string | number | boolean): void {
    const displayValue = typeof value === 'boolean' ? (value ? 'Yes' : 'No') : String(value);
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${key}:`, this.margin, this.currentY);
    
    this.pdf.setFont('helvetica', 'normal');
    this.pdf.text(displayValue, this.margin + 60, this.currentY);
    
    this.currentY += this.lineHeight;
  }

  private addLongText(key: string, value: string): void {
    this.pdf.setFontSize(10);
    this.pdf.setFont('helvetica', 'bold');
    this.pdf.text(`${key}:`, this.margin, this.currentY);
    this.currentY += this.lineHeight;
    
    this.pdf.setFont('helvetica', 'normal');
    const lines = this.pdf.splitTextToSize(value || 'Not specified', this.pageWidth - 2 * this.margin);
    this.pdf.text(lines, this.margin, this.currentY);
    this.currentY += lines.length * this.lineHeight + 3;
  }

  private checkPageBreak(requiredSpace: number = 30): void {
    if (this.currentY + requiredSpace > this.pageHeight - this.margin) {
      this.pdf.addPage();
      this.currentY = this.margin;
    }
  }

  public generateContractPDF(contract: ContractDto): void {
    // Header
    this.addText('PERFORMANCE CONTRACT', 16, true, true);
    this.currentY += 5;

    // Contract ID and Title
    this.addText(`Contract ID: ${contract.contractId}`, 12, true, true);
    this.addText(contract.title, 14, true, true);
    this.currentY += 10;

    // Basic Information Section
    this.addSectionHeader('BASIC INFORMATION');
    this.addKeyValuePair('Contract Type', contract.contractType);
    this.addKeyValuePair('Version', contract.version);
    this.addKeyValuePair('Status', contract.status);
    this.addKeyValuePair('Total Price', this.formatCurrency(contract.price));
    this.addKeyValuePair('Created Date', this.formatDate(contract.createdAt));
    if (contract.signedAt) {
      this.addKeyValuePair('Signed Date', this.formatDate(contract.signedAt));
    }

    // Performer and Event Information
    this.checkPageBreak();
    this.addSectionHeader('PERFORMER & EVENT DETAILS');
    this.addKeyValuePair('Performer', contract.performerName || `ID: ${contract.performerId}`);
    if (contract.eventTitle) {
      this.addKeyValuePair('Event', contract.eventTitle);
    }
    if (contract.eventLocation) {
      this.addKeyValuePair('Event Location', contract.eventLocation);
    }
    if (contract.eventDate) {
      this.addKeyValuePair('Event Date', this.formatDate(contract.eventDate));
    }

    // Payment Information
    this.checkPageBreak();
    this.addSectionHeader('PAYMENT INFORMATION');
    this.addKeyValuePair('Payment Method', contract.paymentMethod);
    
    if (contract.depositAmount) {
      this.addKeyValuePair('Deposit Amount', this.formatCurrency(contract.depositAmount));
      this.addKeyValuePair('Deposit Due Date', this.formatDate(contract.depositDueDate));
      this.addKeyValuePair('Deposit Paid', contract.isDepositPaid);
    }
    
    if (contract.finalPaymentAmount) {
      this.addKeyValuePair('Final Payment Amount', this.formatCurrency(contract.finalPaymentAmount));
      this.addKeyValuePair('Final Payment Due Date', this.formatDate(contract.finalPaymentDueDate));
      this.addKeyValuePair('Final Payment Paid', contract.isFinalPaymentPaid);
    }

    // Banking Information
    if (contract.bankName) {
      this.checkPageBreak();
      this.addSectionHeader('BANKING INFORMATION');
      this.addKeyValuePair('Bank Name', contract.bankName);
      this.addKeyValuePair('Account Holder', contract.bankAccountHolderName);
      this.addKeyValuePair('Account Number', contract.bankAccountNumber);
      this.addKeyValuePair('Routing Number', contract.bankRoutingNumber);
      if (contract.bankIBAN) {
        this.addKeyValuePair('IBAN', contract.bankIBAN);
      }
      if (contract.bankSWIFT) {
        this.addKeyValuePair('SWIFT Code', contract.bankSWIFT);
      }
    }

    // Requirements
    this.checkPageBreak();
    this.addSectionHeader('REQUIREMENTS');
    this.addLongText('Technical Requirements', contract.technicalRequirements);
    this.addLongText('Accommodation Requirements', contract.accommodationRequirements);

    // Contract Document Information
    if (contract.contractFilePath || contract.finalVersionDate) {
      this.checkPageBreak();
      this.addSectionHeader('DOCUMENT INFORMATION');
      if (contract.contractFilePath) {
        this.addKeyValuePair('Contract File Path', contract.contractFilePath);
      }
      if (contract.finalVersionDate) {
        this.addKeyValuePair('Final Version Date', this.formatDate(contract.finalVersionDate));
      }
    }

    // Review Information
    this.checkPageBreak();
    this.addSectionHeader('REVIEW STATUS');
    this.addKeyValuePair('Reviewed by Stakeholders', contract.reviewedByStakeholders);
    if (contract.stakeholderReviewDate) {
      this.addKeyValuePair('Review Date', this.formatDate(contract.stakeholderReviewDate));
    }

    // Notes
    if (contract.notes) {
      this.checkPageBreak();
      this.addSectionHeader('NOTES');
      this.addLongText('Additional Notes', contract.notes);
    }

    // Footer
    this.checkPageBreak(40);
    this.currentY += 20;
    this.addText('_'.repeat(60), 10, false, true);
    this.addText('This document was generated electronically', 8, false, true);
    this.addText(`Generated on: ${new Date().toLocaleString()}`, 8, false, true);
  }

  public downloadPDF(filename?: string): void {
    const defaultFilename = `contract-${Date.now()}.pdf`;
    this.pdf.save(filename || defaultFilename);
  }

  public getPDFDataUri(): string {
    return this.pdf.output('datauristring');
  }

  public getPDFBlob(): Blob {
    return this.pdf.output('blob');
  }
}

// Convenience function to generate and download contract PDF
export const generateContractPDF = async (contract: ContractDto, filename?: string): Promise<void> => {
  try {
    const generator = await ContractPDFGenerator.create();
    generator.generateContractPDF(contract);
    
    const contractFilename = filename || `contract-${contract.contractId}-${contract.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
    generator.downloadPDF(contractFilename);
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF generation failed. Please install the required dependencies by running: npm install jspdf');
    throw error;
  }
};

// Function to generate PDF as blob (useful for email attachments, etc.)
export const generateContractPDFBlob = async (contract: ContractDto): Promise<Blob> => {
  try {
    const generator = await ContractPDFGenerator.create();
    generator.generateContractPDF(contract);
    return generator.getPDFBlob();
  } catch (error) {
    console.error('Error generating PDF:', error);
    alert('PDF generation failed. Please install the required dependencies by running: npm install jspdf');
    throw error;
  }
};