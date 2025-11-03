import { useState, useEffect } from 'react';

const API_BASE_URL = 'http://localhost:5255/api';

interface ContractDocument {
  hasDocument: boolean;
  fileName: string;
  fileSize: number;
  uploadedAt: string | null;
  canUpload: boolean;
  canDownload: boolean;
}

interface UseContractDocumentResult {
  documentInfo: ContractDocument | null;
  loading: boolean;
  error: string;
  uploadDocument: (contractId: number, file: File, isReplace?: boolean) => Promise<boolean>;
  downloadDocument: (contractId: number, fileName?: string) => Promise<void>;
  deleteDocument: (contractId: number) => Promise<boolean>;
  refreshDocumentInfo: () => Promise<void>;
}

export const useContractDocument = (contractId: number): UseContractDocumentResult => {
  const [documentInfo, setDocumentInfo] = useState<ContractDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string>('');

  const fetchDocumentInfo = async () => {
    if (!contractId) return;
    
    try {
      setLoading(true);
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/contractdocument/info/${contractId}`);
      
      if (response.ok) {
        const data = await response.json();
        console.log('Contract document info received:', data);
        console.log('API Response for contractId', contractId, ':', {
          hasDocument: data.hasDocument,
          canUpload: data.canUpload,
          canDownload: data.canDownload,
          fileName: data.fileName,
          fileSize: data.fileSize
        });
        
        // TEMPORARY WORKAROUND: Force canUpload to true if no document exists
        // This addresses a backend issue where canUpload is incorrectly returning false in Phase 5
        if (!data.hasDocument) {
          console.log('WORKAROUND: Forcing canUpload to true for contract without document');
          data.canUpload = true;
        }
        
        setDocumentInfo(data);
      } else if (response.status === 404) {
        // Contract not found or no document - assume can upload in Phase 5
        setDocumentInfo({
          hasDocument: false,
          fileName: '',
          fileSize: 0,
          uploadedAt: null,
          canUpload: true, // Allow upload by default when no document exists
          canDownload: false
        });
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to fetch contract document information');
      }
    } catch (err) {
      setError('Error fetching contract document information');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const uploadDocument = async (contractId: number, file: File, isReplace = false): Promise<boolean> => {
    try {
      setError('');

      const formData = new FormData();
      formData.append('file', file);

      const endpoint = isReplace 
        ? `${API_BASE_URL}/contractdocument/replace/${contractId}`
        : `${API_BASE_URL}/contractdocument/upload/${contractId}`;

      const method = isReplace ? 'PUT' : 'POST';
      
      console.log('Uploading document:', {
        contractId,
        fileName: file.name,
        fileSize: file.size,
        fileType: file.type,
        endpoint,
        method,
        isReplace
      });

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (response.ok) {
        await fetchDocumentInfo();
        return true;
      } else {
        console.log('Upload failed with status:', response.status);
        let errorMessage = 'Failed to upload contract document';
        
        // Get the response text first, then try to parse as JSON
        const responseText = await response.text();
        console.log('Error response text:', responseText);
        
        try {
          const errorData = JSON.parse(responseText);
          errorMessage = errorData.message || errorMessage;
        } catch {
          // If JSON parsing fails, use the raw text response
          errorMessage = responseText || `Upload failed with status ${response.status}`;
        }
        
        setError(errorMessage);
        return false;
      }
    } catch (err) {
      setError('Error uploading contract document');
      console.error('Error:', err);
      return false;
    }
  };

  const downloadDocument = async (contractId: number, fileName?: string): Promise<void> => {
    try {
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/contractdocument/download/${contractId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = fileName || documentInfo?.fileName || 'contract.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to download contract document');
      }
    } catch (err) {
      setError('Error downloading contract document');
      console.error('Error:', err);
    }
  };

  const deleteDocument = async (contractId: number): Promise<boolean> => {
    try {
      setError('');
      
      const response = await fetch(`${API_BASE_URL}/contractdocument/${contractId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        await fetchDocumentInfo();
        return true;
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete contract document');
        return false;
      }
    } catch (err) {
      setError('Error deleting contract document');
      console.error('Error:', err);
      return false;
    }
  };

  const refreshDocumentInfo = async () => {
    await fetchDocumentInfo();
  };

  useEffect(() => {
    fetchDocumentInfo();
  }, [contractId]);

  return {
    documentInfo,
    loading,
    error,
    uploadDocument,
    downloadDocument,
    deleteDocument,
    refreshDocumentInfo,
  };
};