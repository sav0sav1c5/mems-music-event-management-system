import React, { useState } from 'react';
import { useContractDocument } from '../../performer-negotations/hooks/useContractDocument';
import './ContractDocumentWidget.css';

interface ContractDocumentWidgetProps {
  contractId: number;
  phaseNumber: number;
  compact?: boolean;
  onDocumentChange?: () => void;
}

const ContractDocumentWidget: React.FC<ContractDocumentWidgetProps> = ({
  contractId,
  phaseNumber,
  compact = false,
  onDocumentChange
}) => {
  const { 
    documentInfo, 
    loading, 
    error, 
    uploadDocument, 
    downloadDocument, 
    deleteDocument 
  } = useContractDocument(contractId);

  const [uploading, setUploading] = useState(false);
  const [showUpload, setShowUpload] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== 'application/pdf') {
        alert('Only PDF files are allowed');
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      setSelectedFile(file);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;

    setUploading(true);
    const success = await uploadDocument(contractId, selectedFile, documentInfo?.hasDocument);
    setUploading(false);

    if (success) {
      setSelectedFile(null);
      setShowUpload(false);
      onDocumentChange?.();
    }
  };

  const handleDownload = async () => {
    await downloadDocument(contractId);
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this contract document?')) {
      const success = await deleteDocument(contractId);
      if (success) {
        onDocumentChange?.();
      }
    }
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className={`contract-document-widget ${compact ? 'compact' : ''}`}>
        <div className="loading">Loading...</div>
      </div>
    );
  }

  if (phaseNumber !== 5) {
    return (
      <div className={`contract-document-widget ${compact ? 'compact' : ''}`}>
        <div className="phase-info">
          <span className="phase-badge">Phase {phaseNumber}</span>
          <span className="phase-text">Document upload available in Phase 5</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`contract-document-widget ${compact ? 'compact' : ''}`}>
      <div className="widget-header">
        <h4>Contract Document</h4>
        {error && <div className="error-text">{error}</div>}
      </div>

      {documentInfo?.hasDocument ? (
        <div className="document-status">
          <div className="document-info">
            <div className="file-icon">📄</div>
            <div className="file-details">
              <div className="file-name">{documentInfo.fileName}</div>
              <div className="file-meta">
                {formatFileSize(documentInfo.fileSize)} • 
                {documentInfo.uploadedAt && 
                  new Date(documentInfo.uploadedAt).toLocaleDateString()
                }
              </div>
            </div>
          </div>
          
          <div className="document-actions">
            {documentInfo.canDownload && (
              <button 
                onClick={handleDownload} 
                className="btn btn-sm btn-primary"
                title="Download PDF"
              >
                ⬇️ Download
              </button>
            )}
            
            {documentInfo.canUpload && (
              <>
                <button 
                  onClick={() => setShowUpload(!showUpload)} 
                  className="btn btn-sm btn-secondary"
                  title="Replace document"
                >
                  🔄 Replace
                </button>
                <button 
                  onClick={handleDelete} 
                  className="btn btn-sm btn-danger"
                  title="Delete document"
                >
                  🗑️ Delete
                </button>
              </>
            )}
          </div>
        </div>
      ) : (
        <div className="no-document">
          <div className="no-document-info">
            <div className="empty-icon">📋</div>
            <div className="empty-text">No contract document uploaded</div>
          </div>
          
          {documentInfo?.canUpload && (
            <button 
              onClick={() => setShowUpload(!showUpload)} 
              className="btn btn-primary"
            >
              📁 Upload PDF
            </button>
          )}
        </div>
      )}

      {showUpload && documentInfo?.canUpload && (
        <div className="upload-section">
          <div className="upload-form">
            <label className="file-input-wrapper">
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileSelect}
                className="file-input"
              />
              <span className="file-input-label">
                {selectedFile ? selectedFile.name : 'Choose PDF file...'}
              </span>
            </label>
            
            {selectedFile && (
              <div className="upload-actions">
                <button 
                  onClick={handleUpload} 
                  disabled={uploading}
                  className="btn btn-success"
                >
                  {uploading ? '⏳ Uploading...' : '✅ Upload'}
                </button>
                <button 
                  onClick={() => {
                    setSelectedFile(null);
                    setShowUpload(false);
                  }}
                  className="btn btn-secondary"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
          <div className="upload-info">
            PDF files only, max 10MB
          </div>
        </div>
      )}
    </div>
  );
};

export default ContractDocumentWidget;