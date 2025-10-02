import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, FileText, ArrowUp, ArrowDown, CheckCircle, Clock } from "lucide-react";
import { contractService } from "../services/contractService";
import type { ContractDto, CreateContractDto } from "../services/contractService";

const Contracts = () => {
  const [contracts, setContracts] = useState<ContractDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingContract, setEditingContract] = useState<ContractDto | null>(null);
  const [formData, setFormData] = useState<CreateContractDto>({
    title: '',
    contractType: '',
    price: 0,
    version: '',
    status: '',
    performerId: 0,
  });

  useEffect(() => {
    fetchContracts();
  }, []);

  const fetchContracts = async () => {
    try {
      setLoading(true);
      const data = await contractService.getAllContracts();
      setContracts(data);
    } catch (err) {
      setError('Failed to fetch contracts');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingContract) {
        const updated = await contractService.updateContract(
          editingContract.contractId,
          formData
        );
        setContracts(prev => 
          prev.map(item => item.contractId === updated.contractId ? updated : item)
        );
      } else {
        const created = await contractService.createContract(formData);
        setContracts(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save contract');
      console.error(err);
    }
  };

  const handleEdit = (contract: ContractDto) => {
    setEditingContract(contract);
    setFormData({
      title: contract.title,
      contractType: contract.contractType,
      price: contract.price,
      version: contract.version,
      status: contract.status,
      performerId: contract.performerId,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this contract?')) {
      try {
        await contractService.deleteContract(id);
        setContracts(prev => prev.filter(item => item.contractId !== id));
      } catch (err) {
        setError('Failed to delete contract');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      contractType: '',
      price: 0,
      version: '',
      status: '',
      performerId: 0,
    });
    setEditingContract(null);
    setIsModalOpen(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(price);
  };

  const stats = [
    {
      title: "Active Contracts",
      value: contracts.filter(c => c.status === 'Active').length.toString(),
      change: "+15.2%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Pending",
      value: contracts.filter(c => c.status === 'Pending').length.toString(),
      change: "+8.7%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Signed",
      value: contracts.filter(c => c.signedAt).length.toString(),
      change: "+12.3%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Total Value",
      value: formatPrice(contracts.reduce((sum, contract) => sum + contract.price, 0)),
      change: "+18.5%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Contracts</h1>
        <p className="text-neutral-400 text-sm">
          Manage contracts and track their status.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3 mb-4">
        {stats.map((stat, index) => (
          <div key={index} className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl p-3 hover:border-lime-400/30 transition-all duration-200 group">
            <div className="flex items-center justify-between mb-2">
              <div className={`p-2 rounded-lg ${stat.color === 'lime' ? 'bg-lime-400/20 text-lime-400' : 
                                                stat.color === 'blue' ? 'bg-blue-400/20 text-blue-400' :
                                                stat.color === 'purple' ? 'bg-purple-400/20 text-purple-400' :
                                                'bg-orange-400/20 text-orange-400'}`}>
                {stat.icon}
              </div>
              <div className={`flex items-center gap-1 text-xs font-medium ${
                stat.trend === 'up' ? 'text-lime-400' : 'text-red-400'
              }`}>
                {stat.trend === 'up' ? <ArrowUp className="w-3 h-3" /> : <ArrowDown className="w-3 h-3" />}
                {stat.change}
              </div>
            </div>
            <div>
              <p className="text-neutral-400 text-xs mb-1">{stat.title}</p>
              <h3 className="text-lg font-bold text-white group-hover:text-lime-400 transition-colors">
                {stat.value}
              </h3>
            </div>
          </div>
        ))}
      </div>

      {/* Header with Add Button */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">All Contracts</h2>
          <p className="text-neutral-400 text-sm">Create and manage contracts</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
        >
          <Plus className="w-4 h-4" />
          Add Contract
        </button>
      </div>

      {/* Contracts Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl hover:border-lime-400/30 transition-all duration-200 flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-700">
              <tr>
                <th className="text-left p-4 pl-10 text-neutral-300 font-semibold">ID</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Title</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Type</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Price</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Status</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Version</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Created</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {contracts.map((contract) => (
                <tr key={contract.contractId} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-all duration-200">
                  <td className="p-4 pl-10 text-white font-semibold">{contract.contractId}</td>
                  <td className="p-4 text-white font-medium">{contract.title}</td>
                  <td className="p-4 text-neutral-300">{contract.contractType}</td>
                  <td className="p-4 font-semibold text-lime-400">{formatPrice(contract.price)}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      contract.status === 'Active' ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                      contract.status === 'Pending' ? 'bg-blue-950/50 text-blue-400 border-blue-900/50' :
                      contract.status === 'Signed' ? 'bg-purple-950/50 text-purple-400 border-purple-900/50' :
                      'bg-orange-950/50 text-orange-400 border-orange-900/50'
                    }`}>
                      {contract.status || 'Unknown'}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300">{contract.version}</td>
                  <td className="p-4 text-neutral-300">{formatDate(contract.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(contract)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(contract.contractId)}
                        className="p-1.5 hover:bg-red-900/50 rounded-lg transition-all duration-200 text-neutral-400 hover:text-red-400 border border-transparent hover:border-red-400/30"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {contracts.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No contracts found. Create your first contract!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingContract ? 'Edit Contract' : 'Add New Contract'}
              </h2>
              <button
                onClick={resetForm}
                className="p-2 hover:bg-neutral-800 rounded-xl transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Title</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter contract title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Contract Type</label>
                <select
                  value={formData.contractType}
                  onChange={(e) => setFormData(prev => ({ ...prev, contractType: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="">Select contract type</option>
                  <option value="Performance">Performance</option>
                  <option value="Recording">Recording</option>
                  <option value="Exclusive">Exclusive</option>
                  <option value="Non-Exclusive">Non-Exclusive</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Price</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.price}
                  onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter contract price"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Version</label>
                <input
                  type="text"
                  value={formData.version}
                  onChange={(e) => setFormData(prev => ({ ...prev, version: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="e.g., 1.0"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="">Select status</option>
                  <option value="Draft">Draft</option>
                  <option value="Pending">Pending</option>
                  <option value="Active">Active</option>
                  <option value="Signed">Signed</option>
                  <option value="Expired">Expired</option>
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={resetForm}
                  className="flex-1 p-3 bg-neutral-800 hover:bg-neutral-700 rounded-xl transition-all duration-200 text-white border border-neutral-700 hover:border-neutral-500"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
                >
                  {editingContract ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Contracts;
