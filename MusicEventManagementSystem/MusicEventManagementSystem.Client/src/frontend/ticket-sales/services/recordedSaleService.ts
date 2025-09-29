import type { RecordedSaleResponse } from '../types/api/recordedSale';
import type { RecordedSaleCreateForm, RecordedSaleUpdateForm } from '../types/forms/recordedSale';
import { PaymentMethod, TransactionStatus } from '../types/enums/TicketSales';

const API_BASE_URL = 'https://localhost:7011/api';

export class RecordedSaleService {
  private static readonly BASE_URL = `${API_BASE_URL}/recordedsale`;

  // GET: api/recordedsale
  static async getAllRecordedSales(): Promise<RecordedSaleResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching recorded sales:', error);
      throw new Error('Failed to fetch recorded sales');
    }
  }

  // GET: api/recordedsale/{id}
  static async getRecordedSaleById(id: number): Promise<RecordedSaleResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Recorded Sale with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching recorded sale ${id}:`, error);
      throw error;
    }
  }

  // POST: api/recordedsale
  static async createRecordedSale(createForm: RecordedSaleCreateForm): Promise<RecordedSaleResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          saleDate: createForm.saleDate.toISOString()
        }),
      });

      if (!response.ok) {
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('Error creating recorded sale:', error);
      throw new Error('Failed to create recorded sale');
    }
  }

  // PUT: api/recordedsale/{id}
  static async updateRecordedSale(id: number, updateForm: RecordedSaleUpdateForm): Promise<RecordedSaleResponse> {
    try {
      const requestBody: any = { ...updateForm };
      
      // Convert Date object to ISO string if provided
      if (updateForm.saleDate) {
        requestBody.saleDate = updateForm.saleDate.toISOString();
      }

      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Recorded Sale with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating recorded sale ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/recordedsale/{id}
  static async deleteRecordedSale(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Recorded Sale with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting recorded sale ${id}:`, error);
      throw error;
    }
  }

  // GET: api/recordedsale/user/{userId}
  static async getSalesByUser(userId: string): Promise<RecordedSaleResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/user/${encodeURIComponent(userId)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching sales for user ${userId}:`, error);
      throw new Error('Failed to fetch sales by user');
    }
  }

  // GET: api/recordedsale/date-range?fromDate={fromDate}&toDate={toDate}
  static async getSalesByDateRange(fromDate: Date, toDate: Date): Promise<RecordedSaleResponse[]> {
    try {
      // Format dates as ISO strings without time for date-only comparison
      const fromDateStr = fromDate.toISOString().split('T')[0];
      const toDateStr = toDate.toISOString().split('T')[0];
      
      const response = await fetch(
        `${this.BASE_URL}/date-range?fromDate=${fromDateStr}&toDate=${toDateStr}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sales by date range:', error);
      throw new Error('Failed to fetch sales by date range');
    }
  }

  // GET: api/recordedsale/status/{status}
  static async getSalesByStatus(status: TransactionStatus): Promise<RecordedSaleResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching sales by status ${status}:`, error);
      throw new Error('Failed to fetch sales by status');
    }
  }

  // GET: api/recordedsale/payment-method/{paymentMethod}
  static async getSalesByPaymentMethod(paymentMethod: PaymentMethod): Promise<RecordedSaleResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/payment-method/${paymentMethod}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching sales by payment method ${paymentMethod}:`, error);
      throw new Error('Failed to fetch sales by payment method');
    }
  }

  // GET: api/recordedsale/revenue/total
  static async getTotalRevenue(): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/revenue/total`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching total revenue:', error);
      throw new Error('Failed to fetch total revenue');
    }
  }

  // GET: api/recordedsale/revenue/date-range?fromDate={fromDate}&toDate={toDate}
  static async getRevenueByDateRange(fromDate: Date, toDate: Date): Promise<number> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/revenue/date-range?fromDate=${fromDate.toISOString()}&toDate=${toDate.toISOString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue by date range:', error);
      throw new Error('Failed to fetch revenue by date range');
    }
  }

  // GET: api/recordedsale/count/status/{status}
  static async getSalesCountByStatus(status: TransactionStatus): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/count/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching sales count by status ${status}:`, error);
      throw new Error('Failed to fetch sales count by status');
    }
  }
}
