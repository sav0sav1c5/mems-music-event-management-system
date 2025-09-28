import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  AlertCircle,
  Send,
  ArrowRight
} from "lucide-react";
import { negotiationService } from "../services/negotiationService";
import type { 
  NegotiationWorkflowDto, 
  NegotiationPhaseDto, 
  FulfillRequirementDto,
  AddCommunicationDto
} from "../services/negotiationService";

const NegotiationWorkflow = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  
  const [workflow, setWorkflow] = useState<NegotiationWorkflowDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedPhase, setSelectedPhase] = useState<NegotiationPhaseDto | null>(null);
  const [communicationInput, setCommunicationInput] = useState("");
  const [communicationType, setCommunicationType] = useState("Note");
  const [communicationDirection, setCommunicationDirection] = useState("Internal");

  useEffect(() => {
    if (id) {
      fetchWorkflow(parseInt(id));
    }
  }, [id]);

  const fetchWorkflow = async (negotiationId: number) => {
    try {
      setLoading(true);
      const data = await negotiationService.getNegotiationWorkflow(negotiationId);
      console.log('Workflow data received:', {
        currentPhase: data.currentPhase,
        totalPhases: data.phases.length,
        phases: data.phases.map(p => ({
          phaseName: p.phaseName,
          orderNumber: p.orderNumber,
          isActive: p.isActive,
          status: p.status
        }))
      });
      
      setWorkflow(data);
      // Set current phase as selected by default
      if (data.currentPhase) {
        console.log('Setting selected phase to current phase:', data.currentPhase.phaseName);
        setSelectedPhase(data.currentPhase);
      } else if (data.phases.length > 0) {
        // If no active phase, find the first phase that should be active (orderNumber = 1)
        const firstPhase = data.phases.find(p => p.orderNumber === 1) || data.phases[0];
        console.log('No current phase, selecting first phase:', firstPhase.phaseName, 'isActive:', firstPhase.isActive);
        setSelectedPhase(firstPhase);
        
        // If no phase is active but we have phases, this indicates a data issue
        console.warn('No active phase found. This indicates a data issue. Phase statuses:', 
          data.phases.map(p => `${p.phaseName}: ${p.isActive ? 'ACTIVE' : 'INACTIVE'}`));
      }
    } catch (err) {
      setError('Failed to fetch negotiation workflow');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleRequirementToggle = async (requirementId: number, currentStatus: boolean) => {
    if (!workflow || !selectedPhase?.isActive) {
      console.warn('Cannot modify requirements: no workflow or selected phase is not active');
      return;
    }

    const fulfillDto: FulfillRequirementDto = {
      isFulfilled: !currentStatus,
      fulfilledBy: "Current User", // In a real app, get from auth context
      notes: !currentStatus ? "Requirement fulfilled via UI" : undefined,
      evidence: undefined
    };

    try {
      await negotiationService.fulfillRequirement(workflow.negotiationId, requirementId, fulfillDto);
      // Refresh workflow to get updated data
      await fetchWorkflow(workflow.negotiationId);
    } catch (err) {
      console.error('Failed to update requirement:', err);
    }
  };

  const handleAdvancePhase = async () => {
    if (!workflow) return;

    try {
      await negotiationService.advanceNegotiationPhase(workflow.negotiationId);
      await fetchWorkflow(workflow.negotiationId);
    } catch (err) {
      console.error('Failed to advance phase:', err);
    }
  };

  const handleAddCommunication = async () => {
    if (!workflow || !communicationInput.trim()) return;

    const commDto: AddCommunicationDto = {
      type: communicationType,
      direction: communicationDirection,
      content: communicationInput
    };

    try {
      await negotiationService.addCommunication(workflow.negotiationId, commDto);
      setCommunicationInput("");
      await fetchWorkflow(workflow.negotiationId);
    } catch (err) {
      console.error('Failed to add communication:', err);
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed': return 'text-green-600 bg-green-100';
      case 'inprogress': return 'text-blue-600 bg-blue-100';
      case 'notstarted': return 'text-gray-600 bg-gray-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getPhaseIcon = (phase: NegotiationPhaseDto) => {
    if (phase.status === 'Completed') {
      return <CheckCircle className="w-5 h-5 text-green-600" />;
    } else if (phase.isActive) {
      return <Clock className="w-5 h-5 text-blue-600" />;
    } else {
      return <div className="w-5 h-5 rounded-full border-2 border-gray-300" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading negotiation workflow...</p>
        </div>
      </div>
    );
  }

  if (error || !workflow) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-lg shadow-lg max-w-md w-full mx-4">
          <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-2">Error Loading Workflow</h2>
          <p className="text-gray-600 text-center mb-4">{error || 'Negotiation not found'}</p>
          <button
            onClick={() => navigate('/artist-communication/negotiations')}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 transition-colors"
          >
            Back to Negotiations
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => navigate('/artist-communication/negotiations')}
                className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
              >
                <ArrowLeft className="w-5 h-5 mr-2" />
                Back to Negotiations
              </button>
              <div className="h-6 w-px bg-gray-300" />
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  Negotiation Workflow
                </h1>
                <p className="text-sm text-gray-600">
                  {workflow.eventName} • {workflow.performerName}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-sm text-gray-600">Status</p>
                <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(workflow.status)}`}>
                  {workflow.status}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600">Proposed Fee</p>
                <p className="font-semibold text-lg">{formatCurrency(workflow.proposedFee)}</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Phase Overview */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-sm border">
              <div className="p-6 border-b">
                <h2 className="text-lg font-semibold text-gray-900 mb-2">Progress Overview</h2>
                <div className="mb-4">
                  <div className="flex justify-between text-sm text-gray-600 mb-1">
                    <span>Overall Progress</span>
                    <span>{workflow.overallCompletionPercentage}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${workflow.overallCompletionPercentage}%` }}
                    />
                  </div>
                </div>
              </div>
              
              <div className="p-6">
                <h3 className="text-sm font-medium text-gray-900 mb-4">Phases</h3>
                <div className="space-y-4">
                  {workflow.phases.map((phase) => (
                    <div
                      key={phase.phaseId}
                      className={`cursor-pointer p-3 rounded-lg border transition-colors ${
                        selectedPhase?.phaseId === phase.phaseId
                          ? 'border-blue-500 bg-blue-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                      onClick={() => setSelectedPhase(phase)}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          {getPhaseIcon(phase)}
                          <div>
                            <p className="text-sm font-medium text-gray-900">
                              {phase.phaseName}
                            </p>
                            <p className="text-xs text-gray-500">
                              {phase.fulfilledRequirementsCount}/{phase.totalRequirementsCount} requirements
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-gray-500">
                            {phase.completionPercentage}%
                          </p>
                          {phase.isActive && (
                            <span className="inline-flex px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-600">
                              Current
                            </span>
                          )}
                        </div>
                      </div>
                      {phase.isActive && (
                        <div className="mt-2">
                          <div className="w-full bg-gray-200 rounded-full h-1">
                            <div
                              className="bg-blue-600 h-1 rounded-full transition-all duration-300"
                              style={{ width: `${phase.completionPercentage}%` }}
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Phase Details */}
          <div className="lg:col-span-2">
            {selectedPhase && (
              <div className="space-y-6">
                {/* Phase Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-semibold text-gray-900">
                        {selectedPhase.phaseName}
                      </h2>
                      {selectedPhase.phaseDescription && (
                        <p className="text-gray-600 mt-1">{selectedPhase.phaseDescription}</p>
                      )}
                    </div>
                    <div className="flex items-center space-x-2">
                      <span className={`inline-flex px-3 py-1 text-sm font-medium rounded-full ${getStatusColor(selectedPhase.status)}`}>
                        {selectedPhase.status}
                      </span>
                      {selectedPhase.isActive && workflow.canAdvanceToNextPhase && (
                        <button
                          onClick={handleAdvancePhase}
                          className="flex items-center px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors"
                        >
                          <ArrowRight className="w-4 h-4 mr-2" />
                          Next Phase
                        </button>
                      )}
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Started</p>
                      <p className="font-medium">
                        {selectedPhase.startDate ? formatDate(selectedPhase.startDate) : 'Not started'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Completed</p>
                      <p className="font-medium">
                        {selectedPhase.completedDate ? formatDate(selectedPhase.completedDate) : 'In progress'}
                      </p>
                    </div>
                    <div>
                      <p className="text-gray-600">Progress</p>
                      <p className="font-medium">{selectedPhase.completionPercentage}%</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Requirements</p>
                      <p className="font-medium">
                        {selectedPhase.fulfilledRequirementsCount}/{selectedPhase.totalRequirementsCount}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Requirements */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-semibold text-gray-900">Requirements</h3>
                      {!selectedPhase.isActive && (
                        <span className="text-sm text-amber-600 bg-amber-100 px-2 py-1 rounded">
                          View Only - Phase Not Active
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="p-6">
                    {selectedPhase.requirementFulfillments && selectedPhase.requirementFulfillments.length > 0 ? (
                      <div className="space-y-4">
                        {selectedPhase.requirementFulfillments.map((requirement) => (
                          <div
                            key={requirement.fulfillmentId}
                            className={`p-4 rounded-lg border ${
                              requirement.isFulfilled
                                ? 'border-green-200 bg-green-50'
                                : 'border-gray-200 bg-white'
                            }`}
                          >
                            <div className="flex items-start justify-between">
                              <div className="flex items-start space-x-3 flex-1">
                                <div className="mt-1">
                                  <input
                                    type="checkbox"
                                    checked={requirement.isFulfilled}
                                    onChange={() => handleRequirementToggle(requirement.requirementId, requirement.isFulfilled)}
                                    disabled={!selectedPhase.isActive}
                                    className={`w-4 h-4 border-gray-300 rounded focus:ring-blue-500 ${
                                      selectedPhase.isActive 
                                        ? 'text-blue-600 cursor-pointer' 
                                        : 'text-gray-400 cursor-not-allowed opacity-50'
                                    }`}
                                  />
                                </div>
                                <div className="flex-1">
                                  <h4 className={`font-medium ${
                                    requirement.isFulfilled ? 'text-green-900' : 'text-gray-900'
                                  }`}>
                                    {requirement.requirementTitle}
                                    {requirement.isRequired && (
                                      <span className="text-red-500 ml-1">*</span>
                                    )}
                                  </h4>
                                  <p className={`text-sm mt-1 ${
                                    requirement.isFulfilled ? 'text-green-700' : 'text-gray-600'
                                  }`}>
                                    {requirement.requirementDescription}
                                  </p>
                                  {requirement.isFulfilled && (
                                    <div className="mt-2 text-xs text-green-600">
                                      <p>✓ Fulfilled by {requirement.fulfilledBy}</p>
                                      {requirement.fulfilledDate && (
                                        <p>on {formatDate(requirement.fulfilledDate)}</p>
                                      )}
                                      {requirement.notes && (
                                        <p className="mt-1 text-green-700">Note: {requirement.notes}</p>
                                      )}
                                    </div>
                                  )}
                                </div>
                              </div>
                              {requirement.isFulfilled && (
                                <CheckCircle className="w-5 h-5 text-green-600 mt-1" />
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-gray-500 text-center py-8">No requirements for this phase.</p>
                    )}
                    
                    {/* Workflow Information */}
                    {selectedPhase.isActive && (
                      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <div className="flex items-start">
                          <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-blue-900 mb-1">Current Active Phase</p>
                            <p className="text-blue-700">
                              Complete all requirements in this phase to unlock the "Next Phase" button. 
                              You can only modify requirements for the currently active phase.
                            </p>
                            <p className="text-blue-700 mt-1">
                              Progress: {selectedPhase.fulfilledRequirementsCount} of {selectedPhase.totalRequirementsCount} requirements completed
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {!selectedPhase.isActive && (
                      <div className="mt-6 p-4 bg-gray-50 border border-gray-200 rounded-lg">
                        <div className="flex items-start">
                          <Clock className="w-5 h-5 text-gray-600 mt-0.5 mr-3 flex-shrink-0" />
                          <div className="text-sm">
                            <p className="font-medium text-gray-900 mb-1">
                              {selectedPhase.status === 'Completed' ? 'Completed Phase' : 'Future Phase'}
                            </p>
                            <p className="text-gray-700">
                              {selectedPhase.status === 'Completed' 
                                ? 'This phase has been completed. Requirements cannot be modified.'
                                : 'This phase is not yet active. Complete the current active phase to proceed.'
                              }
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Communications */}
                <div className="bg-white rounded-lg shadow-sm border">
                  <div className="p-6 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Communications</h3>
                  </div>
                  <div className="p-6">
                    {/* Communication Log */}
                    {workflow.communication && (
                      <div className="mb-6">
                        <div className="bg-gray-50 rounded-lg p-4 max-h-40 overflow-y-auto">
                          <pre className="whitespace-pre-wrap text-sm text-gray-700">
                            {workflow.communication.content}
                          </pre>
                        </div>
                      </div>
                    )}

                    {/* Add Communication */}
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Type
                          </label>
                          <select
                            value={communicationType}
                            onChange={(e) => setCommunicationType(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Note">Note</option>
                            <option value="Email">Email</option>
                            <option value="Call">Call</option>
                            <option value="Meeting">Meeting</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Direction
                          </label>
                          <select
                            value={communicationDirection}
                            onChange={(e) => setCommunicationDirection(e.target.value)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          >
                            <option value="Internal">Internal</option>
                            <option value="Outbound">Outbound</option>
                            <option value="Inbound">Inbound</option>
                          </select>
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          Message
                        </label>
                        <div className="relative">
                          <textarea
                            value={communicationInput}
                            onChange={(e) => setCommunicationInput(e.target.value)}
                            placeholder="Add a note, log a call, or record communication..."
                            rows={3}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 pr-12"
                          />
                          <button
                            onClick={handleAddCommunication}
                            disabled={!communicationInput.trim()}
                            className="absolute bottom-2 right-2 p-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                          >
                            <Send className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default NegotiationWorkflow;