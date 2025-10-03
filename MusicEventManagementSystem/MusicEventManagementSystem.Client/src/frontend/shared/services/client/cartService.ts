import type { CartDto, AddToCartDto, UpdateCartItemDto } from '../../types/api/cart';

const API_BASE_URL = 'http://localhost:7001/api';

export class CartService {
  private static readonly BASE_URL = `${API_BASE_URL}/cart`;

  static async getCart(userId: string): Promise<CartDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}`);
    if (!response.ok) throw new Error(`Failed to get cart: ${response.statusText}`);
    return response.json();
  }

  static async addToCart(userId: string, item: AddToCartDto): Promise<CartDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}/add`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error(`Failed to add to cart: ${response.statusText}`);
    return response.json();
  }

  static async updateCartItem(userId: string, item: UpdateCartItemDto): Promise<CartDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}/update`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(item),
    });
    if (!response.ok) throw new Error(`Failed to update cart item: ${response.statusText}`);
    return response.json();
  }

  static async removeFromCart(userId: string, ticketTypeId: number): Promise<CartDto> {
    const response = await fetch(`${this.BASE_URL}/${userId}/remove/${ticketTypeId}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error(`Failed to remove from cart: ${response.statusText}`);
    return response.json();
  }

  static async clearCart(userId: string): Promise<{ message: string }> {
    const response = await fetch(`${this.BASE_URL}/${userId}/clear`, {
      method: 'POST',
    });
    if (!response.ok) throw new Error(`Failed to clear cart: ${response.statusText}`);
    return response.json();
  }

  static async getCartTotal(userId: string): Promise<number> {
    const response = await fetch(`${this.BASE_URL}/${userId}/total`);
    if (!response.ok) throw new Error(`Failed to get cart total: ${response.statusText}`);
    return response.json();
  }

  static async validateCart(userId: string): Promise<boolean> {
    const response = await fetch(`${this.BASE_URL}/${userId}/validate`);
    if (!response.ok) throw new Error(`Failed to validate cart: ${response.statusText}`);
    return response.json();
  }
}