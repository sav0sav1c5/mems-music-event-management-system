import apiService from '../../shared/services/apiService';
import type { RecordedSaleResponse } from '../types/api/recordedSale';
import type { RecordedSaleCreateForm, RecordedSaleUpdateForm } from '../types/forms/recordedSale';
import { PaymentMethod, TransactionStatus } from '../types/enums/TicketSales';

export interface RevenueAnalysisResponse {
  totalRevenue: number;
  totalSales: number;
  averageSaleAmount: number;
  periodStart: string;
  periodEnd: string;
}

export interface AnalysisSection {
  analysisSection: string;
  metricName: string;
  metricValue: number;
  metricUnit: string;
  additionalInfo?: any;
}

export interface AnalysisSummary {
  totalRevenue: number;
  totalTicketsSold: number;
  averageTicketPrice: number;
  topPerformingZone?: string;
  topPerformingOffer?: string;
  recommendations?: string[];
}

export interface ComprehensiveAnalysisResponse {
  generatedAt: string;
  startDate: string;
  endDate: string;
  eventId?: number;
  sections: {
    [key: string]: AnalysisSection[];
  };
  summary: AnalysisSummary;
  StartDate?: string;
  EndDate?: string;
  EventId?: number;
  Sections?: {
    [key: string]: AnalysisSection[];
  };
}

export interface AuditLogEntry {
  auditId: number;
  recordedSaleId: number;
  action: string;
  oldTotalAmount: number | null;
  newTotalAmount: number | null;
  ticketCount: number;
  changedAt: string;
  changedBy: string;
}

export interface PerformanceMetric {
  testName: string;
  executionTimeMs: number;
  rowsReturned: number;
  indexUsed: boolean;
}

const API_BASE_URL = 'https://localhost:7011/api';

export class RecordedSaleService {
  private static readonly BASE_URL = `${API_BASE_URL}/recordedsale`;

  static async getAllRecordedSales(): Promise<RecordedSaleResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getRecordedSaleById(id: number): Promise<RecordedSaleResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createRecordedSale(createForm: RecordedSaleCreateForm): Promise<RecordedSaleResponse> {
    const requestBody = {
      ...createForm,
      saleDate: createForm.saleDate.toISOString()
    };
    
    const response = await apiService.post(this.BASE_URL, requestBody);
    return response.data;
  }

  static async updateRecordedSale(id: number, updateForm: RecordedSaleUpdateForm): Promise<RecordedSaleResponse> {
    const requestBody: any = { ...updateForm };
    
    if (updateForm.saleDate) {
      requestBody.saleDate = updateForm.saleDate.toISOString();
    }

    const response = await apiService.put(`${this.BASE_URL}/${id}`, requestBody);
    return response.data;
  }

  static async deleteRecordedSale(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getSalesByUser(userId: string): Promise<RecordedSaleResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/user/${encodeURIComponent(userId)}`);
    return response.data;
  }

  static async getSalesByDateRange(fromDate: Date, toDate: Date): Promise<RecordedSaleResponse[]> {
    const fromDateStr = fromDate.toISOString().split('T')[0];
    const toDateStr = toDate.toISOString().split('T')[0];
    
    const response = await apiService.get(
      `${this.BASE_URL}/date-range?fromDate=${fromDateStr}&toDate=${toDateStr}`
    );
    return response.data;
  }

  static async getSalesByStatus(status: TransactionStatus): Promise<RecordedSaleResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/status/${status}`);
    return response.data;
  }

  static async getSalesByPaymentMethod(paymentMethod: PaymentMethod): Promise<RecordedSaleResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/payment-method/${paymentMethod}`);
    return response.data;
  }

  static async getTotalRevenue(): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/revenue/total`);
    return response.data;
  }

  static async getRevenueByDateRange(fromDate: Date, toDate: Date): Promise<number> {
    const response = await apiService.get(
      `${this.BASE_URL}/revenue/date-range?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`
    );
    return response.data;
  }

  static async getSalesCountByStatus(status: TransactionStatus): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/count/status/${status}`);
    return response.data;
  }

  static async getRevenueAnalysis(fromDate: Date, toDate: Date): Promise<RevenueAnalysisResponse> {
    const response = await apiService.get(
      `${this.BASE_URL}/analytics/revenue?startDate=${fromDate.toISOString().split('T')[0]}&endDate=${toDate.toISOString().split('T')[0]}`
    );
    return response.data;
  }

  static async getComprehensiveAnalysis(eventId?: number, startDate?: Date, endDate?: Date): Promise<ComprehensiveAnalysisResponse> {
    const params = new URLSearchParams();
    
    if (eventId !== undefined) {
      params.append('eventId', eventId.toString());
    }
    if (startDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString().split('T')[0]);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.BASE_URL}/comprehensive?${queryString}`
      : `${this.BASE_URL}/comprehensive`;

    const response = await apiService.get(url);
    return response.data;
  }

  static async exportAnalysisToPdf(eventId?: number, startDate?: Date, endDate?: Date): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (eventId !== undefined) {
      params.append('eventId', eventId.toString());
    }
    if (startDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString().split('T')[0]);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.BASE_URL}/export/pdf?${queryString}`
      : `${this.BASE_URL}/export/pdf`;

    const response = await apiService.get(url, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  static async exportAnalysisToExcel(eventId?: number, startDate?: Date, endDate?: Date): Promise<Blob> {
    const params = new URLSearchParams();
    
    if (eventId !== undefined) {
      params.append('eventId', eventId.toString());
    }
    if (startDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString().split('T')[0]);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.BASE_URL}/export/excel?${queryString}`
      : `${this.BASE_URL}/export/excel`;

    const response = await apiService.get(url, {
      responseType: 'blob'
    });
    
    return response.data;
  }

  static async getAnalysisSection(sectionName: string, eventId?: number, startDate?: Date, endDate?: Date): Promise<AnalysisSection[]> {
    const params = new URLSearchParams();
    
    if (eventId !== undefined) {
      params.append('eventId', eventId.toString());
    }
    if (startDate) {
      params.append('startDate', startDate.toISOString().split('T')[0]);
    }
    if (endDate) {
      params.append('endDate', endDate.toISOString().split('T')[0]);
    }

    const queryString = params.toString();
    const url = queryString 
      ? `${this.BASE_URL}/section/${encodeURIComponent(sectionName)}?${queryString}`
      : `${this.BASE_URL}/section/${encodeURIComponent(sectionName)}`;

    const response = await apiService.get(url);
    return response.data;
  }

  static async getSalesAuditLog(limit: number = 50): Promise<AuditLogEntry[]> {
    const response = await apiService.get(`${this.BASE_URL}/audit-log?limit=${limit}`);
    return response.data;
  }

  static async getIndexPerformance(): Promise<PerformanceMetric[]> {
    const response = await apiService.get(`${this.BASE_URL}/performance/indexes`);
    return response.data;
  }
}