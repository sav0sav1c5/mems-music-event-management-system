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
    `${this.BASE_URL}/analytics/revenue?startDate=${fromDate.toISOString()}&endDate=${toDate.toISOString()}`
    );
    return response.data;
  }
}