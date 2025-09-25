import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, FileText, ArrowUp, ArrowDown, CheckCircle, Clock } from "lucide-react";
import { requirementService } from "../services/requirementService";
import type { RequirementDto } from "../services/requirementService";

const Requirements = () => {
  const [requirements, setRequirements] = useState<RequirementDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingRequirement, setEditingRequirement] = useState<RequirementDto | null>(null);
  const [formData, setFormData] = useState<Omit<RequirementDto, 'requirementId' | 'createdAt'>>({
    title: '',
    description: '',
    fulfilled: false,
  });

  useEffect(() => {
    fetchRequirements();
  }, []);

  const fetchRequirements = async () => {
    try {
      setLoading(true);
      const data = await requirementService.getAllRequirements();
      setRequirements(data);
    } catch (err) {
      setError('Failed to fetch requirements');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingRequirement) {
        const updated = await requirementService.updateRequirement(
          editingRequirement.requirementId,
          { ...formData, requirementId: editingRequirement.requirementId, createdAt: editingRequirement.createdAt }
        );
        setRequirements(prev => 
          prev.map(item => item.requirementId === updated.requirementId ? updated : item)
        );
      } else {
        const created = await requirementService.createRequirement(formData);
        setRequirements(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save requirement');
      console.error(err);
    }
  };

  const handleEdit = (requirement: RequirementDto) => {
    setEditingRequirement(requirement);
    setFormData({
      title: requirement.title,
      description: requirement.description,
      fulfilled: requirement.fulfilled,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this requirement?')) {
      try {
        await requirementService.deleteRequirement(id);
        setRequirements(prev => prev.filter(item => item.requirementId !== id));
      } catch (err) {
        setError('Failed to delete requirement');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      description: '',
      fulfilled: false,
    });
    setEditingRequirement(null);
    setIsModalOpen(false);
  };

  const formatDate = (date: Date | string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const stats = [
    {
      title: "Fulfilled",
      value: requirements.filter(r => r.fulfilled).length.toString(),
      change: "+18.3%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Pending",
      value: requirements.filter(r => !r.fulfilled).length.toString(),
      change: "+5.2%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Total Requirements",
      value: requirements.length.toString(),
      change: "+12.1%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Completion Rate",
      value: requirements.length > 0 ? `${Math.round((requirements.filter(r => r.fulfilled).length / requirements.length) * 100)}%` : '0%',
      change: "+8.7%",
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
        <h1 className="text-2xl font-bold text-white mb-1">Requirements</h1>
        <p className="text-neutral-400 text-sm">
          Manage project requirements and track their fulfillment.
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
          <h2 className="text-xl font-bold text-white">All Requirements</h2>
          <p className="text-neutral-400 text-sm">Create and manage requirements</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
        >
          <Plus className="w-4 h-4" />
          Add Requirement
        </button>
      </div>

      {/* Requirements Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl hover:border-lime-400/30 transition-all duration-200 flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-700">
              <tr>
                <th className="text-left p-4 pl-10 text-neutral-300 font-semibold">ID</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Title</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Description</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Status</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Created</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {requirements.map((requirement) => (
                <tr key={requirement.requirementId} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-all duration-200">
                  <td className="p-4 pl-10 text-white font-semibold">{requirement.requirementId}</td>
                  <td className="p-4 text-white font-medium">{requirement.title}</td>
                  <td className="p-4 text-neutral-300 max-w-xs truncate">{requirement.description}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${
                      requirement.fulfilled ? 'bg-lime-950/50 text-lime-400 border-lime-900/50' :
                      'bg-orange-950/50 text-orange-400 border-orange-900/50'
                    }`}>
                      {requirement.fulfilled ? 'Fulfilled' : 'Pending'}
                    </span>
                  </td>
                  <td className="p-4 text-neutral-300">{formatDate(requirement.createdAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(requirement)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(requirement.requirementId)}
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

        {requirements.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No requirements found. Create your first requirement!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingRequirement ? 'Edit Requirement' : 'Add New Requirement'}
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
                  placeholder="Enter requirement title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter requirement description"
                  rows={4}
                  required
                />
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="fulfilled"
                  checked={formData.fulfilled}
                  onChange={(e) => setFormData(prev => ({ ...prev, fulfilled: e.target.checked }))}
                  className="w-4 h-4 text-lime-400 bg-neutral-800 border-neutral-700 rounded focus:ring-lime-400 focus:ring-2"
                />
                <label htmlFor="fulfilled" className="text-sm font-medium text-neutral-300">
                  Fulfilled
                </label>
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
                  {editingRequirement ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Requirements;
