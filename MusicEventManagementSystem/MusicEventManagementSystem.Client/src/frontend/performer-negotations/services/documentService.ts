import { api } from '../../shared/services/apiService';

// DTO interfaces matching backend
export interface DocumentDto {
  documentId: number;
  title: string;
  type: string;
  path: string;
  version: string;
  updatedAt: Date;
  contractId?: number;
  negotiationId?: number;
  // Navigation properties
  contract?: any;
  negotiation?: any;
}

export interface CreateDocumentDto {
  title: string;
  type: string;
  path: string;
  version: string;
  contractId?: number;
  negotiationId?: number;
}

const API_ENDPOINT = '/document';

export const documentService = {
  // Get all documents
  getAllDocuments: async (): Promise<DocumentDto[]> => {
    try {
      const response = await api.get<DocumentDto[]>(API_ENDPOINT);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents:', error);
      throw error;
    }
  },

  // Get document by ID
  getDocumentById: async (id: number): Promise<DocumentDto> => {
    try {
      const response = await api.get<DocumentDto>(`${API_ENDPOINT}/${id}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching document:', error);
      throw error;
    }
  },

  // Create new document
  createDocument: async (document: CreateDocumentDto): Promise<DocumentDto> => {
    try {
      const response = await api.post<DocumentDto>(API_ENDPOINT, document);
      return response.data;
    } catch (error) {
      console.error('Error creating document:', error);
      throw error;
    }
  },

  // Update document
  updateDocument: async (id: number, document: Partial<DocumentDto>): Promise<DocumentDto> => {
    try {
      const response = await api.put<DocumentDto>(`${API_ENDPOINT}/${id}`, document);
      return response.data;
    } catch (error) {
      console.error('Error updating document:', error);
      throw error;
    }
  },

  // Delete document
  deleteDocument: async (id: number): Promise<void> => {
    try {
      await api.delete(`${API_ENDPOINT}/${id}`);
    } catch (error) {
      console.error('Error deleting document:', error);
      throw error;
    }
  },

  // Get documents by contract ID (new relationship)
  getDocumentsByContract: async (contractId: number): Promise<DocumentDto[]> => {
    try {
      const response = await api.get<DocumentDto[]>(`${API_ENDPOINT}/contract/${contractId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents by contract:', error);
      // Return empty array when API is not available instead of throwing
      return [];
    }
  },

  // Get documents by negotiation ID (new relationship)
  getDocumentsByNegotiation: async (negotiationId: number): Promise<DocumentDto[]> => {
    try {
      const response = await api.get<DocumentDto[]>(`${API_ENDPOINT}/negotiation/${negotiationId}`);
      return response.data;
    } catch (error) {
      console.error('Error fetching documents by negotiation:', error);
      // Return empty array when API is not available instead of throwing
      return [];
    }
  },

  // Upload document
  uploadDocument: async (file: File, documentData: CreateDocumentDto): Promise<DocumentDto> => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('title', documentData.title);
      formData.append('type', documentData.type);
      formData.append('version', documentData.version);
      if (documentData.contractId) {
        formData.append('contractId', documentData.contractId.toString());
      }
      if (documentData.negotiationId) {
        formData.append('negotiationId', documentData.negotiationId.toString());
      }

      const response = await api.post<DocumentDto>(`${API_ENDPOINT}/upload`, formData);
      return response.data;
    } catch (error) {
      console.error('Error uploading document:', error);
      throw error;
    }
  },

  // Download document
  downloadDocument: async (documentId: number): Promise<void> => {
    try {
      const response = await fetch(`/api${API_ENDPOINT}/${documentId}/download`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.style.display = 'none';
      a.href = url;
      
      // Try to get filename from response headers
      const contentDisposition = response.headers.get('content-disposition');
      const filename = contentDisposition
        ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
        : `document_${documentId}`;
      
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading document:', error);
      throw error;
    }
  },
};
