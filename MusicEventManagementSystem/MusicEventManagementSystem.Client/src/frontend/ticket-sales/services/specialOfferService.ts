import type { SpecialOfferResponse } from '../types/api/specialOffer';
import type { SpecialOfferCreateForm, SpecialOfferUpdateForm } from '../types/forms/specialOffer';
import { OfferType } from '../types/enums/TicketSales';

const API_BASE_URL = 'https://localhost:7011/api';

export class SpecialOfferService {
  private static readonly BASE_URL = `${API_BASE_URL}/specialoffer`;

  // GET: api/specialoffer
  static async getAllSpecialOffers(): Promise<SpecialOfferResponse[]> {
    try {
      const response = await fetch(this.BASE_URL);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching special offers:', error);
      throw new Error('Failed to fetch special offers');
    }
  }

  // GET: api/specialoffer/{id}
  static async getSpecialOfferById(id: number): Promise<SpecialOfferResponse> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`);
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Special Offer with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching special offer ${id}:`, error);
      throw error;
    }
  }

  // POST: api/specialoffer
  static async createSpecialOffer(createForm: SpecialOfferCreateForm): Promise<SpecialOfferResponse> {
    try {
      const response = await fetch(this.BASE_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...createForm,
          startDate: createForm.startDate.toISOString(),
          endDate: createForm.endDate.toISOString()
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
      console.error('Error creating special offer:', error);
      throw new Error('Failed to create special offer');
    }
  }

  // PUT: api/specialoffer/{id}
  static async updateSpecialOffer(id: number, updateForm: SpecialOfferUpdateForm): Promise<SpecialOfferResponse> {
    try {
      const requestBody: any = { ...updateForm };
      
      // Convert Date objects to ISO strings if provided
      if (updateForm.startDate) {
        requestBody.startDate = updateForm.startDate.toISOString();
      }
      if (updateForm.endDate) {
        requestBody.endDate = updateForm.endDate.toISOString();
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
          throw new Error(`Special Offer with ID ${id} not found`);
        }
        if (response.status === 400) {
          const errorData = await response.json();
          throw new Error(`Validation error: ${JSON.stringify(errorData)}`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error updating special offer ${id}:`, error);
      throw error;
    }
  }

  // DELETE: api/specialoffer/{id}
  static async deleteSpecialOffer(id: number): Promise<void> {
    try {
      const response = await fetch(`${this.BASE_URL}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Special Offer with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
    } catch (error) {
      console.error(`Error deleting special offer ${id}:`, error);
      throw error;
    }
  }

  // GET: api/specialoffer/active?date={date}
  static async getActiveOffers(checkDate?: Date): Promise<SpecialOfferResponse[]> {
    try {
      const dateParam = checkDate ? `?date=${checkDate.toISOString()}` : '';
      const response = await fetch(`${this.BASE_URL}/active${dateParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching active offers:', error);
      throw new Error('Failed to fetch active offers');
    }
  }

  // GET: api/specialoffer/by-type/{offerType}
  static async getByOfferType(offerType: OfferType): Promise<SpecialOfferResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/by-type/${offerType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching offers by type ${offerType}:`, error);
      throw new Error('Failed to fetch offers by type');
    }
  }

  // GET: api/specialoffer/by-date-range?start={start}&end={end}
  static async getByDateRange(start: Date, end: Date): Promise<SpecialOfferResponse[]> {
    try {
      const response = await fetch(
        `${this.BASE_URL}/by-date-range?start=${start.toISOString()}&end=${end.toISOString()}`
      );
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error('Error fetching offers by date range:', error);
      throw new Error('Failed to fetch offers by date range');
    }
  }

  // GET: api/specialoffer/by-ticket-type/{ticketTypeId}
  static async getByTicketType(ticketTypeId: number): Promise<SpecialOfferResponse[]> {
    try {
      const response = await fetch(`${this.BASE_URL}/by-ticket-type/${ticketTypeId}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error fetching offers for ticket type ${ticketTypeId}:`, error);
      throw new Error('Failed to fetch offers by ticket type');
    }
  }

  // GET: api/specialoffer/{id}/is-valid?checkDate={checkDate}
  static async isOfferValid(id: number, checkDate?: Date): Promise<{ specialOfferId: number; checkDate: Date; isValid: boolean }> {
    try {
      const dateParam = checkDate ? `?checkDate=${checkDate.toISOString()}` : '';
      const response = await fetch(`${this.BASE_URL}/${id}/is-valid${dateParam}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error(`Special Offer with ID ${id} not found`);
        }
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error checking validity for offer ${id}:`, error);
      throw error;
    }
  }

  // GET: api/specialoffer/ticket-type/{ticketTypeId}/has-active-offer?checkDate={checkDate}
  static async hasActiveOfferForTicketType(
    ticketTypeId: number, 
    checkDate?: Date
  ): Promise<{ ticketTypeId: number; checkDate: Date; hasActiveOffer: boolean }> {
    try {
      const dateParam = checkDate ? `?checkDate=${checkDate.toISOString()}` : '';
      const response = await fetch(`${this.BASE_URL}/ticket-type/${ticketTypeId}/has-active-offer${dateParam}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return await response.json();
    } catch (error) {
      console.error(`Error checking active offer for ticket type ${ticketTypeId}:`, error);
      throw new Error('Failed to check active offer for ticket type');
    }
  }
}
