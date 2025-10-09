import apiService from '../../../shared/services/apiService';
import type { CartDto, AddToCartDto, UpdateCartItemDto } from '../../types/api/cart';

const API_BASE_URL = 'https://localhost:7001/api';

export class CartService {
  private static readonly BASE_URL = `${API_BASE_URL}/cart`;

  static async getCart(userId: string): Promise<CartDto> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}`);
    return response.data;
  }

  static async addToCart(userId: string, item: AddToCartDto): Promise<CartDto> {
    const response = await apiService.post(`${this.BASE_URL}/${userId}/add`, item);
    return response.data;
  }

  static async updateCartItem(userId: string, item: UpdateCartItemDto): Promise<CartDto> {
    const response = await apiService.put(`${this.BASE_URL}/${userId}/update`, item);
    return response.data;
  }

  static async removeFromCart(userId: string, ticketTypeId: number): Promise<CartDto> {
    const response = await apiService.delete(`${this.BASE_URL}/${userId}/remove/${ticketTypeId}`);
    return response.data;
  }

  static async clearCart(userId: string): Promise<{ message: string }> {
    const response = await apiService.post(`${this.BASE_URL}/${userId}/clear`);
    return response.data;
  }

  static async getCartTotal(userId: string): Promise<number> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}/total`);
    return response.data;
  }

  static async validateCart(userId: string): Promise<boolean> {
    const response = await apiService.get(`${this.BASE_URL}/${userId}/validate`);
    return response.data;
  }
}