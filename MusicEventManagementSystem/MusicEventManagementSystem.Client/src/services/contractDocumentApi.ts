// API service for contract document operations
export interface ContractDocumentInfo {
  hasDocument: boolean;
  fileName: string;
  fileSize: number;
  uploadedAt: string | null;
  canUpload: boolean;
  canDownload: boolean;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: string[];
}

export class ContractDocumentApiService {
  private static baseUrl = '/api/contractdocument';

  // Get document information for a contract
  static async getDocumentInfo(contractId: number): Promise<ApiResponse<ContractDocumentInfo>> {
    try {
      const response = await fetch(`${this.baseUrl}/info/${contractId}`);
      
      if (response.ok) {
        const data = await response.json();
        return { success: true, data };
      } else if (response.status === 404) {
        // Contract not found or no document
        return {
          success: true,
          data: {
            hasDocument: false,
            fileName: '',
            fileSize: 0,
            uploadedAt: null,
            canUpload: false,
            canDownload: false
          }
        };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to fetch contract document information'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error while fetching contract document information'
      };
    }
  }

  // Upload a new contract document
  static async uploadDocument(contractId: number, file: File): Promise<ApiResponse<any>> {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/upload/${contractId}`, {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, message: 'Contract document uploaded successfully' };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to upload contract document'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error while uploading contract document'
      };
    }
  }

  // Replace existing contract document
  static async replaceDocument(contractId: number, file: File): Promise<ApiResponse<any>> {
    try {
      // Validate file before upload
      const validation = this.validateFile(file);
      if (!validation.valid) {
        return { success: false, message: validation.message };
      }

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch(`${this.baseUrl}/replace/${contractId}`, {
        method: 'PUT',
        body: formData,
      });

      if (response.ok) {
        const data = await response.json();
        return { success: true, data, message: 'Contract document replaced successfully' };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to replace contract document'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error while replacing contract document'
      };
    }
  }

  // Download contract document
  static async downloadDocument(contractId: number, fileName?: string): Promise<ApiResponse<Blob>> {
    try {
      const response = await fetch(`${this.baseUrl}/download/${contractId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        
        // Trigger download
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || `contract-${contractId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);

        return { success: true, data: blob, message: 'Contract document downloaded successfully' };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to download contract document'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error while downloading contract document'
      };
    }
  }

  // Delete contract document
  static async deleteDocument(contractId: number): Promise<ApiResponse<any>> {
    try {
      const response = await fetch(`${this.baseUrl}/${contractId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        return { success: true, message: 'Contract document deleted successfully' };
      } else {
        const errorData = await response.json();
        return {
          success: false,
          message: errorData.message || 'Failed to delete contract document'
        };
      }
    } catch (error) {
      return {
        success: false,
        message: 'Network error while deleting contract document'
      };
    }
  }

  // Validate file before upload
  private static validateFile(file: File): { valid: boolean; message?: string } {
    if (!file) {
      return { valid: false, message: 'No file selected' };
    }

    if (file.type !== 'application/pdf') {
      return { valid: false, message: 'Only PDF files are allowed' };
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      return { valid: false, message: 'File size must be less than 10MB' };
    }

    if (file.size === 0) {
      return { valid: false, message: 'File cannot be empty' };
    }

    return { valid: true };
  }

  // Utility function to format file size
  static formatFileSize(bytes: number): string {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  // Utility function to format date
  static formatDate(dateString: string | null): string {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  }

  // Check if phase allows document upload
  static canUploadInPhase(phaseNumber: number): boolean {
    return phaseNumber === 5;
  }

  // Get phase-specific message
  static getPhaseMessage(phaseNumber: number): string {
    if (phaseNumber < 5) {
      return `Contract documents can only be uploaded in Phase 5 (Final Agreement). Current phase: ${phaseNumber}`;
    } else if (phaseNumber === 5) {
      return 'You can now upload the final signed contract document.';
    } else {
      return `Phase ${phaseNumber}: Contract document management is available.`;
    }
  }
}