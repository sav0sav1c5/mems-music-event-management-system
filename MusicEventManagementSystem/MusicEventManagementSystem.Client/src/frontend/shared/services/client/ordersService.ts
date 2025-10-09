import apiService from '../../../shared/services/apiService';
import type { CheckoutRequestDto, CheckoutResponseDto } from '../../types/api/checkout';
import type { OrderDto, OrderDetailsDto, OrderTicketDto} from '../../types/api/order';

const API_BASE_URL = 'https://localhost:7001/api';

export class OrdersService { // Promenjeno ime klase (capital O)
  public static readonly BASE_URL = `${API_BASE_URL}/orders`;

  static async checkout(userId: string, checkoutRequest: CheckoutRequestDto): Promise<CheckoutResponseDto> {
    const response = await apiService.post(`${this.BASE_URL}/${userId}/checkout`, checkoutRequest);
    return response.data;
  }

  static async getUserOrders(userId: string): Promise<OrderDto[]> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}`);
    return response.data;
  }

  static async getOrderDetails(userId: string, orderId: number): Promise<OrderDetailsDto> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}/${orderId}`);
    return response.data;
  }

  static async cancelOrder(userId: string, orderId: number): Promise<{ message: string }> {
    const response = await apiService.post(`${this.BASE_URL}/${userId}/${orderId}/cancel`);
    return response.data;
  }

  static async getTicketDetails(userId: string, ticketId: number): Promise<OrderTicketDto> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}/tickets/${ticketId}`);
    return response.data;
  }

  static async downloadTicketPdf(userId: string, ticketId: number): Promise<Blob> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}/tickets/${ticketId}/pdf`, {
      responseType: 'blob'
    });
    return response.data;
  }
}