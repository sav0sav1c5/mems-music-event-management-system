import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, AlertCircle, MapPin, Users, Building2 } from "lucide-react";
import { VenueService } from "../services/venueService";
import type { VenueResponse } from "../types/api/venue";
import type { VenueCreateForm, VenueUpdateForm } from "../types/forms/venue";

const Venues = () => {
  const [venues, setVenues] = useState<VenueResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingVenue, setEditingVenue] = useState<VenueResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<VenueCreateForm>({
    name: "",
    description: "",
    city: "",
    address: "",
    capacity: 0,
    eventId: 0,
    venueType: 0
  });

  // Fetch all venues
  const fetchVenues = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await VenueService.getAllVenues();
      setVenues(data);
    } catch (error) {
      setError("Failed to fetch venues. Please try again.");
      console.error("Error fetching venues:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new venue
  const createVenue = async () => {
    try {
      setSubmitting(true);
      setError("");
      await VenueService.createVenue(formData);
      await fetchVenues();
      closeModal();
    } catch (error) {
      setError("Failed to create venue. Please try again.");
      console.error("Error creating venue:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update venue
  const updateVenue = async () => {
    if (!editingVenue) return;

    try {
      setSubmitting(true);
      setError("");
      
      const updateData: VenueUpdateForm = {
        name: formData.name,
        description: formData.description,
        city: formData.city,
        address: formData.address,
        capacity: formData.capacity,
        venueType: formData.venueType
      };

      await VenueService.updateVenue(editingVenue.venueId, updateData);
      await fetchVenues();
      closeModal();
    } catch (error) {
      setError("Failed to update venue. Please try again.");
      console.error("Error updating venue:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete venue
  const deleteVenue = async (id: number) => {
    if (!confirm("Are you sure you want to delete this venue?")) return;

    try {
      await VenueService.deleteVenue(id);
      await fetchVenues();
    } catch (error) {
      setError("Failed to delete venue. Please try again.");
      console.error("Error deleting venue:", error);
    }
  };

  // Open modal for create/edit
  const openModal = (venue?: VenueResponse) => {
    setError("");
    if (venue) {
      setEditingVenue(venue);
      setFormData({
        name: venue.name || "",
        description: venue.description || "",
        city: venue.city || "",
        address: venue.address || "",
        capacity: venue.capacity,
        eventId: venue.eventId || 0,
        venueType: venue.venueType || 0
      });
    } else {
      setEditingVenue(null);
      setFormData({
        name: "",
        description: "",
        city: "",
        address: "",
        capacity: 0,
        eventId: 0,
        venueType: 0
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingVenue(null);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingVenue) {
      updateVenue();
    } else {
      createVenue();
    }
  };

  const handleInputChange = (field: keyof VenueCreateForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get venue type icon
  const getVenueTypeIcon = (type: string) => {
    switch (type?.toLowerCase()) {
      case 'stadium':
      case 'arena':
        return <Building2 className="w-5 h-5" />;
      case 'outdoor':
        return <MapPin className="w-5 h-5" />;
      default:
        return <Building2 className="w-5 h-5" />;
    }
  };

  // Get total capacity
  const totalCapacity = venues.reduce((sum, venue) => sum + venue.capacity, 0);
  const totalVenues = venues.length;
  const avgCapacity = totalVenues > 0 ? Math.round(totalCapacity / totalVenues) : 0;

  useEffect(() => {
    fetchVenues();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading venues...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Venues</h1>
          <p className="text-gray-400">Manage your event venues</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-black px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium shadow-lg hover:shadow-lime-500/25"
        >
          <Plus size={20} />
          Add Venue
        </button>
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-900/20 border border-red-500/30 text-red-200 p-4 rounded-xl flex items-center gap-3 backdrop-blur-sm">
          <div className="p-2 bg-red-500/20 rounded-lg">
            <AlertCircle size={20} className="text-red-400" />
          </div>
          <span>{error}</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-blue-500/20 rounded-xl">
              <Building2 className="w-8 h-8 text-blue-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Venues</p>
              <h3 className="text-2xl font-bold text-white">{totalVenues}</h3>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <Users className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Capacity</p>
              <h3 className="text-2xl font-bold text-white">{totalCapacity.toLocaleString()}</h3>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <MapPin className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Capacity</p>
              <h3 className="text-2xl font-bold text-white">{avgCapacity.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Venues Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {venues.map((venue) => (
          <div
            key={venue.venueId}
            className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl hover:border-neutral-700 transition-all duration-200 group"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  {getVenueTypeIcon(String(venue.venueType))}
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-white group-hover:text-lime-400 transition-colors">
                    {venue.name || "Unnamed Venue"}
                  </h3>
                  <p className="text-sm text-gray-400">{venue.venueType || "N/A"}</p>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(venue)}
                  className="p-2 bg-neutral-800 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Edit venue"
                >
                  <Edit size={16} className="text-gray-400 hover:text-white" />
                </button>
                <button
                  onClick={() => deleteVenue(venue.venueId)}
                  className="p-2 bg-neutral-800 hover:bg-red-600 rounded-lg transition-colors"
                  title="Delete venue"
                >
                  <Trash2 size={16} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            
            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Location:</span>
                <span className="text-white font-medium">{venue.city || "N/A"}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Capacity:</span>
                <span className="text-lime-400 font-bold">{venue.capacity.toLocaleString()}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Address:</span>
                <span className="text-white text-right max-w-[180px] truncate" title={venue.address}>
                  {venue.address || "N/A"}
                </span>
              </div>
              {venue.description && (
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-gray-300 text-xs">{venue.description}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {venues.length === 0 && !loading && (
        <div className="text-center py-16 bg-neutral-900/30 rounded-2xl border border-neutral-800">
          <div className="p-4 bg-neutral-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg mb-2">No venues found</p>
          <p className="text-gray-500 text-sm">Create your first venue to get started!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 w-full max-w-md max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  <Building2 className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingVenue ? "Edit Venue" : "Add New Venue"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {editingVenue ? "Update venue information" : "Create a new event venue"}
                  </p>
                </div>
              </div>
              <button
                onClick={closeModal}
                className="p-2 hover:bg-neutral-800 rounded-lg transition-colors"
              >
                <X size={20} className="text-gray-400" />
              </button>
            </div>

            {/* Modal Error Message */}
            {error && (
              <div className="bg-red-900/30 border border-red-500/30 text-red-200 p-3 rounded-xl flex items-center gap-3 mb-6">
                <AlertCircle size={16} className="text-red-400" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                  placeholder="Enter venue name"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Venue Type *
                </label>
                <select
                  value={formData.venueType}
                  onChange={(e) => handleInputChange("venueType", e.target.value)}
                  className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                  required
                  disabled={submitting}
                >
                  <option value="">Select venue type</option>
                  <option value="Stadium">Stadium</option>
                  <option value="Arena">Arena</option>
                  <option value="Theater">Theater</option>
                  <option value="Club">Club</option>
                  <option value="Concert Hall">Concert Hall</option>
                  <option value="Outdoor">Outdoor</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    City *
                  </label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => handleInputChange("city", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="City"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Capacity *
                  </label>
                  <input
                    type="number"
                    value={formData.capacity || ""}
                    onChange={(e) => handleInputChange("capacity", parseInt(e.target.value) || 0)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="0"
                    min="1"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Address *
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => handleInputChange("address", e.target.value)}
                  className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                  placeholder="Enter venue address"
                  required
                  disabled={submitting}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => handleInputChange("description", e.target.value)}
                  className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 h-20 resize-none border border-neutral-700 focus:border-lime-500 transition-colors"
                  placeholder="Venue description (optional)"
                  disabled={submitting}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 disabled:from-lime-700 disabled:to-lime-800 disabled:cursor-not-allowed text-black py-3 rounded-xl font-medium transition-all duration-200 shadow-lg"
                >
                  {submitting 
                    ? (editingVenue ? "Updating..." : "Creating...") 
                    : (editingVenue ? "Update Venue" : "Create Venue")
                  }
                </button>
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={submitting}
                  className="flex-1 bg-neutral-800 hover:bg-neutral-700 disabled:bg-neutral-700 disabled:cursor-not-allowed text-white py-3 rounded-xl font-medium transition-colors border border-neutral-700"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Venues;