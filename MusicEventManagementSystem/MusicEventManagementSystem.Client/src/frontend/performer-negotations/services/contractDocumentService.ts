const API_BASE_URL = 'http://localhost:5255/api';

// DTO interfaces matching backend ContractDocument API
export interface ContractDocumentInfo {
  hasDocument: boolean;
  fileName: string;
  fileSize: number;
  uploadedAt: string | null;
  canUpload: boolean;
  canDownload: boolean;
}

export interface ContractDocumentDto {
  contractId: number;
  fileName: string;
  fileSize: number;
  uploadedAt: string;
  filePath: string;
}

export const contractDocumentService = {
  // Get contract document information
  getContractDocumentInfo: async (contractId: number): Promise<ContractDocumentInfo> => {
    try {
      const response = await fetch(`${API_BASE_URL}/contractdocument/info/${contractId}`);
      if (response.ok) {
        return await response.json();
      } else {
        // Return default info if contract document doesn't exist
        return {
          hasDocument: false,
          fileName: '',
          fileSize: 0,
          uploadedAt: null,
          canUpload: false,
          canDownload: false
        };
      }
    } catch (error) {
      console.error('Error fetching contract document info:', error);
      return {
        hasDocument: false,
        fileName: '',
        fileSize: 0,
        uploadedAt: null,
        canUpload: false,
        canDownload: false
      };
    }
  },

  // Get contract document (for download)
  downloadDocument: async (contractId: number): Promise<void> => {
    try {
      const response = await fetch(`${API_BASE_URL}/contractdocument/download/${contractId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        
        // Try to get filename from response headers
        const contentDisposition = response.headers.get('content-disposition');
        const filename = contentDisposition
          ? contentDisposition.split('filename=')[1]?.replace(/"/g, '')
          : 'contract.pdf';
        
        a.download = filename;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        throw new Error(`Download failed with status ${response.status}`);
      }
    } catch (error) {
      console.error('Error downloading contract document:', error);
      throw error;
    }
  },

  // Upload contract document
  uploadDocument: async (contractId: number, file: File): Promise<boolean> => {
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${API_BASE_URL}/contractdocument/upload/${contractId}`, {
        method: 'POST',
        body: formData,
      });

      return response.ok;
    } catch (error) {
      console.error('Error uploading contract document:', error);
      return false;
    }
  },

  // Delete contract document
  deleteDocument: async (contractId: number): Promise<boolean> => {
    try {
      const response = await fetch(`${API_BASE_URL}/contractdocument/${contractId}`, {
        method: 'DELETE',
      });

      return response.ok;
    } catch (error) {
      console.error('Error deleting contract document:', error);
      return false;
    }
  }
};