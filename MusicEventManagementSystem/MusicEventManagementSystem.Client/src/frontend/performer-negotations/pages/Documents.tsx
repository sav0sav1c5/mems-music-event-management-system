import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  Search, 
  ExternalLink, 
  ChevronLeft 
} from 'lucide-react';
import ContractDocumentWidget from '../components/ContractDocumentWidget';
import ContractDocumentManager from '../components/ContractDocumentManager';
import { contractService } from '../services/contractService';
import type { ContractDto } from '../services/contractService';

const Documents: React.FC = () => {
  const [contracts, setContracts] = useState<ContractDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [selectedContract, setSelectedContract] = useState<ContractDto | null>(null);
  const [showDocumentManager, setShowDocumentManager] = useState(false);

  useEffect(() => {
    loadContracts();
  }, []);

  const loadContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getAllContracts();
      setContracts(data);
      setError(null);
    } catch (err) {
      setError('Failed to load contracts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = 
      contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.performerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      contract.eventTitle?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === 'All' || contract.status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const toggleRowExpansion = (contractId: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(contractId)) {
      newExpanded.delete(contractId);
    } else {
      newExpanded.add(contractId);
    }
    setExpandedRows(newExpanded);
  };

  const getStatusColor = (status: string) => {
    switch (status?.toLowerCase()) {
      case 'signed':
        return 'bg-green-900/30 text-green-300';
      case 'active':
        return 'bg-purple-900/30 text-purple-300';
      case 'draft':
        return 'bg-yellow-900/30 text-yellow-300';
      case 'pending':
        return 'bg-blue-900/30 text-blue-300';
      default:
        return 'bg-neutral-700 text-neutral-300';
    }
  };

  const getPhaseForContract = (contract: ContractDto): number => {
    switch (contract.status?.toLowerCase()) {
      case 'draft':
        return 3;
      case 'pending':
        return 4;
      case 'signed':
      case 'active':
        return 5;
      default:
        return 3;
    }
  };

  const handleDocumentUploaded = () => {
    loadContracts();
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-neutral-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-neutral-400">Loading contracts...</p>
        </div>
      </div>
    );
  }

  if (showDocumentManager && selectedContract) {
    return (
      <div className="min-h-screen bg-neutral-900 text-white p-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <div className="flex items-center gap-4 mb-4">
              <button
                onClick={() => setShowDocumentManager(false)}
                className="flex items-center gap-2 px-4 py-2 bg-neutral-800 hover:bg-neutral-700 rounded-lg transition-colors text-neutral-300 hover:text-white"
              >
                <ChevronLeft className="w-4 h-4" />
                Back to Documents
              </button>
            </div>
            <h1 className="text-3xl font-bold text-white mb-2">Document Management</h1>
            <p className="text-neutral-400">
              Managing documents for: <span className="text-white font-medium">{selectedContract.title}</span>
            </p>
            <div className="mt-2 flex items-center gap-4 text-sm text-neutral-400">
              <span>Contract ID: {selectedContract.contractId}</span>
              <span>Status: <span className={`px-2 py-1 rounded text-xs ${getStatusColor(selectedContract.status)}`}>{selectedContract.status}</span></span>
              <span>Phase: {getPhaseForContract(selectedContract)}</span>
            </div>
          </div>

          <ContractDocumentManager
            contractId={selectedContract.contractId}
            phaseNumber={getPhaseForContract(selectedContract)}
            onDocumentUploaded={handleDocumentUploaded}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-900 text-white p-6">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Contract Documents</h1>
            <p className="text-neutral-400">Manage all contract documents and agreements</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search contracts, performers, or events..."
              value={searchTerm}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white placeholder-neutral-400"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e: React.ChangeEvent<HTMLSelectElement>) => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-neutral-800 border border-neutral-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 text-white"
          >
            <option value="All">All Statuses</option>
            <option value="Signed">Signed</option>
            <option value="Draft">Draft</option>
            <option value="Pending">Pending</option>
            <option value="Active">Active</option>
          </select>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Total Contracts</p>
                <p className="text-2xl font-bold text-white">{contracts.length}</p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>
          
          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Signed</p>
                <p className="text-2xl font-bold text-green-400">
                  {contracts.filter(d => d.status === 'Signed').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-green-400" />
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Active</p>
                <p className="text-2xl font-bold text-purple-400">
                  {contracts.filter(d => d.status === 'Active').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-purple-400" />
            </div>
          </div>

          <div className="bg-neutral-800 p-4 rounded-lg border border-neutral-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-neutral-400 text-sm">Drafts</p>
                <p className="text-2xl font-bold text-yellow-400">
                  {contracts.filter(d => d.status === 'Draft').length}
                </p>
              </div>
              <FileText className="w-8 h-8 text-yellow-400" />
            </div>
          </div>
        </div>
      </div>

      {error && (
        <div className="mb-6 p-4 bg-red-900/20 border border-red-500/30 rounded-lg text-red-400">
          {error}
        </div>
      )}

      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-neutral-700">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Contract
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Performer
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Event
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Phase
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-neutral-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-700">
              {filteredContracts.map((contract) => (
                <React.Fragment key={contract.contractId}>
                  <tr className="hover:bg-neutral-700/50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {contract.title}
                        </div>
                        <div className="text-sm text-neutral-400">
                          ID: {contract.contractId}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {contract.performerName || 'N/A'}
                      </div>
                      <div className="text-sm text-neutral-400">
                        ID: {contract.performerId}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-white">
                        {contract.eventTitle || 'N/A'}
                      </div>
                      <div className="text-sm text-neutral-400">
                        {contract.eventLocation || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(contract.status)}`}>
                        {contract.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-purple-900/30 text-purple-300">
                        Phase {getPhaseForContract(contract)}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => toggleRowExpansion(contract.contractId)}
                          className="text-purple-400 hover:text-purple-300 transition-colors"
                        >
                          <FileText className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedContract(contract);
                            setShowDocumentManager(true);
                          }}
                          className="text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                  
                  {expandedRows.has(contract.contractId) && (
                    <tr>
                      <td colSpan={6} className="px-6 py-4 bg-neutral-800/50">
                        <div className="border-l-2 border-purple-500 pl-4">
                          <h4 className="text-white font-medium mb-2">Contract Documents</h4>
                          <ContractDocumentWidget
                            contractId={contract.contractId}
                            phaseNumber={getPhaseForContract(contract)}
                            onDocumentChange={handleDocumentUploaded}
                          />
                        </div>
                      </td>
                    </tr>
                  )}
                </React.Fragment>
              ))}
            </tbody>
          </table>
        </div>

        {filteredContracts.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-400 mb-2">No contracts found</h3>
            <p className="text-neutral-500 mb-6">
              {searchTerm || statusFilter !== 'All' 
                ? 'Try adjusting your search or filters.' 
                : 'Create your first contract to get started.'
              }
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Documents;
