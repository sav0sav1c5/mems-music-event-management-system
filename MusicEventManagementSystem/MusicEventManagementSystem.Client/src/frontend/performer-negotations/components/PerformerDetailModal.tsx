import React from 'react';
import type { PerformerWithDetailsDto, ContractDto } from '../services/performerService';
import { User, Music, Mail, Phone, Star, Clock, FileText, MessageSquare, Calendar, CheckCircle, XCircle, AlertCircle, Edit, X } from 'lucide-react';

interface PerformerDetailModalProps {
  performer: PerformerWithDetailsDto | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (performer: PerformerWithDetailsDto) => void;
}

const PerformerDetailModal: React.FC<PerformerDetailModalProps> = ({
  performer,
  isOpen,
  onClose,
  onEdit
}) => {
  if (!isOpen || !performer) return null;

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const getContractStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case 'signed': return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending': return <AlertCircle className="w-4 h-4 text-yellow-400" />;
      case 'cancelled': return <XCircle className="w-4 h-4 text-red-400" />;
      default: return <AlertCircle className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getNegotiationStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'text-blue-400';
      case 'completed': return 'text-green-400';
      case 'cancelled': return 'text-red-400';
      default: return 'text-neutral-400';
    }
  };

  const getPopularityStars = (popularity: number) => {
    const stars = Math.round(popularity / 20); // Convert 0-100 to 0-5 stars
    return Array.from({ length: 5 }, (_, i) => (
      <Star 
        key={i} 
        className={`w-4 h-4 ${i < stars ? 'text-yellow-400 fill-yellow-400' : 'text-neutral-600'}`} 
      />
    ));
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
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

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-neutral-800 rounded-2xl w-full max-w-6xl border border-neutral-700 shadow-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="p-6 border-b border-neutral-700 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-lime-500/20 rounded-full flex items-center justify-center">
              <User className="w-8 h-8 text-lime-400" />
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{performer.name}</h2>
              <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(performer.status)}`}>
                {performer.status}
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => onEdit(performer)}
              className="flex items-center gap-2 px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200 text-blue-400 hover:text-blue-300"
            >
              <Edit className="w-4 h-4" />
              Edit
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
            >
              <X className="w-6 h-6 text-neutral-400" />
            </button>
          </div>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Basic Info */}
            <div className="lg:col-span-2 space-y-6">
              {/* Contact Information */}
              <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Mail className="w-5 h-5 text-lime-400" />
                  Contact Information
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Mail className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Email</p>
                      <p className="text-white">{performer.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Phone className="w-4 h-4 text-neutral-400" />
                    <div>
                      <p className="text-sm text-neutral-400">Contact</p>
                      <p className="text-white">{performer.contact}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Performance Details */}
              <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Music className="w-5 h-5 text-lime-400" />
                  Performance Details
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Genre</p>
                    <p className="text-white font-medium">{performer.genre}</p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Popularity</p>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1">
                        {getPopularityStars(performer.popularity)}
                      </div>
                      <span className="text-white font-medium">({performer.popularity}/100)</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Price Range</p>
                    <p className="text-white font-medium">
                      {formatCurrency(performer.minPrice)} - {formatCurrency(performer.maxPrice)}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-neutral-400 mb-1">Response Time</p>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-neutral-400" />
                      <span className="text-white font-medium">{performer.averageResponseTime}</span>
                    </div>
                  </div>
                </div>
                {performer.technicalRequirements && (
                  <div className="mt-4">
                    <p className="text-sm text-neutral-400 mb-2">Technical Requirements</p>
                    <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-600">
                      <p className="text-neutral-300 text-sm leading-relaxed">
                        {performer.technicalRequirements}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Contracts Section */}
              <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-lime-400" />
                  Contracts ({performer.contracts?.length || 0})
                </h3>
                {performer.contracts && performer.contracts.length > 0 ? (
                  <div className="space-y-3">
                    {performer.contracts.map((contract: ContractDto) => (
                      <div key={contract.contractId} className="bg-neutral-800/50 rounded-lg p-4 border border-neutral-600">
                        <div className="flex items-start justify-between mb-3">
                          <div>
                            <h4 className="font-medium text-white">{contract.title}</h4>
                            <p className="text-sm text-neutral-400">{contract.contractType} • Version {contract.version}</p>
                          </div>
                          <div className="flex items-center gap-2">
                            {getContractStatusIcon(contract.status)}
                            <span className={`text-sm font-medium ${getStatusColor(contract.status).split(' ')[1]}`}>
                              {contract.status}
                            </span>
                          </div>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div>
                            <p className="text-neutral-400">Price</p>
                            <p className="text-white font-medium">{formatCurrency(contract.price)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Created</p>
                            <p className="text-white">{formatDate(contract.createdAt)}</p>
                          </div>
                          <div>
                            <p className="text-neutral-400">Signed</p>
                            <p className="text-white">
                              {contract.signedAt ? formatDate(contract.signedAt) : 'Not signed'}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 text-neutral-600 mx-auto mb-3" />
                    <p className="text-neutral-400">No contracts found</p>
                    <p className="text-sm text-neutral-500">Contracts will appear here once created</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Sidebar Info */}
            <div className="space-y-6">
              {/* Quick Stats */}
              <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                <h3 className="text-lg font-semibold text-white mb-4">Quick Stats</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Total Contracts</span>
                    <span className="text-white font-medium">{performer.contracts?.length || 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Active Negotiations</span>
                    <span className="text-white font-medium">
                      {performer.negotiation ? 1 : 0}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-neutral-400">Avg. Price</span>
                    <span className="text-white font-medium">
                      {formatCurrency((performer.minPrice + performer.maxPrice) / 2)}
                    </span>
                  </div>
                  {performer.updatedAt && (
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Last Updated</span>
                      <span className="text-white font-medium text-sm">
                        {formatDate(performer.updatedAt)}
                      </span>
                    </div>
                  )}
                </div>
              </div>

              {/* Current Negotiation */}
              {performer.negotiation && (
                <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-lime-400" />
                    Current Negotiation
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Status</span>
                      <span className={`font-medium ${getNegotiationStatusColor(performer.negotiation.status)}`}>
                        {performer.negotiation.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Initial Offer</span>
                      <span className="text-white font-medium">
                        {formatCurrency(performer.negotiation.initialOffer)}
                      </span>
                    </div>
                    {performer.negotiation.finalOffer && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Final Offer</span>
                        <span className="text-white font-medium">
                          {formatCurrency(performer.negotiation.finalOffer)}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Started</span>
                      <span className="text-white text-sm">
                        {formatDate(performer.negotiation.startDate)}
                      </span>
                    </div>
                    {performer.negotiation.endDate && (
                      <div className="flex items-center justify-between">
                        <span className="text-neutral-400">Ended</span>
                        <span className="text-white text-sm">
                          {formatDate(performer.negotiation.endDate)}
                        </span>
                      </div>
                    )}
                    {performer.negotiation.notes && (
                      <div className="mt-4">
                        <p className="text-neutral-400 text-sm mb-2">Notes</p>
                        <div className="bg-neutral-800/50 rounded-lg p-3 border border-neutral-600">
                          <p className="text-neutral-300 text-sm leading-relaxed">
                            {performer.negotiation.notes}
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Activity Timeline */}
              <div className="bg-neutral-700/50 rounded-xl p-6 border border-neutral-600">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-lime-400" />
                  Recent Activity
                </h3>
                <div className="space-y-3">
                  {performer.updatedAt && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-lime-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Profile updated</p>
                        <p className="text-xs text-neutral-400">{formatDate(performer.updatedAt)}</p>
                      </div>
                    </div>
                  )}
                  {performer.contracts && performer.contracts.length > 0 && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-blue-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Latest contract</p>
                        <p className="text-xs text-neutral-400">
                          {formatDate(performer.contracts[0].createdAt)}
                        </p>
                      </div>
                    </div>
                  )}
                  {performer.negotiation && (
                    <div className="flex items-center gap-3">
                      <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm text-white">Negotiation started</p>
                        <p className="text-xs text-neutral-400">
                          {formatDate(performer.negotiation.startDate)}
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-neutral-700 flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-white border border-neutral-600 hover:border-neutral-500"
          >
            Close
          </button>
          <button
            onClick={() => onEdit(performer)}
            className="px-6 py-2 bg-lime-500 hover:bg-lime-600 rounded-lg transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
          >
            Edit Performer
          </button>
        </div>
      </div>
    </div>
  );
};

export default PerformerDetailModal;