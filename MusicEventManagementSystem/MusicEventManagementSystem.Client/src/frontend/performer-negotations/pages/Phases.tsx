import React, { useState } from 'react';
import { Edit, Eye, X, Plus, Trash2, AlertCircle, CheckSquare } from "lucide-react";
import { FIXED_PHASES } from "../services/phaseService";
import type { FixedPhaseTemplate } from "../services/phaseService";

const Phases = () => {
  // Component state
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<FixedPhaseTemplate | null>(null);
  
  // Form state for editing
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    estimatedDuration: '',
    requirements: [] as string[]
  });

  // Requirements form state
  const [newRequirement, setNewRequirement] = useState('');

  // Handler to open edit modal
  const handleEdit = (phase: FixedPhaseTemplate) => {
    setSelectedPhase(phase);
    setEditFormData({
      name: phase.name,
      description: phase.description,
      estimatedDuration: formatDurationForDisplay(phase.estimatedDuration),
      requirements: [...phase.defaultRequirements]
    });
    setIsEditModalOpen(true);
  };

  // Handler to open details modal
  const handleViewDetails = async (phase: FixedPhaseTemplate) => {
    setSelectedPhase(phase);
    setIsDetailsModalOpen(true);
    // In a real implementation, you would fetch actual requirements from backend
    // For now, we'll use the default requirements from the phase template
  };

  // Handle edit form submission
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhase) return;

    try {
      setLoading(true);
      // In a real implementation, you would update the phase in the backend
      // For now, we'll just show a success message
      setSuccessMessage(`${selectedPhase.name} phase updated successfully!`);
      setIsEditModalOpen(false);
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      setError('Failed to update phase');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  // Add new requirement
  const handleAddRequirement = () => {
    if (newRequirement.trim()) {
      setEditFormData(prev => ({
        ...prev,
        requirements: [...prev.requirements, newRequirement.trim()]
      }));
      setNewRequirement('');
    }
  };

  // Remove requirement
  const handleRemoveRequirement = (index: number) => {
    setEditFormData(prev => ({
      ...prev,
      requirements: prev.requirements.filter((_, i) => i !== index)
    }));
  };

  // Format duration for display (convert from TimeSpan to days)
  const formatDurationForDisplay = (duration: string): string => {
    // Convert TimeSpan format (e.g., "3.00:00:00") to days
    const days = duration.split('.')[0];
    return days || '0';
  };



  // Close modals
  const closeModals = () => {
    setIsEditModalOpen(false);
    setIsDetailsModalOpen(false);
    setSelectedPhase(null);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-neutral-900 to-neutral-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-pink-400 mb-2">
              Event Phases Workflow
            </h1>
            <p className="text-neutral-300 text-lg">
              Manage the 5 fixed phases of event negotiation and planning
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-3">
            <CheckSquare className="h-5 w-5 text-green-400" />
            <span className="text-green-200">{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-red-200">{error}</span>
          </div>
        )}

        {/* Phases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {FIXED_PHASES.map((phase) => (
            <div
              key={phase.orderNumber}
              className="bg-neutral-800/50 backdrop-blur-sm rounded-xl border border-neutral-700/50 p-6 hover:bg-neutral-700/30 transition-all duration-200"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {phase.orderNumber}
                  </div>
                  <h3 className="text-white font-semibold text-lg">{phase.name}</h3>
                </div>
              </div>

              <p className="text-neutral-300 text-sm mb-4 leading-relaxed">
                {phase.description}
              </p>

              <div className="flex items-center justify-between text-sm text-neutral-400 mb-4">
                <span>Duration: {formatDurationForDisplay(phase.estimatedDuration)} days</span>
                <span>{phase.defaultRequirements.length} requirements</span>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleEdit(phase)}
                  className="flex-1 bg-blue-500 hover:bg-blue-600 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Edit className="h-4 w-4" />
                  <span>Edit</span>
                </button>
                <button
                  onClick={() => handleViewDetails(phase)}
                  className="flex-1 bg-neutral-600 hover:bg-neutral-700 text-white px-3 py-2 rounded-lg transition-colors flex items-center justify-center space-x-2"
                >
                  <Eye className="h-4 w-4" />
                  <span>Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Edit Modal */}
        {isEditModalOpen && selectedPhase && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <h2 className="text-2xl font-bold text-white">
                    Edit Phase: {selectedPhase.name}
                  </h2>
                  <button
                    onClick={closeModals}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <form onSubmit={handleEditSubmit} className="space-y-6">
                  <div>
                    <label className="block text-white font-medium mb-2">Phase Name</label>
                    <input
                      type="text"
                      value={editFormData.name}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                      className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Description</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent h-24 resize-none"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-2">Estimated Duration (days)</label>
                    <input
                      type="number"
                      value={editFormData.estimatedDuration}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                      className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-white font-medium mb-3">Requirements</label>
                    <div className="space-y-3">
                      {editFormData.requirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-neutral-700/50 p-3 rounded-lg">
                          <span className="flex-1 text-white">{req}</span>
                          <button
                            type="button"
                            onClick={() => handleRemoveRequirement(index)}
                            className="text-red-400 hover:text-red-300 transition-colors"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      ))}
                      
                      <div className="flex items-center space-x-3">
                        <input
                          type="text"
                          value={newRequirement}
                          onChange={(e) => setNewRequirement(e.target.value)}
                          placeholder="Add new requirement..."
                          className="flex-1 p-3 bg-neutral-700 border border-neutral-600 rounded-lg text-white focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddRequirement())}
                        />
                        <button
                          type="button"
                          onClick={handleAddRequirement}
                          className="bg-green-500 hover:bg-green-600 text-white px-4 py-3 rounded-lg transition-colors"
                        >
                          <Plus className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-end space-x-3 pt-6 border-t border-neutral-700">
                    <button
                      type="button"
                      onClick={closeModals}
                      className="bg-neutral-600 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white px-6 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Saving...' : 'Update Phase'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {isDetailsModalOpen && selectedPhase && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white font-bold">
                      {selectedPhase.orderNumber}
                    </div>
                    <h2 className="text-2xl font-bold text-white">
                      {selectedPhase.name}
                    </h2>
                  </div>
                  <button
                    onClick={closeModals}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-6">
                  <div>
                    <h3 className="text-white font-semibold mb-2">Description</h3>
                    <p className="text-neutral-300 leading-relaxed">{selectedPhase.description}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-2">Duration</h3>
                    <p className="text-neutral-300">{formatDurationForDisplay(selectedPhase.estimatedDuration)} days</p>
                  </div>

                  <div>
                    <h3 className="text-white font-semibold mb-3">Default Requirements</h3>
                    <div className="space-y-2">
                      {selectedPhase.defaultRequirements.map((req, index) => (
                        <div key={index} className="flex items-center space-x-3 bg-neutral-700/30 p-3 rounded-lg">
                          <CheckSquare className="h-4 w-4 text-green-400 flex-shrink-0" />
                          <span className="text-white">{req}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end pt-6 border-t border-neutral-700 mt-6">
                  <button
                    onClick={closeModals}
                    className="bg-neutral-600 hover:bg-neutral-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Loading Overlay */}
        {loading && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="bg-neutral-800 p-6 rounded-xl border border-neutral-700">
              <div className="text-white">Loading...</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Phases;
