import React, { useState, useEffect } from 'react';
import { performerService } from '../services/performerService';
import type { PerformerDto, CreatePerformerDto, UpdatePerformerDto, PerformerWithDetailsDto, PerformerFormData } from '../services/performerService';
import PerformerDetailModal from '../components/PerformerDetailModal';
import { validatePerformerForm, getFieldError, hasFieldError, parseBackendErrors } from '../utils/validation';
import type { ValidationError } from '../utils/validation';
import { User, Music, Mail, Phone, DollarSign, Star, Clock, Search, Filter, Plus, Eye, Edit, Trash2, X, AlertCircle } from 'lucide-react';

const Performers: React.FC = () => {
  // State management
  const [performers, setPerformers] = useState<PerformerDto[]>([]);
  const [filteredPerformers, setFilteredPerformers] = useState<PerformerDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterLoading, setFilterLoading] = useState(false);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<number | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [editingPerformer, setEditingPerformer] = useState<PerformerDto | null>(null);
  const [selectedPerformer, setSelectedPerformer] = useState<PerformerWithDetailsDto | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'name' | 'popularity' | 'minPrice' | 'updatedAt'>('name');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  // Form state
  const [formData, setFormData] = useState<PerformerFormData>({
    name: '',
    email: '',
    genre: '',
    contact: '',
    popularity: 0,
    minPrice: 0,
    maxPrice: 0,
    status: 'Active',
    averageResponseTime: '',
    technicalRequirements: ''
  });

  // Load performers on component mount
  useEffect(() => {
    loadPerformers();
  }, []);

  // Enhanced filter and search using the new API service methods
  useEffect(() => {
    const applyFiltersAndSearch = async () => {
      if (!performers.length) return;

      try {
        setFilterLoading(true);
        
        // Use the advanced search from the service for better performance
        const filtered = await performerService.searchPerformersAdvanced({
          searchTerm: searchTerm || undefined,
          status: statusFilter !== 'all' ? statusFilter : undefined,
        });

        // Apply sorting
        const sorted = filtered.sort((a, b) => {
          let aValue: any = a[sortBy];
          let bValue: any = b[sortBy];

          if (sortBy === 'updatedAt') {
            aValue = new Date(aValue || 0).getTime();
            bValue = new Date(bValue || 0).getTime();
          }

          if (sortOrder === 'asc') {
            return aValue > bValue ? 1 : -1;
          } else {
            return aValue < bValue ? 1 : -1;
          }
        });

        setFilteredPerformers(sorted);
      } catch (err) {
        console.error('Error filtering performers:', err);
        // Fallback to simple client-side filtering
        let filtered = [...performers];

        if (searchTerm) {
          filtered = filtered.filter(performer =>
            performer.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            performer.genre.toLowerCase().includes(searchTerm.toLowerCase()) ||
            performer.email.toLowerCase().includes(searchTerm.toLowerCase())
          );
        }

        if (statusFilter !== 'all') {
          filtered = filtered.filter(performer => performer.status === statusFilter);
        }

        setFilteredPerformers(filtered);
      } finally {
        setFilterLoading(false);
      }
    };

    applyFiltersAndSearch();
  }, [performers, searchTerm, statusFilter, sortBy, sortOrder]);

  const loadPerformers = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await performerService.getAllPerformers();
      setPerformers(data);
    } catch (err) {
      setError('Failed to load performers');
      console.error('Error loading performers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Clear previous messages
    setError(null);
    setSuccessMessage(null);
    setValidationErrors([]);
    
    // Client-side validation
    const validation = validatePerformerForm(formData);
    if (!validation.isValid) {
      setValidationErrors(validation.errors);
      return;
    }
    
    try {
      setSubmitLoading(true);
      if (editingPerformer) {
        // Update existing performer
        const updateData: UpdatePerformerDto = { ...formData };
        await performerService.updatePerformer(editingPerformer.performerId, updateData);
      } else {
        // Create new performer
        const createData: CreatePerformerDto = { ...formData };
        await performerService.createPerformer(createData);
      }
      
      await loadPerformers();
      setSuccessMessage(editingPerformer ? 'Performer updated successfully!' : 'Performer created successfully!');
      resetForm();
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(null), 3000);
    } catch (err: any) {
      // Handle backend validation errors
      const backendErrors = parseBackendErrors(err);
      if (backendErrors.length > 0) {
        setValidationErrors(backendErrors);
      } else {
        setError(err.response?.data?.message || 'Failed to save performer');
      }
      console.error('Error saving performer:', err);
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleEdit = (performer: PerformerDto) => {
    setEditingPerformer(performer);
    setFormData({
      name: performer.name,
      email: performer.email,
      genre: performer.genre,
      contact: performer.contact,
      popularity: performer.popularity,
      minPrice: performer.minPrice,
      maxPrice: performer.maxPrice,
      status: performer.status,
      averageResponseTime: performer.averageResponseTime,
      technicalRequirements: performer.technicalRequirements
    });
    setShowModal(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this performer?')) {
      try {
        setDeleteLoading(id);
        await performerService.deletePerformer(id);
        await loadPerformers();
        setSuccessMessage('Performer deleted successfully!');
        
        // Clear success message after 3 seconds
        setTimeout(() => setSuccessMessage(null), 3000);
      } catch (err) {
        setError('Failed to delete performer');
        console.error('Error deleting performer:', err);
      } finally {
        setDeleteLoading(null);
      }
    }
  };

  const handleViewDetails = async (performer: PerformerDto) => {
    try {
      setDetailLoading(true);
      // Use the enhanced method to get performer with details
      const details = await performerService.getPerformerWithDetails(performer.performerId);
      setSelectedPerformer(details);
      setShowDetailModal(true);
    } catch (err) {
      setError('Failed to load performer details');
      console.error('Error loading details:', err);
    } finally {
      setDetailLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      genre: '',
      contact: '',
      popularity: 0,
      minPrice: 0,
      maxPrice: 0,
      status: 'Active',
      averageResponseTime: '',
      technicalRequirements: ''
    });
    setEditingPerformer(null);
    setShowModal(false);
    setError(null);
    setSuccessMessage(null);
    setValidationErrors([]);
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      case 'inactive': return 'bg-red-500/20 text-red-400 border-red-500/30';
      default: return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
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

  const getInputClassName = (fieldName: string) => {
    return `w-full p-3 bg-neutral-700 border rounded-xl focus:outline-none focus:ring-2 text-white placeholder-neutral-400 transition-all ${
      hasFieldError(validationErrors, fieldName)
        ? 'border-red-500 focus:ring-red-400 focus:border-red-400'
        : 'border-neutral-600 focus:ring-lime-400 focus:border-transparent'
    }`;
  };

  const renderFieldError = (fieldName: string) => {
    const error = getFieldError(validationErrors, fieldName);
    if (!error) return null;
    
    return (
      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
        <AlertCircle className="w-4 h-4" />
        {error}
      </div>
    );
  };

  if (loading && performers.length === 0) {
    return (
      <div className="p-8 bg-neutral-900 min-h-screen">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-neutral-400">Loading performers...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 bg-neutral-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">Performers</h1>
            <p className="text-neutral-400">Manage your artists and performers</p>
          </div>
          <button
            onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-6 py-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
          >
            <Plus className="w-5 h-5" />
            Add Performer
          </button>
        </div>

        {/* Search and Filters */}
        <div className="bg-neutral-800 rounded-xl p-6 mb-8 border border-neutral-700">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <input
                type="text"
                placeholder="Search performers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-400"
              />
            </div>

            {/* Status Filter */}
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-400 w-5 h-5" />
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white appearance-none cursor-pointer"
              >
                <option value="all">All Status</option>
                <option value="Active">Active</option>
                <option value="Pending">Pending</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>

            {/* Sort By */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white"
            >
              <option value="name">Sort by Name</option>
              <option value="popularity">Sort by Popularity</option>
              <option value="minPrice">Sort by Price</option>
              <option value="updatedAt">Sort by Updated</option>
            </select>

            {/* Sort Order */}
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as any)}
              className="px-4 py-3 bg-neutral-700 border border-neutral-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white"
            >
              <option value="asc">Ascending</option>
              <option value="desc">Descending</option>
            </select>
          </div>
        </div>

        {/* Success Message */}
        {successMessage && (
          <div className="bg-green-500/20 border border-green-500/30 rounded-xl p-4 mb-6 text-green-400 flex items-center gap-2">
            <div className="w-5 h-5 bg-green-400 rounded-full flex items-center justify-center">
              <div className="w-2 h-2 bg-neutral-900 rounded-full"></div>
            </div>
            {successMessage}
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6 text-red-400 flex items-center gap-2">
            <AlertCircle className="w-5 h-5" />
            {error}
          </div>
        )}

        {/* Filter Loading Indicator */}
        {filterLoading && (
          <div className="flex items-center justify-center gap-2 p-4 mb-6 bg-neutral-800 rounded-xl border border-neutral-700">
            <div className="w-5 h-5 border-2 border-lime-400 border-t-transparent rounded-full animate-spin"></div>
            <span className="text-neutral-400">Filtering performers...</span>
          </div>
        )}

        {/* Performers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPerformers.map((performer) => (
            <div key={performer.performerId} className="bg-neutral-800 rounded-xl p-6 border border-neutral-700 hover:border-neutral-600 transition-all duration-200 group">
              {/* Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-lime-500/20 rounded-full flex items-center justify-center">
                    <User className="w-6 h-6 text-lime-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-white text-lg group-hover:text-lime-400 transition-colors">
                      {performer.name}
                    </h3>
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-medium border ${getStatusColor(performer.status)}`}>
                      {performer.status}
                    </span>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center gap-2 text-neutral-400">
                  <Music className="w-4 h-4" />
                  <span className="text-sm">{performer.genre}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Mail className="w-4 h-4" />
                  <span className="text-sm truncate">{performer.email}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Phone className="w-4 h-4" />
                  <span className="text-sm">{performer.contact}</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <DollarSign className="w-4 h-4" />
                  <span className="text-sm">${performer.minPrice} - ${performer.maxPrice}</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="flex items-center gap-1">
                    {getPopularityStars(performer.popularity)}
                  </div>
                  <span className="text-sm text-neutral-400">({performer.popularity}/100)</span>
                </div>
                <div className="flex items-center gap-2 text-neutral-400">
                  <Clock className="w-4 h-4" />
                  <span className="text-sm">Response: {performer.averageResponseTime}</span>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-2 pt-4 border-t border-neutral-700">
                <button
                  onClick={() => handleViewDetails(performer)}
                  disabled={detailLoading}
                  className="flex-1 flex items-center justify-center gap-2 px-3 py-2 bg-neutral-700 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-300 hover:text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {detailLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-neutral-300 border-t-transparent rounded-full animate-spin" />
                      Loading...
                    </>
                  ) : (
                    <>
                      <Eye className="w-4 h-4" />
                      View Details
                    </>
                  )}
                </button>
                <button
                  onClick={() => handleEdit(performer)}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-blue-500/20 hover:bg-blue-500/30 rounded-lg transition-all duration-200 text-blue-400 hover:text-blue-300 text-sm"
                >
                  <Edit className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleDelete(performer.performerId)}
                  disabled={deleteLoading === performer.performerId}
                  className="flex items-center justify-center gap-2 px-3 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg transition-all duration-200 text-red-400 hover:text-red-300 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {deleteLoading === performer.performerId ? (
                    <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Trash2 className="w-4 h-4" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Empty State */}
        {filteredPerformers.length === 0 && !loading && !filterLoading && (
          <div className="text-center py-12">
            <User className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-neutral-400 mb-2">No performers found</h3>
            <p className="text-neutral-500 mb-6">
              {searchTerm || statusFilter !== 'all' 
                ? 'Try adjusting your search or filters' 
                : 'Get started by adding your first performer'
              }
            </p>
            {(!searchTerm && statusFilter === 'all') && (
              <button
                onClick={() => setShowModal(true)}
                className="px-6 py-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold"
              >
                Add First Performer
              </button>
            )}
          </div>
        )}

        {/* Create/Edit Modal */}
        {showModal && (
          <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-neutral-800 rounded-2xl w-full max-w-2xl border border-neutral-700 shadow-2xl max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-neutral-700 flex items-center justify-between">
                <h2 className="text-2xl font-bold text-white">
                  {editingPerformer ? 'Edit Performer' : 'Add New Performer'}
                </h2>
                <button
                  onClick={resetForm}
                  className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-neutral-400" />
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                {/* Validation Errors Summary */}
                {validationErrors.length > 0 && (
                  <div className="bg-red-500/20 border border-red-500/30 rounded-xl p-4 mb-6">
                    <div className="flex items-center gap-2 text-red-400 font-medium mb-2">
                      <AlertCircle className="w-5 h-5" />
                      Please fix the following errors:
                    </div>
                    <ul className="list-disc list-inside text-red-300 text-sm space-y-1">
                      {validationErrors.map((error, index) => (
                        <li key={index}>{error.message}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Name *</label>
                    <input
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                      className={`w-full p-3 bg-neutral-700 border rounded-xl focus:outline-none focus:ring-2 text-white placeholder-neutral-400 transition-all ${
                        hasFieldError(validationErrors, 'name')
                          ? 'border-red-500 focus:ring-red-400 focus:border-red-400'
                          : 'border-neutral-600 focus:ring-lime-400 focus:border-transparent'
                      }`}
                      placeholder="Enter performer name"
                      required
                    />
                    {getFieldError(validationErrors, 'name') && (
                      <div className="flex items-center gap-2 mt-2 text-red-400 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        {getFieldError(validationErrors, 'name')}
                      </div>
                    )}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Email *</label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                      className={getInputClassName('email')}
                      placeholder="Enter email address"
                      required
                    />
                    {renderFieldError('email')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Genre *</label>
                    <input
                      type="text"
                      value={formData.genre}
                      onChange={(e) => setFormData(prev => ({ ...prev, genre: e.target.value }))}
                      className={getInputClassName('genre')}
                      placeholder="Enter genre"
                      required
                    />
                    {renderFieldError('genre')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Contact *</label>
                    <input
                      type="text"
                      value={formData.contact}
                      onChange={(e) => setFormData(prev => ({ ...prev, contact: e.target.value }))}
                      className={getInputClassName('contact')}
                      placeholder="Enter contact information"
                      required
                    />
                    {renderFieldError('contact')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Popularity (0-100) *</label>
                    <input
                      type="number"
                      value={formData.popularity}
                      onChange={(e) => setFormData(prev => ({ ...prev, popularity: parseInt(e.target.value) || 0 }))}
                      className={getInputClassName('popularity')}
                      placeholder="Enter popularity score"
                      min="0"
                      max="100"
                      required
                    />
                    {renderFieldError('popularity')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Min Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.minPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, minPrice: parseFloat(e.target.value) || 0 }))}
                      className={getInputClassName('minPrice')}
                      placeholder="Enter minimum price"
                      min="0"
                      required
                    />
                    {renderFieldError('minPrice')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Max Price *</label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.maxPrice}
                      onChange={(e) => setFormData(prev => ({ ...prev, maxPrice: parseFloat(e.target.value) || 0 }))}
                      className={getInputClassName('maxPrice')}
                      placeholder="Enter maximum price"
                      min="0"
                      required
                    />
                    {renderFieldError('maxPrice')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Status *</label>
                    <select
                      value={formData.status}
                      onChange={(e) => setFormData(prev => ({ ...prev, status: e.target.value }))}
                      className={getInputClassName('status')}
                      required
                    >
                      <option value="">Select status</option>
                      <option value="Active">Active</option>
                      <option value="Pending">Pending</option>
                      <option value="Inactive">Inactive</option>
                    </select>
                    {renderFieldError('status')}
                  </div>

                  <div>
                    <label className="block text-sm font-medium mb-2 text-neutral-300">Average Response Time</label>
                    <input
                      type="text"
                      value={formData.averageResponseTime}
                      onChange={(e) => setFormData(prev => ({ ...prev, averageResponseTime: e.target.value }))}
                      className={getInputClassName('averageResponseTime')}
                      placeholder="e.g., 02:00:00 (HH:mm:ss)"
                    />
                    {renderFieldError('averageResponseTime')}
                  </div>
                </div>

                <div className="mb-6">
                  <label className="block text-sm font-medium mb-2 text-neutral-300">Technical Requirements</label>
                  <textarea
                    value={formData.technicalRequirements}
                    onChange={(e) => setFormData(prev => ({ ...prev, technicalRequirements: e.target.value }))}
                    className="w-full p-3 bg-neutral-700 border border-neutral-600 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-400 transition-all"
                    placeholder="Enter technical requirements"
                    rows={3}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 p-3 bg-neutral-700 hover:bg-neutral-600 rounded-xl transition-all duration-200 text-white border border-neutral-600 hover:border-neutral-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitLoading}
                    className="flex-1 p-3 bg-lime-500 hover:bg-lime-600 rounded-xl transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                  >
                    {submitLoading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-black border-t-transparent rounded-full animate-spin" />
                        {editingPerformer ? 'Updating...' : 'Creating...'}
                      </>
                    ) : (
                      editingPerformer ? 'Update Performer' : 'Create Performer'
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Detail Modal */}
        <PerformerDetailModal
          performer={selectedPerformer}
          isOpen={showDetailModal}
          onClose={() => setShowDetailModal(false)}
          onEdit={(performer) => {
            setShowDetailModal(false);
            handleEdit(performer);
          }}
        />
      </div>
    </div>
  );
};

export default Performers;