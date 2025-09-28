import React, { useState, useEffect } from 'react';
import { Edit, Eye, X, Plus, Trash2, CheckCircle, Clock, Users, AlertCircle } from "lucide-react";
import { phaseService } from "../services/phaseService";
import type { FixedPhaseTemplate } from "../services/phaseService";
import { requirementService } from "../services/requirementService";
import type { RequirementDto, CreateRequirementDto } from "../services/requirementService";

const Phases = () => {
  // Phase and requirement state
  const [phases, setPhases] = useState<FixedPhaseTemplate[]>([]); // Load phases from database
  const [databasePhases, setDatabasePhases] = useState<Record<number, number>>({}); // Maps orderNumber -> PhaseId
  const [phaseRequirements, setPhaseRequirements] = useState<Record<number, RequirementDto[]>>({});
  const [loading, setLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Modal states
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [selectedPhase, setSelectedPhase] = useState<FixedPhaseTemplate | null>(null);
  
  // Edit form state - phase details
  const [editFormData, setEditFormData] = useState({
    name: '',
    description: '',
    estimatedDuration: ''
  });

  // Requirements management state
  const [selectedPhaseRequirements, setSelectedPhaseRequirements] = useState<RequirementDto[]>([]);
  const [newRequirement, setNewRequirement] = useState<Partial<CreateRequirementDto>>({
    title: '',
    description: '',
    isRequired: true
  });
  const [editingRequirement, setEditingRequirement] = useState<RequirementDto | null>(null);

  // Load requirements for all phases on component mount
  useEffect(() => {
    loadPhaseRequirements();
  }, []);

  const loadPhaseRequirements = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, initialize global phases in database
      await phaseService.initializeGlobalPhases();
      
      // Fetch database phases to get real PhaseIds
      const dbPhases = await phaseService.getGlobalPhaseTemplates();
      
      // Convert database phases to FixedPhaseTemplate format for display
      const convertedPhases = phaseService.convertToLegacyFormat(dbPhases);
      setPhases(convertedPhases);
      
      // Create mapping from orderNumber to PhaseId
      const phaseMapping: Record<number, number> = {};
      dbPhases.forEach(dbPhase => {
        phaseMapping[dbPhase.orderNumber] = dbPhase.phaseId;
      });
      setDatabasePhases(phaseMapping);
      
      // Load requirements for each phase using real PhaseIds
      const requirementsMap: Record<number, RequirementDto[]> = {};
      
      for (const phase of convertedPhases) {
        try {
          const realPhaseId = phaseMapping[phase.orderNumber];
          if (realPhaseId) {
            const reqs = await requirementService.getRequirementsByPhase(realPhaseId);
            requirementsMap[phase.orderNumber] = reqs;
          } else {
            requirementsMap[phase.orderNumber] = [];
          }
        } catch (err) {
          console.warn(`Could not load requirements for phase ${phase.orderNumber}:`, err);
          requirementsMap[phase.orderNumber] = [];
        }
      }
      
      setPhaseRequirements(requirementsMap);
    } catch (err) {
      console.error('Error loading phase requirements:', err);
      setError('Failed to load phase requirements');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Format duration for display
  const formatDurationForDisplay = (duration: string): string => {
    const match = duration.match(/^(\d+)\./);
    return match ? match[1] : '0';
  };

  // Handle opening edit modal for a phase
  const handleEdit = (phase: FixedPhaseTemplate) => {
    setSelectedPhase(phase);
    setEditFormData({
      name: phase.name,
      description: phase.description,
      estimatedDuration: formatDurationForDisplay(phase.estimatedDuration)
    });
    
    // Load requirements for this phase
    const requirements = phaseRequirements[phase.orderNumber] || [];
    setSelectedPhaseRequirements(requirements);
    setNewRequirement({ title: '', description: '', isRequired: true });
    setEditingRequirement(null);
    setIsEditModalOpen(true);
  };

  // Handle opening details modal
  const handleViewDetails = (phase: FixedPhaseTemplate) => {
    setSelectedPhase(phase);
    const requirements = phaseRequirements[phase.orderNumber] || [];
    setSelectedPhaseRequirements(requirements);
    setIsDetailsModalOpen(true);
  };

  // Handle phase update (only name, description, duration - not create/delete)
  const handlePhaseUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPhase) return;

    try {
      setLoading(true);
      
      // Update the phase details in the backend
      console.log('=== FRONTEND: Updating phase ===');
      console.log('Phase OrderNumber:', selectedPhase.orderNumber);
      console.log('Form data:', editFormData);
      
      // First, get the actual phase by order number to get the real phaseId
      const actualPhase = await phaseService.getPhaseByOrder(selectedPhase.orderNumber);
      if (!actualPhase) {
        throw new Error(`Phase with order number ${selectedPhase.orderNumber} not found`);
      }
      
      console.log('Found actual phase ID:', actualPhase.phaseId);
      
      // Now update using the real phaseId
      await phaseService.updatePhase(actualPhase.phaseId, {
        phaseName: editFormData.name,
        description: editFormData.description,
        estimatedDuration: parseInt(editFormData.estimatedDuration),
        orderNumber: selectedPhase.orderNumber,
        isGlobal: true
      });
      
      console.log('=== FRONTEND: Phase update successful ===');
      setSuccessMessage(`${selectedPhase.name} phase updated successfully!`);

      // Reload phase data to refresh the UI with updated information
      await loadPhaseRequirements();

      setIsEditModalOpen(false);
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating phase:', err);
      setError('Failed to update phase');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle adding new requirement to phase
  const handleAddRequirement = async () => {
    if (!selectedPhase || !newRequirement.title?.trim()) return;

    // Get the real PhaseId from database
    const realPhaseId = databasePhases[selectedPhase.orderNumber];
    if (!realPhaseId) {
      console.error('Phase mapping issue:', {
        selectedPhase: selectedPhase.orderNumber,
        databasePhases,
        phases
      });
      setError('Phase not found in database. Please refresh the page and try again.');
      setTimeout(() => setError(null), 5000);
      return;
    }

    try {
      setLoading(true);
      
      const requirementData: CreateRequirementDto = {
        title: newRequirement.title.trim(),
        description: newRequirement.description || '',
        isRequired: newRequirement.isRequired || true,
        phaseId: realPhaseId // Use real database PhaseId
      };

      const createdRequirement = await requirementService.createRequirement(requirementData);
      
      // Update local state
      const updatedRequirements = [...selectedPhaseRequirements, createdRequirement];
      setSelectedPhaseRequirements(updatedRequirements);
      setPhaseRequirements(prev => ({
        ...prev,
        [selectedPhase.orderNumber]: updatedRequirements
      }));

      // Reset form
      setNewRequirement({ title: '', description: '', isRequired: true });
      setSuccessMessage('Requirement added successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      console.error('Error adding requirement:', err);
      
      // Parse different error types
      let errorMessage = 'Failed to add requirement';
      if (err.response?.status === 400) {
        errorMessage = err.response.data || 'Invalid data provided';
      } else if (err.response?.status === 500) {
        errorMessage = 'Server error. Please check if the phase exists and try again.';
      }
      
      setError(errorMessage);
      setTimeout(() => setError(null), 5000);
    } finally {
      setLoading(false);
    }
  };

  // Handle editing requirement
  const handleEditRequirement = (requirement: RequirementDto) => {
    setEditingRequirement(requirement);
    setNewRequirement({
      title: requirement.title,
      description: requirement.description,
      isRequired: requirement.isRequired
    });
  };

  // Handle updating requirement
  const handleUpdateRequirement = async () => {
    if (!editingRequirement || !selectedPhase || !newRequirement.title?.trim()) return;

    // Get the real PhaseId from database
    const realPhaseId = databasePhases[selectedPhase.orderNumber];
    if (!realPhaseId) {
      setError('Phase not found in database. Please refresh the page.');
      setTimeout(() => setError(null), 3000);
      return;
    }

    try {
      setLoading(true);
      
      const updatedRequirement = await requirementService.updateRequirement(
        editingRequirement.requirementId,
        {
          title: newRequirement.title.trim(),
          description: newRequirement.description || '',
          isRequired: newRequirement.isRequired || true,
          phaseId: realPhaseId // Use real database PhaseId
        }
      );

      // Update local state
      const updatedRequirements = selectedPhaseRequirements.map(req => 
        req.requirementId === updatedRequirement.requirementId ? updatedRequirement : req
      );
      setSelectedPhaseRequirements(updatedRequirements);
      setPhaseRequirements(prev => ({
        ...prev,
        [selectedPhase.orderNumber]: updatedRequirements
      }));

      // Reset editing state
      setEditingRequirement(null);
      setNewRequirement({ title: '', description: '', isRequired: true });
      setSuccessMessage('Requirement updated successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error updating requirement:', err);
      setError('Failed to update requirement');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Handle deleting requirement
  const handleDeleteRequirement = async (requirement: RequirementDto) => {
    if (!selectedPhase || !confirm(`Are you sure you want to delete the requirement "${requirement.title}"?`)) return;

    try {
      setLoading(true);
      
      await requirementService.deleteRequirement(requirement.requirementId);
      
      // Update local state
      const updatedRequirements = selectedPhaseRequirements.filter(
        req => req.requirementId !== requirement.requirementId
      );
      setSelectedPhaseRequirements(updatedRequirements);
      setPhaseRequirements(prev => ({
        ...prev,
        [selectedPhase.orderNumber]: updatedRequirements
      }));

      setSuccessMessage('Requirement deleted successfully!');
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err) {
      console.error('Error deleting requirement:', err);
      setError('Failed to delete requirement');
      setTimeout(() => setError(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Cancel requirement editing
  const handleCancelRequirementEdit = () => {
    setEditingRequirement(null);
    setNewRequirement({ title: '', description: '', isRequired: true });
  };

  if (loading && Object.keys(phaseRequirements).length === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center min-h-[400px]">
            <div className="text-white">Loading phases...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-neutral-900 via-neutral-800 to-neutral-900 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Negotiation Phases</h1>
            <p className="text-neutral-300">
              Manage your 5 negotiation phases and their requirements
            </p>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="mb-6 p-4 bg-green-500/20 border border-green-500/50 rounded-lg flex items-center space-x-3">
            <CheckCircle className="h-5 w-5 text-green-400" />
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
          {phases.map((phase) => {
            const requirements = phaseRequirements[phase.orderNumber] || [];
            return (
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
                  <div className="flex items-center space-x-1">
                    <Clock className="h-4 w-4" />
                    <span>{formatDurationForDisplay(phase.estimatedDuration)} days</span>
                  </div>
                  <div className="flex items-center space-x-1">
                    <Users className="h-4 w-4" />
                    <span>{requirements.length} requirements</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <button
                    onClick={() => handleViewDetails(phase)}
                    className="flex-1 bg-blue-600/20 border border-blue-500/50 text-blue-300 px-4 py-2 rounded-lg hover:bg-blue-600/30 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Eye className="h-4 w-4" />
                    <span>Details</span>
                  </button>
                  <button
                    onClick={() => handleEdit(phase)}
                    className="flex-1 bg-purple-600/20 border border-purple-500/50 text-purple-300 px-4 py-2 rounded-lg hover:bg-purple-600/30 transition-all duration-200 flex items-center justify-center space-x-2 text-sm"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit</span>
                  </button>
                </div>
              </div>
            );
          })}
        </div>

        {/* Edit Modal with Integrated Requirements Management */}
        {isEditModalOpen && selectedPhase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    Edit Phase: {selectedPhase.name}
                  </h2>
                  <button
                    onClick={() => setIsEditModalOpen(false)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-8">
                {/* Phase Details Form */}
                <form onSubmit={handlePhaseUpdate} className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                    Phase Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Phase Name */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Phase Name</label>
                      <input
                        type="text"
                        value={editFormData.name}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, name: e.target.value }))}
                        className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter phase name"
                        required
                      />
                    </div>

                    {/* Estimated Duration */}
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Estimated Duration (days)</label>
                      <input
                        type="number"
                        value={editFormData.estimatedDuration}
                        onChange={(e) => setEditFormData(prev => ({ ...prev, estimatedDuration: e.target.value }))}
                        className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter estimated duration"
                        min="1"
                        required
                      />
                    </div>
                  </div>

                  {/* Phase Description */}
                  <div>
                    <label className="block text-white text-sm font-medium mb-2">Description</label>
                    <textarea
                      value={editFormData.description}
                      onChange={(e) => setEditFormData(prev => ({ ...prev, description: e.target.value }))}
                      className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      placeholder="Enter phase description"
                      rows={3}
                      required
                    />
                  </div>

                  <div className="flex justify-end">
                    <button
                      type="submit"
                      disabled={loading}
                      className="bg-gradient-to-r from-purple-500 to-pink-500 text-white px-6 py-2 rounded-lg hover:from-purple-600 hover:to-pink-600 transition-all duration-200 disabled:opacity-50"
                    >
                      {loading ? 'Updating...' : 'Update Phase'}
                    </button>
                  </div>
                </form>

                {/* Requirements Management */}
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-white border-b border-neutral-700 pb-2">
                    Requirements Management
                  </h3>

                  {/* Add/Edit Requirement Form */}
                  <div className="bg-neutral-700/50 rounded-lg p-4 space-y-4">
                    <h4 className="text-white font-medium">
                      {editingRequirement ? 'Edit Requirement' : 'Add New Requirement'}
                    </h4>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Title *</label>
                        <input
                          type="text"
                          value={newRequirement.title || ''}
                          onChange={(e) => setNewRequirement(prev => ({ ...prev, title: e.target.value }))}
                          className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                          placeholder="Enter requirement title"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-white text-sm font-medium mb-2">Status</label>
                        <select
                          value={newRequirement.isRequired ? 'required' : 'optional'}
                          onChange={(e) => setNewRequirement(prev => ({ ...prev, isRequired: e.target.value === 'required' }))}
                          className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        >
                          <option value="required">Required</option>
                          <option value="optional">Optional</option>
                        </select>
                      </div>
                    </div>

                    <div>
                      <label className="block text-white text-sm font-medium mb-2">Description</label>
                      <textarea
                        value={newRequirement.description || ''}
                        onChange={(e) => setNewRequirement(prev => ({ ...prev, description: e.target.value }))}
                        className="w-full bg-neutral-700 border border-neutral-600 text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                        placeholder="Enter requirement description"
                        rows={2}
                      />
                    </div>

                    <div className="flex space-x-2">
                      {editingRequirement ? (
                        <>
                          <button
                            type="button"
                            onClick={handleUpdateRequirement}
                            disabled={loading || !newRequirement.title?.trim()}
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors disabled:opacity-50"
                          >
                            Update Requirement
                          </button>
                          <button
                            type="button"
                            onClick={handleCancelRequirementEdit}
                            className="bg-neutral-600 text-white px-4 py-2 rounded-lg hover:bg-neutral-700 transition-colors"
                          >
                            Cancel
                          </button>
                        </>
                      ) : (
                        <button
                          type="button"
                          onClick={handleAddRequirement}
                          disabled={loading || !newRequirement.title?.trim()}
                          className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 flex items-center space-x-2"
                        >
                          <Plus className="h-4 w-4" />
                          <span>Add Requirement</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Requirements List */}
                  <div className="space-y-3">
                    <h4 className="text-white font-medium">
                      Current Requirements ({selectedPhaseRequirements.length})
                    </h4>
                    
                    {selectedPhaseRequirements.length === 0 ? (
                      <p className="text-neutral-400 text-sm italic">No requirements added yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedPhaseRequirements.map((req) => (
                          <div key={req.requirementId} className="bg-neutral-700/30 rounded-lg p-3 flex items-start justify-between">
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-1">
                                <h5 className="text-white font-medium text-sm">{req.title}</h5>
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  req.isRequired 
                                    ? 'bg-green-500/20 text-green-300' 
                                    : 'bg-yellow-500/20 text-yellow-300'
                                }`}>
                                  {req.isRequired ? 'Required' : 'Optional'}
                                </span>
                              </div>
                              {req.description && (
                                <p className="text-neutral-300 text-sm">{req.description}</p>
                              )}
                            </div>
                            <div className="flex items-center space-x-1 ml-4">
                              <button
                                onClick={() => handleEditRequirement(req)}
                                className="p-1 text-blue-400 hover:text-blue-300 hover:bg-blue-600/10 rounded transition-colors"
                                title="Edit requirement"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => handleDeleteRequirement(req)}
                                className="p-1 text-red-400 hover:text-red-300 hover:bg-red-600/10 rounded transition-colors"
                                title="Delete requirement"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Details Modal */}
        {isDetailsModalOpen && selectedPhase && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-neutral-800 rounded-xl border border-neutral-700 max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold text-white">
                    {selectedPhase.name}
                  </h2>
                  <button
                    onClick={() => setIsDetailsModalOpen(false)}
                    className="text-neutral-400 hover:text-white transition-colors"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>
              </div>

              <div className="p-6">
                <div className="space-y-6">
                  {/* Phase Info */}
                  <div>
                    <h3 className="text-white font-medium mb-2">Description</h3>
                    <p className="text-neutral-300">{selectedPhase.description}</p>
                  </div>

                  <div>
                    <h3 className="text-white font-medium mb-2">Duration</h3>
                    <p className="text-neutral-300">{formatDurationForDisplay(selectedPhase.estimatedDuration)} days</p>
                  </div>

                  {/* Requirements */}
                  <div>
                    <h3 className="text-white font-medium mb-3">Requirements ({selectedPhaseRequirements.length})</h3>
                    <div className="space-y-2">
                      {selectedPhaseRequirements.map((req) => (
                        <div key={req.requirementId} className="bg-neutral-700/50 rounded-lg p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <h4 className="text-white font-medium text-sm">{req.title}</h4>
                              {req.description && (
                                <p className="text-neutral-300 text-sm mt-1">{req.description}</p>
                              )}
                            </div>
                            <div className={`px-2 py-1 rounded text-xs font-medium ${
                              req.isRequired 
                                ? 'bg-green-500/20 text-green-300' 
                                : 'bg-yellow-500/20 text-yellow-300'
                            }`}>
                              {req.isRequired ? 'Required' : 'Optional'}
                            </div>
                          </div>
                        </div>
                      ))}
                      {selectedPhaseRequirements.length === 0 && (
                        <p className="text-neutral-400 text-sm">No requirements defined for this phase.</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Phases;