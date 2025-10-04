import apiService from '../../shared/services/apiService';
import type { TicketTypeResponse } from '../types/api/ticketType';
import type { TicketTypeCreateForm, TicketTypeUpdateForm } from '../types/forms/ticketType';
import { TicketTypeStatus } from '../types/enums/TicketSales';

const API_BASE_URL = 'https://localhost:7011/api';

export class TicketTypeService {
  private static readonly BASE_URL = `${API_BASE_URL}/tickettype`;

  static async getAllTicketTypes(): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(this.BASE_URL);
    return response.data;
  }

  static async getTicketTypeById(id: number): Promise<TicketTypeResponse> {
    const response = await apiService.get(`${this.BASE_URL}/${id}`);
    return response.data;
  }

  static async createTicketType(createForm: TicketTypeCreateForm): Promise<TicketTypeResponse> {
    const response = await apiService.post(this.BASE_URL, createForm);
    return response.data;
  }

  static async updateTicketType(id: number, updateForm: TicketTypeUpdateForm): Promise<TicketTypeResponse> {
    const response = await apiService.put(`${this.BASE_URL}/${id}`, updateForm);
    return response.data;
  }

  static async deleteTicketType(id: number): Promise<void> {
    await apiService.delete(`${this.BASE_URL}/${id}`);
  }

  static async getByZoneId(zoneId: number): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/zone/${zoneId}`);
    return response.data;
  }

  static async getByEventId(eventId: number): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/event/${eventId}`);
    return response.data;
  }

  static async getByStatus(status: TicketTypeStatus): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/status/${status}`);
    return response.data;
  }

  static async getAvailableTicketTypes(): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/available`);
    return response.data;
  }

  static async updateAvailableQuantity(id: number, quantity: number): Promise<boolean> {
    await apiService.put(`${this.BASE_URL}/${id}/quantity`, quantity);
    return true;
  }

  static async getByZoneAndEvent(zoneId: number, eventId: number): Promise<TicketTypeResponse[]> {
    const response = await apiService.get(`${this.BASE_URL}/zone/${zoneId}/event/${eventId}`);
    return response.data;
  }

  static async getTotalAvailableQuantityByEvent(eventId: number): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/event/${eventId}/totalquantity`);
    return response.data;
  }

  static async reserveTickets(id: number, quantity: number): Promise<boolean> {
    await apiService.post(`${this.BASE_URL}/${id}/reserve`, quantity);
    return true;
  }

  static async releaseTickets(id: number, quantity: number): Promise<boolean> {
    await apiService.post(`${this.BASE_URL}/${id}/release`, quantity);
    return true;
  }
}