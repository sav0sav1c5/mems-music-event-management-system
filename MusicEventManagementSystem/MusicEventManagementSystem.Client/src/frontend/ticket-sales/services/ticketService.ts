import type { TicketResponse } from '../types/api/ticket';
import type { TicketCreateForm, TicketUpdateForm } from '../types/forms/ticket';
import { TicketStatus } from '../types/enums/ticketSales';

const API_BASE_URL = 'https://localhost:7050/api';

export class TicketService {
  private static readonly BASE_URL = `${API_BASE_URL}/ticket`;

  // GET: api/ticket
  static async getAllTickets(): Promise<TicketResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching tickets:', error);
      throw new Error('Failed to fetch tickets');
    }
  }

  // GET: api/ticket/{id}
  static async getTicketById(id: number): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket ${id}:`, error);
      throw error;
    }
  }

  // POST: api/ticket
  static async createTicket(createForm: TicketCreateForm): Promise<TicketResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          issueDate: createForm.issueDate.toISOString()
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
      console.error('Error creating ticket:', error);
      throw new Error('Failed to create ticket');
    }
  }

  // PUT: api/ticket/{id}
  static async updateTicket(id: number, updateForm: TicketUpdateForm): Promise<TicketResponse> {
    try {
      const requestBody: any = { ...updateForm };
      
      if (updateForm.issueDate) {
        requestBody.issueDate = updateForm.issueDate.toISOString();
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
          throw new Error(`Ticket with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating ticket ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/ticket/{id}
  static async deleteTicket(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting ticket ${id}:`, error);
      throw error;
    }
  }

  // GET: api/ticket/status/{status}
  static async getTicketsByStatus(status: TicketStatus): Promise<TicketResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching tickets by status ${status}:`, error);
      throw new Error('Failed to fetch tickets by status');
    }
  }

  // GET: api/ticket/unique-code/{uniqueCode}
  static async getTicketByUniqueCode(uniqueCode: string): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/unique-code/${encodeURIComponent(uniqueCode)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket with unique code ${uniqueCode} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket by unique code ${uniqueCode}:`, error);
      throw error;
    }
  }

  // GET: api/ticket/qr-code/{qrCode}
  static async getTicketByQrCode(qrCode: string): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/qr-code/${encodeURIComponent(qrCode)}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket with QR code not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching ticket by QR code:', error);
      throw error;
    }
  }

  // GET: api/ticket/statistics/count/{status}
  static async getTicketsCountByStatus(status: TicketStatus): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/statistics/count/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching ticket count by status ${status}:`, error);
      throw error;
    }
  }

  // GET: api/ticket/statistics/revenue/total
  static async getTotalRevenue(): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/statistics/revenue/total`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching total revenue:', error);
      throw new Error('Failed to fetch total revenue');
    }
  }

  // GET: api/ticket/statistics/revenue/date-range?from={from}&to={to}
  static async getRevenueByDateRange(from: Date, to: Date): Promise<number> {
    try {
      if (from > to) {
        throw new Error('From date cannot be greater than to date');
      }

      // Convert to UTC
      const fromUTC = from.toISOString();
      const toUTC = to.toISOString();

      const response = await fetch(
        `${this.BASE_URL}/statistics/revenue/date-range?from=${fromUTC}&to=${toUTC}`
      );
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching revenue by date range:', error);
      throw error;
    }
  }

  // GET: api/ticket/statistics/revenue/status/{status}
  static async getRevenueByStatus(status: TicketStatus): Promise<number> {
    try {
      const response = await fetch(`${this.BASE_URL}/statistics/revenue/status/${status}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching revenue by status ${status}:`, error);
      throw error;
    }
  }

  // GET: api/ticket/sold
  static async getSoldTickets(): Promise<TicketResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/sold`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching sold tickets:', error);
      throw new Error('Failed to fetch sold tickets');
    }
  }

  // GET: api/ticket/today
  static async getTodaysTickets(): Promise<TicketResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/today`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching today\'s tickets:', error);
      throw new Error('Failed to fetch today\'s tickets');
    }
  }

  // POST: api/ticket/{id}/sell
  static async sellTicket(id: number): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/sell`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Ticket cannot be sold. It may not exist or may not be available.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error selling ticket ${id}:`, error);
      throw error;
    }
  }

  // POST: api/ticket/use/{uniqueCode}
  static async useTicket(uniqueCode: string): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/use/${encodeURIComponent(uniqueCode)}`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 400) {
          throw new Error('Ticket cannot be used. It may not exist or may not be sold.');
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error using ticket with unique code ${uniqueCode}:`, error);
      throw error;
    }
  }

  // POST: api/ticket/{id}/cancel
  static async cancelTicket(id: number): Promise<TicketResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}/cancel`, {
        method: 'POST',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Ticket with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error canceling ticket ${id}:`, error);
      throw error;
    }
  }

  // GET: api/ticket/validate/unique-code/{uniqueCode}
  static async validateUniqueCode(uniqueCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/validate/unique-code/${encodeURIComponent(uniqueCode)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error(`Error validating unique code ${uniqueCode}:`, error);
      throw error;
    }
  }

  // GET: api/ticket/validate/qr-code/{qrCode}
  static async validateQrCode(qrCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/validate/qr-code/${encodeURIComponent(qrCode)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.isValid;
    } catch (error) {
      console.error('Error validating QR code:', error);
      throw error;
    }
  }

  // GET: api/ticket/can-use/{uniqueCode}
  static async canTicketBeUsed(uniqueCode: string): Promise<boolean> {
    try {
      const response = await fetch(`${this.BASE_URL}/can-use/${encodeURIComponent(uniqueCode)}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      return result.canBeUsed;
    } catch (error) {
      console.error(`Error checking if ticket can be used ${uniqueCode}:`, error);
      throw error;
    }
  }
}
