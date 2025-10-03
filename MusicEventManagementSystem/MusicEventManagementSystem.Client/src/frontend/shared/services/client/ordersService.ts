import type { CheckoutRequestDto, CheckoutResponseDto } from '../../types/api/checkout';
import type { OrderDto, OrderDetailsDto, OrderTicketDto} from '../../types/api/order';

const API_BASE_URL = 'http://localhost:7001/api';

export class ordersService {
  public static readonly BASE_URL = `${API_BASE_URL}/orders`;

  static async checkout(userId: string, checkoutRequest: CheckoutRequestDto): Promise<CheckoutResponseDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}/checkout`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(checkoutRequest),
    });
    if (!response.ok) throw new Error(`Failed to checkout: ${response.statusText}`);
    return response.json();
  }

  static async getUserOrders(userId: string): Promise<OrderDto[]> {
    const response = await fetch(`${this.BASE_URL}/${userId}`);
    if (!response.ok) throw new Error(`Failed to get user orders: ${response.statusText}`);
    return response.json();
  }

  static async getOrderDetails(userId: string, orderId: number): Promise<OrderDetailsDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}/${orderId}`);
    if (!response.ok) throw new Error(`Failed to get order details: ${response.statusText}`);
    return response.json();
  }

  static async cancelOrder(userId: string, orderId: number): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/${userId}/${orderId}/cancel`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Failed to cancel order: ${response.statusText}`);
    return response.json();
  }

  static async getTicketDetails(userId: string, ticketId: number): Promise<OrderTicketDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}/tickets/${ticketId}`);
    if (!response.ok) throw new Error(`Failed to get ticket details: ${response.statusText}`);
    return response.json();
  }

  static async downloadTicketPdf(userId: string, ticketId: number): Promise<Blob> {
    const response = await fetch(`${this.BASE_URL}/${userId}/tickets/${ticketId}/pdf`);
    if (!response.ok) throw new Error(`Failed to download ticket PDF: ${response.statusText}`);
    return response.blob();
  }
};