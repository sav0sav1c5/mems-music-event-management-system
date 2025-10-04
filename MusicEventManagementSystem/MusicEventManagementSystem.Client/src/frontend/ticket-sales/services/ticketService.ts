import apiService from '../../shared/services/apiService';
import type { TicketResponse } from '../types/api/ticket';
import type { TicketCreateForm, TicketUpdateForm } from '../types/forms/ticket';
import { TicketStatus } from '../types/enums/TicketSales';

const API_BASE_URL = 'https://localhost:7011/api';

export class TicketService {
  private static readonly BASE_URL = `${API_BASE_URL}/ticket`;

  static async getAllTickets(): Promise<TicketResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getTicketById(id: number): Promise<TicketResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createTicket(createForm: TicketCreateForm): Promise<TicketResponse> {
    const requestBody = {
      ...createForm,
      issueDate: createForm.issueDate.toISOString()
    };

    const response = await apiService.post(this.BASE_URL, requestBody);
    return response.data;
  }

  static async updateTicket(id: number, updateForm: TicketUpdateForm): Promise<TicketResponse> {
    const requestBody: any = { ...updateForm };
    
    if (updateForm.issueDate) {
      requestBody.issueDate = updateForm.issueDate.toISOString();
    }

    const response = await apiService.put(`${this.BASE_URL}/${id}`, requestBody);
    return response.data;
  }

  static async deleteTicket(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getTicketsByStatus(status: TicketStatus): Promise<TicketResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/status/${status}`);
    return response.data;
  }

  static async getTicketByUniqueCode(uniqueCode: string): Promise<TicketResponse> {
    const response = await apiService.get(`${this.BASE_URL}/unique-code/${encodeURIComponent(uniqueCode)}`);
    return response.data;
  }

  static async getTicketByQrCode(qrCode: string): Promise<TicketResponse> {
    const response = await apiService.get(`${this.BASE_URL}/qr-code/${encodeURIComponent(qrCode)}`);
    return response.data;
  }

  static async getTicketsCountByStatus(status: TicketStatus): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/statistics/count/${status}`);
    return response.data;
  }

  static async getTotalRevenue(): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/statistics/revenue/total`);
    return response.data;
  }

  static async getRevenueByDateRange(from: Date, to: Date): Promise<number> {
    if (from > to) {
      throw new Error('From date cannot be greater than to date');
    }

    const fromUTC = from.toISOString();
    const toUTC = to.toISOString();

    const response = await apiService.get(
      `${this.BASE_URL}/statistics/revenue/date-range?from=${fromUTC}&to=${toUTC}`
    );
    return response.data;
  }

  static async getRevenueByStatus(status: TicketStatus): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/statistics/revenue/status/${status}`);
    return response.data;
  }

  static async getSoldTickets(): Promise<TicketResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/sold`);
    return response.data;
  }

  static async getTodaysTickets(): Promise<TicketResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/today`);
    return response.data;
  }

  static async sellTicket(id: number): Promise<TicketResponse> {
    const response = await apiService.post(`${this.BASE_URL}/${id}/sell`);
    return response.data;
  }

  static async useTicket(uniqueCode: string): Promise<TicketResponse> {
    const response = await apiService.post(`${this.BASE_URL}/use/${encodeURIComponent(uniqueCode)}`);
    return response.data;
  }

  static async cancelTicket(id: number): Promise<TicketResponse> {
    const response = await apiService.post(`${this.BASE_URL}/${id}/cancel`);
    return response.data;
  }

  static async validateUniqueCode(uniqueCode: string): Promise<boolean> {
    const response = await apiService.get(`${this.BASE_URL}/validate/unique-code/${encodeURIComponent(uniqueCode)}`);
    return response.data.isValid;
  }

  static async validateQrCode(qrCode: string): Promise<boolean> {
    const response = await apiService.get(`${this.BASE_URL}/validate/qr-code/${encodeURIComponent(qrCode)}`);
    return response.data.isValid;
  }

  static async canTicketBeUsed(uniqueCode: string): Promise<boolean> {
    const response = await apiService.get(`${this.BASE_URL}/can-use/${encodeURIComponent(uniqueCode)}`);
    return response.data.canBeUsed;
  }
}