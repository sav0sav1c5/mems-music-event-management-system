import React, { useState } from 'react';
import { useContractDocument } from '../hooks/useContractDocument';
import './ContractDocumentManager.css';

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
  const { 
    documentInfo, 
    loading, 
    error, 
    uploadDocument, 
    downloadDocument, 
    deleteDocument 
  } = useContractDocument(contractId);

  // Debug logging
  console.log('ContractDocumentManager - contractId:', contractId);
  console.log('ContractDocumentManager - documentInfo:', documentInfo);
  console.log('ContractDocumentManager - phaseNumber:', phaseNumber);
  console.log('ContractDocumentManager - canUpload:', documentInfo?.canUpload);
  console.log('ContractDocumentManager - hasDocument:', documentInfo?.hasDocument);
  console.log('ContractDocumentManager - showUploadSection:', phaseNumber === 5 && (documentInfo?.canUpload || !documentInfo?.hasDocument));

  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [localError, setLocalError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      validateAndSetFile(file);
    }
  };

  const validateAndSetFile = (file: File) => {
    setLocalError('');
    setSuccess('');

    if (file.type !== 'application/pdf') {
      setLocalError('Only PDF files are allowed');
      return;
    }

    if (file.size > 10 * 1024 * 1024) { // 10MB
      setLocalError('File size must be less than 10MB');
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

  const handleUpload = async () => {
    if (!selectedFile) return;

    try {
      setUploading(true);
      setLocalError('');
      setSuccess('');

      const success = await uploadDocument(contractId, selectedFile, documentInfo?.hasDocument);

      if (success) {
        setSuccess(documentInfo?.hasDocument 
          ? 'Contract document replaced successfully!' 
          : 'Contract document uploaded successfully!');
        setSelectedFile(null);
        onDocumentUploaded?.();
      }
    } catch (err) {
      setLocalError('Error uploading contract document');
      console.error('Upload error:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDownload = async () => {
    await downloadDocument(contractId);
  };

  const handleDelete = async () => {
    if (!window.confirm('Are you sure you want to delete this contract document?')) {
      return;
    }

    const success = await deleteDocument(contractId);
    if (success) {
      setSuccess('Contract document deleted successfully');
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
      
      {(error || localError) && <div className="error-message">{error || localError}</div>}
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
                  onClick={handleDownload}
                  className="btn btn-primary"
                >
                  ⬇️ Download PDF
                </button>
              )}
              
              {documentInfo.canUpload && (
                <button 
                  type={"button" as const}
                  onClick={handleDelete}
                  className="btn btn-danger"
                >
                  🗑️ Delete Document
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

      {(phaseNumber === 5 && (documentInfo?.canUpload || !documentInfo?.hasDocument)) && (
        <div className="upload-section">
          <div 
            className={`file-drop-zone ${dragOver ? 'drag-over' : ''}`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <div className="drop-zone-content">
              <div className="drop-icon">📄</div>
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
                <div className="file-icon">📄</div>
                <div className="file-details">
                  <p><strong>{selectedFile.name}</strong></p>
                  <p>{formatFileSize(selectedFile.size)}</p>
                </div>
                <button 
                  type={"button" as const}
                  onClick={() => setSelectedFile(null)}
                  className="btn btn-link remove-file"
                >
                  ❌
                </button>
              </div>
              
              <div className="upload-actions">
                <button
                  type={"button" as const}
                  onClick={handleUpload}
                  disabled={uploading}
                  className="btn btn-success"
                >
                  {uploading ? (
                    <>⏳ {documentInfo?.hasDocument ? 'Replacing...' : 'Uploading...'}</>
                  ) : (
                    <>📤 {documentInfo?.hasDocument ? 'Replace Document' : 'Upload Document'}</>
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