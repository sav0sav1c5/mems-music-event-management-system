import React from 'react';
import ContractDocumentManager from '../components/ContractDocumentManager';
import ContractDocumentWidget from '../components/ContractDocumentWidget';

// Example 1: Full contract document management page
const ContractDocumentPage: React.FC = () => {
  const contractId = 123; // This would come from route params or props
  const phaseNumber = 5; // This would come from contract data

  const handleDocumentUploaded = () => {
    console.log('Document uploaded successfully');
    // Refresh other contract data if needed
  };

  return (
    <div className="contract-document-page">
      <div className="page-header">
        <h1>Contract Document Management</h1>
        <p>Manage PDF documents for contract #{contractId}</p>
      </div>

      <ContractDocumentManager
        contractId={contractId}
        phaseNumber={phaseNumber}
        onDocumentUploaded={handleDocumentUploaded}
      />
    </div>
  );
};

// Example 2: Contract details view with document widget
interface ContractDetailsProps {
  contract: {
    id: number;
    title: string;
    status: string;
    phaseNumber: number;
    // ... other contract properties
  };
}

const ContractDetailsView: React.FC<ContractDetailsProps> = ({ contract }) => {
  const handleDocumentChange = () => {
    console.log('Contract document changed');
    // Refresh contract status or other related data
  };

  return (
    <div className="contract-details">
      <div className="contract-header">
        <h2>{contract.title}</h2>
        <span className="status-badge">{contract.status}</span>
      </div>

      <div className="contract-sections">
        {/* Other contract sections */}
        <div className="contract-section">
          <h3>Contract Terms</h3>
          {/* Contract terms content */}
        </div>

        <div className="contract-section">
          <h3>Performance Details</h3>
          {/* Performance details content */}
        </div>

        {/* Document widget integrated into the contract view */}
        <div className="contract-section">
          <ContractDocumentWidget
            contractId={contract.id}
            phaseNumber={contract.phaseNumber}
            onDocumentChange={handleDocumentChange}
          />
        </div>
      </div>
    </div>
  );
};

// Example 3: Contracts list with compact document widgets
interface ContractsListProps {
  contracts: Array<{
    id: number;
    title: string;
    performerName: string;
    eventName: string;
    phaseNumber: number;
    status: string;
  }>;
}

const ContractsList: React.FC<ContractsListProps> = ({ contracts }) => {
  return (
    <div className="contracts-list">
      <h2>Active Contracts</h2>
      
      {contracts.map(contract => (
        <div key={contract.id} className="contract-card">
          <div className="contract-info">
            <h4>{contract.title}</h4>
            <p>
              <strong>Performer:</strong> {contract.performerName} |{' '}
              <strong>Event:</strong> {contract.eventName}
            </p>
            <span className="phase-indicator">Phase {contract.phaseNumber}</span>
          </div>

          {/* Compact document widget for each contract */}
          <ContractDocumentWidget
            contractId={contract.id}
            phaseNumber={contract.phaseNumber}
            compact={true}
            onDocumentChange={() => {
              console.log(`Document changed for contract ${contract.id}`);
            }}
          />
        </div>
      ))}
    </div>
  );
};

// Example 4: Phase 5 specific contract finalization
const ContractFinalizationPage: React.FC = () => {
  const contractId = 456; // From route params
  const phaseNumber = 5;

  return (
    <div className="contract-finalization">
      <div className="finalization-header">
        <h1>Finalize Contract</h1>
        <p>Upload the signed contract document to complete the agreement.</p>
      </div>

      <div className="finalization-steps">
        <div className="step completed">
          <span className="step-number">1</span>
          <span className="step-title">Negotiations Complete</span>
        </div>
        <div className="step completed">
          <span className="step-number">2</span>
          <span className="step-title">Terms Agreed</span>
        </div>
        <div className="step active">
          <span className="step-number">3</span>
          <span className="step-title">Upload Signed Contract</span>
        </div>
      </div>

      <ContractDocumentManager
        contractId={contractId}
        phaseNumber={phaseNumber}
        onDocumentUploaded={() => {
          console.log('Contract finalized with document upload');
          // Redirect to success page or update contract status
        }}
      />
    </div>
  );
};

// Export components for use in routing
export {
  ContractDocumentPage,
  ContractDetailsView,
  ContractsList,
  ContractFinalizationPage
};