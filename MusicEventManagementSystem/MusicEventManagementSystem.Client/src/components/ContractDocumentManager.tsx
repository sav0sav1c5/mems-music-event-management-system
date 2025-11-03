import React, { useState, useEffect } from 'react';
import './ContractDocumentManager.css';

interface ContractDocument {
  hasDocument: boolean;
  fileName: string;
  fileSize: number;
  uploadedAt: string | null;
  canUpload: boolean;
  canDownload: boolean;
}

interface ContractDocumentManagerProps {
  contractId: number;
  phaseNumber: number;
  onDocumentUploaded?: () => void;
}

const ContractDocumentManager: React.FC<ContractDocumentManagerProps> = ({
  contractId,
  phaseNumber,
  onDocumentUploaded
}) => {
  const [documentInfo, setDocumentInfo] = useState<ContractDocument | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  useEffect(() => {
    fetchDocumentInfo();
  }, [contractId]);

  const fetchDocumentInfo = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/contractdocument/info/${contractId}`);
      
      if (response.ok) {
        const data = await response.json();
        setDocumentInfo(data);
      } else {
        setError('Failed to fetch contract document information');
      }
    } catch (err) {
      setError('Error fetching contract document information');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setError('');
    setSuccess('');

    if (file.type !== 'application/pdf') {
      setError('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setError('File size must be less than 10MB');
      return;
    }

    setSelectedFile(file);
  };

  const handleDragOver = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (event: React.DragEvent) => {
    event.preventDefault();
    setDragOver(false);
    
    const file = event.dataTransfer.files[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const uploadDocument = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setError('');
      setSuccess('');

      const formData = new FormData();
      formData.append('file', selectedFile);

      const endpoint = documentInfo?.hasDocument 
        ? `/api/contractdocument/replace/${contractId}`
        : `/api/contractdocument/upload/${contractId}`;

      const method = documentInfo?.hasDocument ? 'PUT' : 'POST';

      const response = await fetch(endpoint, {
        method,
        body: formData,
      });

      if (response.ok) {
        await response.json(); // Parse response but don't store if not needed
        setSuccess(documentInfo?.hasDocument 
          ? 'Contract document replaced successfully!' 
          : 'Contract document uploaded successfully!');
        setSelectedFile(null);
        await fetchDocumentInfo();
        onDocumentUploaded?.();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to upload contract document');
      }
    } catch (err) {
      setError('Error uploading contract document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const downloadDocument = async () => {
    try {
      const response = await fetch(`/api/contractdocument/download/${contractId}`);
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = documentInfo?.fileName || 'contract.pdf';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        setError('Failed to download contract document');
      }
    } catch (err) {
      setError('Error downloading contract document');
      console.error('Download error:', err);
    }
  };

  const deleteDocument = async () => {
    if (!window.confirm('Are you sure you want to delete this contract document?')) {
      return;
    }

    try {
      const response = await fetch(`/api/contractdocument/${contractId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setSuccess('Contract document deleted successfully');
        await fetchDocumentInfo();
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Failed to delete contract document');
      }
    } catch (err) {
      setError('Error deleting contract document');
      console.error('Delete error:', err);
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatDate = (dateString: string | null): string => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="contract-document-manager">
        <div className="loading">Loading contract document information...</div>
      </div>
    );
  }

  if (phaseNumber !== 5) {
    return (
      <div className="contract-document-manager">
        <div className="phase-warning">
          <h3>Contract Document Upload</h3>
          <p>Contract documents can only be uploaded in Phase 5 (Final Agreement).</p>
          <p>Current phase: {phaseNumber}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="contract-document-manager">
      <h3>Contract Document Management</h3>
      
      {error && <div className="error-message">{error}</div>}
      {success && <div className="success-message">{success}</div>}

      {documentInfo?.hasDocument ? (
        <div className="existing-document">
          <div className="document-info">
            <h4>Current Contract Document</h4>
            <div className="document-details">
              <p><strong>File:</strong> {documentInfo.fileName}</p>
              <p><strong>Size:</strong> {formatFileSize(documentInfo.fileSize)}</p>
              <p><strong>Uploaded:</strong> {formatDate(documentInfo.uploadedAt)}</p>
            </div>
            
            <div className="document-actions">
              {documentInfo.canDownload && (
                <button 
                  type={"button" as const}
                  onClick={downloadDocument}
                  className="btn btn-primary"
                >
                  <i className="fas fa-download"></i> Download PDF
                </button>
              )}
              
              {documentInfo.canUpload && (
                <button 
                  type={"button" as const}
                  onClick={deleteDocument}
                  className="btn btn-danger"
                >
                  <i className="fas fa-trash"></i> Delete Document
                </button>
              )}
            </div>
          </div>
          
          {documentInfo.canUpload && (
            <div className="replace-document">
              <h4>Replace Contract Document</h4>
              <p className="help-text">Upload a new PDF to replace the current contract document.</p>
            </div>
          )}
        </div>
      ) : (
        <div className="no-document">
          <div className="upload-info">
            <h4>No Contract Document</h4>
            <p>Upload the final contract PDF document for this agreement.</p>
          </div>
        </div>
      )}

      {documentInfo?.canUpload && (
        <div className="upload-section">
          <div 
            className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <i className="fas fa-file-pdf drop-icon"></i>
              <p>Drag and drop your PDF file here, or</p>
              <label className="file-input-label">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="file-input"
                />
                <span className="btn btn-secondary">Choose File</span>
              </label>
              <p className="file-requirements">
                PDF files only, maximum 10MB
              </p>
            </div>
          </div>

          {selectedFile && (
            <div className="selected-file">
              <div className="file-preview">
                <i className="fas fa-file-pdf"></i>
                <div className="file-details">
                  <p><strong>{selectedFile.name}</strong></p>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
                <button 
                  type={"button" as const}
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-link remove-file"
                >
                  <i className="fas fa-times"></i>
                </button>
              </div>
              
              <div className="upload-actions">
                <button
                  type={"button" as const}
                  onClick={uploadDocument}
                  disabled={uploading}
                  className="btn btn-success"
                >
                  {uploading ? (
                    <>
                      <i className="fas fa-spinner fa-spin"></i> 
                      {documentInfo?.hasDocument ? 'Replacing...' : 'Uploading...'}
                    </>
                  ) : (
                    <>
                      <i className="fas fa-upload"></i> 
                      {documentInfo?.hasDocument ? 'Replace Document' : 'Upload Document'}
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {!documentInfo?.canUpload && documentInfo?.hasDocument && (
        <div className="upload-disabled">
          <p className="help-text">
            Document upload/replacement is only available in Phase 5 (Final Agreement).
          </p>
        </div>
      )}
    </div>
  );
};

export default ContractDocumentManager;