import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, AlertCircle, Music, Star, DollarSign, Clock } from "lucide-react";

// Mock types - replace with your actual types
interface PerformerResponse {
  performerId: number;
  name: string;
  email: string;
  contact: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string;
  status: string;
}

interface PerformerCreateForm {
  name: string;
  email: string;
  contact: string;
  genre: string;
  popularity: number;
  technicalRequirements: string;
  minPrice: number;
  maxPrice: number;
  averageResponseTime: string;
  status: string;
}

interface PerformerUpdateForm {
  name?: string;
  email?: string;
  contact?: string;
  genre?: string;
  popularity?: number;
  technicalRequirements?: string;
  minPrice?: number;
  maxPrice?: number;
  averageResponseTime?: string;
  status?: string;
}

// Mock service - replace with your actual service
class PerformerService {
  static async getAllPerformers(): Promise<PerformerResponse[]> {
    // Mock data
    return [
      {
        performerId: 1,
        name: "The Rock Band",
        email: "contact@rockband.com",
        contact: "+381 60 123 4567",
        genre: "Rock",
        popularity: 85,
        technicalRequirements: "Full sound system, lighting rig",
        minPrice: 5000,
        maxPrice: 15000,
        averageResponseTime: "02:30:00",
        status: "Active"
      },
      {
        performerId: 2,
        name: "DJ Electro",
        email: "dj@electro.com",
        contact: "+381 60 234 5678",
        genre: "Electronic",
        popularity: 92,
        technicalRequirements: "DJ booth, LED screens",
        minPrice: 8000,
        maxPrice: 20000,
        averageResponseTime: "01:15:00",
        status: "Active"
      }
    ];
  }

  static async createPerformer(form: PerformerCreateForm): Promise<PerformerResponse> {
    console.log("Creating performer:", form);
    return { performerId: Date.now(), ...form };
  }

  static async updatePerformer(id: number, form: PerformerUpdateForm): Promise<PerformerResponse> {
    console.log("Updating performer:", id, form);
    return { performerId: id, ...form } as PerformerResponse;
  }

  static async deletePerformer(id: number): Promise<void> {
    console.log("Deleting performer:", id);
  }
}

const Performers = () => {
  const [performers, setPerformers] = useState<PerformerResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPerformer, setEditingPerformer] = useState<PerformerResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState<PerformerCreateForm>({
    name: "",
    email: "",
    contact: "",
    genre: "",
    popularity: 0,
    technicalRequirements: "",
    minPrice: 0,
    maxPrice: 0,
    averageResponseTime: "00:00:00",
    status: "Active"
  });

  // Fetch all performers
  const fetchPerformers = async () => {
    try {
      setLoading(true);
      setError("");
      const data = await PerformerService.getAllPerformers();
      setPerformers(data);
    } catch (error) {
      setError("Failed to fetch performers. Please try again.");
      console.error("Error fetching performers:", error);
    } finally {
      setLoading(false);
    }
  };

  // Create new performer
  const createPerformer = async () => {
    try {
      setSubmitting(true);
      setError("");
      await PerformerService.createPerformer(formData);
      await fetchPerformers();
      closeModal();
    } catch (error) {
      setError("Failed to create performer. Please try again.");
      console.error("Error creating performer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Update performer
  const updatePerformer = async () => {
    if (!editingPerformer) return;

    try {
      setSubmitting(true);
      setError("");
      
      const updateData: PerformerUpdateForm = {
        name: formData.name,
        email: formData.email,
        contact: formData.contact,
        genre: formData.genre,
        popularity: formData.popularity,
        technicalRequirements: formData.technicalRequirements,
        minPrice: formData.minPrice,
        maxPrice: formData.maxPrice,
        averageResponseTime: formData.averageResponseTime,
        status: formData.status
      };

      await PerformerService.updatePerformer(editingPerformer.performerId, updateData);
      await fetchPerformers();
      closeModal();
    } catch (error) {
      setError("Failed to update performer. Please try again.");
      console.error("Error updating performer:", error);
    } finally {
      setSubmitting(false);
    }
  };

  // Delete performer
  const deletePerformer = async (id: number) => {
    if (!confirm("Are you sure you want to delete this performer?")) return;

    try {
      await PerformerService.deletePerformer(id);
      await fetchPerformers();
    } catch (error) {
      setError("Failed to delete performer. Please try again.");
      console.error("Error deleting performer:", error);
    }
  };

  // Open modal for create/edit
  const openModal = (performer?: PerformerResponse) => {
    setError("");
    if (performer) {
      setEditingPerformer(performer);
      setFormData({
        name: performer.name || "",
        email: performer.email || "",
        contact: performer.contact || "",
        genre: performer.genre || "",
        popularity: performer.popularity || 0,
        technicalRequirements: performer.technicalRequirements || "",
        minPrice: performer.minPrice || 0,
        maxPrice: performer.maxPrice || 0,
        averageResponseTime: performer.averageResponseTime || "00:00:00",
        status: performer.status || "Active"
      });
    } else {
      setEditingPerformer(null);
      setFormData({
        name: "",
        email: "",
        contact: "",
        genre: "",
        popularity: 0,
        technicalRequirements: "",
        minPrice: 0,
        maxPrice: 0,
        averageResponseTime: "00:00:00",
        status: "Active"
      });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingPerformer(null);
    setError("");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPerformer) {
      updatePerformer();
    } else {
      createPerformer();
    }
  };

  const handleInputChange = (field: keyof PerformerCreateForm, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  // Get genre icon color
  const getGenreColor = (genre: string) => {
    const colors: Record<string, string> = {
      'Rock': 'text-red-400 bg-red-500/20',
      'Pop': 'text-pink-400 bg-pink-500/20',
      'Electronic': 'text-blue-400 bg-blue-500/20',
      'Jazz': 'text-purple-400 bg-purple-500/20',
      'Classical': 'text-yellow-400 bg-yellow-500/20',
      'Hip Hop': 'text-orange-400 bg-orange-500/20'
    };
    return colors[genre] || 'text-gray-400 bg-gray-500/20';
  };

  // Get popularity color
  const getPopularityColor = (popularity: number) => {
    if (popularity >= 80) return 'text-lime-400';
    if (popularity >= 60) return 'text-green-400';
    if (popularity >= 40) return 'text-yellow-400';
    return 'text-orange-400';
  };

  // Get stats
  const totalPerformers = performers.length;
  const avgPopularity = totalPerformers > 0 
    ? Math.round(performers.reduce((sum, p) => sum + p.popularity, 0) / totalPerformers) 
    : 0;
  const avgPrice = totalPerformers > 0
    ? Math.round(performers.reduce((sum, p) => sum + ((p.minPrice + p.maxPrice) / 2), 0) / totalPerformers)
    : 0;

  useEffect(() => {
    fetchPerformers();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-white text-lg">Loading performers...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-white">Performers</h1>
          <p className="text-gray-400">Manage event performers and artists</p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-gradient-to-r from-lime-500 to-lime-600 hover:from-lime-600 hover:to-lime-700 text-black px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 font-medium shadow-lg hover:shadow-lime-500/25"
        >
          <Plus size={20} />
          Add Performer
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
            <div className="p-3 bg-purple-500/20 rounded-xl">
              <Music className="w-8 h-8 text-purple-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Total Performers</p>
              <h3 className="text-2xl font-bold text-white">{totalPerformers}</h3>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-yellow-500/20 rounded-xl">
              <Star className="w-8 h-8 text-yellow-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Popularity</p>
              <h3 className="text-2xl font-bold text-white">{avgPopularity}%</h3>
            </div>
          </div>
        </div>

        <div className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-green-500/20 rounded-xl">
              <DollarSign className="w-8 h-8 text-green-400" />
            </div>
            <div>
              <p className="text-gray-400 text-sm">Avg. Price Range</p>
              <h3 className="text-2xl font-bold text-white">${avgPrice.toLocaleString()}</h3>
            </div>
          </div>
        </div>
      </div>

      {/* Performers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performers.map((performer) => (
          <div
            key={performer.performerId}
            className="bg-neutral-900/50 backdrop-blur-sm border border-neutral-800 rounded-2xl p-6 shadow-xl hover:border-neutral-700 transition-all duration-200 group"
          >
            {/* Header */}
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-3 flex-1">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  <Music className="w-5 h-5 text-lime-400" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="text-lg font-semibold text-white group-hover:text-lime-400 transition-colors truncate">
                    {performer.name || "Unnamed Performer"}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className={`text-xs px-2 py-1 rounded-lg ${getGenreColor(performer.genre)}`}>
                      {performer.genre || "N/A"}
                    </span>
                  </div>
                </div>
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={() => openModal(performer)}
                  className="p-2 bg-neutral-800 hover:bg-blue-600 rounded-lg transition-colors"
                  title="Edit performer"
                >
                  <Edit size={16} className="text-gray-400 hover:text-white" />
                </button>
                <button
                  onClick={() => deletePerformer(performer.performerId)}
                  className="p-2 bg-neutral-800 hover:bg-red-600 rounded-lg transition-colors"
                  title="Delete performer"
                >
                  <Trash2 size={16} className="text-gray-400 hover:text-white" />
                </button>
              </div>
            </div>
            
            {/* Popularity Bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-gray-400">Popularity</span>
                <span className={`text-sm font-bold ${getPopularityColor(performer.popularity)}`}>
                  {performer.popularity}%
                </span>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-2">
                <div 
                  className={`h-2 rounded-full ${getPopularityColor(performer.popularity).replace('text-', 'bg-')}`}
                  style={{ width: `${performer.popularity}%` }}
                />
              </div>
            </div>

            {/* Details */}
            <div className="space-y-3 text-sm">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Price Range:</span>
                <span className="text-green-400 font-bold">
                  ${performer.minPrice.toLocaleString()} - ${performer.maxPrice.toLocaleString()}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Response Time:</span>
                <span className="text-white font-medium flex items-center gap-1">
                  <Clock size={14} className="text-blue-400" />
                  {performer.averageResponseTime}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Contact:</span>
                <span className="text-white text-right max-w-[180px] truncate" title={performer.contact}>
                  {performer.contact || "N/A"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Status:</span>
                <span className={`text-xs px-2 py-1 rounded-lg ${
                  performer.status === 'Active' 
                    ? 'text-green-400 bg-green-500/20' 
                    : 'text-gray-400 bg-gray-500/20'
                }`}>
                  {performer.status}
                </span>
              </div>
              {performer.technicalRequirements && (
                <div className="pt-2 border-t border-neutral-800">
                  <p className="text-gray-400 text-xs mb-1">Technical Requirements:</p>
                  <p className="text-gray-300 text-xs">{performer.technicalRequirements}</p>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {performers.length === 0 && !loading && (
        <div className="text-center py-16 bg-neutral-900/30 rounded-2xl border border-neutral-800">
          <div className="p-4 bg-neutral-800/50 rounded-full w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <Music className="w-8 h-8 text-gray-400" />
          </div>
          <p className="text-gray-400 text-lg mb-2">No performers found</p>
          <p className="text-gray-500 text-sm">Add your first performer to get started!</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-neutral-900/95 backdrop-blur-md border border-neutral-800 rounded-2xl p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-lime-500/20 rounded-lg">
                  <Music className="w-6 h-6 text-lime-400" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold text-white">
                    {editingPerformer ? "Edit Performer" : "Add New Performer"}
                  </h2>
                  <p className="text-sm text-gray-400">
                    {editingPerformer ? "Update performer information" : "Create a new performer profile"}
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
              {/* Basic Info */}
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Performer Name *
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="Enter performer name"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="performer@email.com"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Contact *
                  </label>
                  <input
                    type="text"
                    value={formData.contact}
                    onChange={(e) => handleInputChange("contact", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="+381 60 123 4567"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Genre and Popularity */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Genre *
                  </label>
                  <select
                    value={formData.genre}
                    onChange={(e) => handleInputChange("genre", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    required
                    disabled={submitting}
                  >
                    <option value="">Select genre</option>
                    <option value="Rock">Rock</option>
                    <option value="Pop">Pop</option>
                    <option value="Electronic">Electronic</option>
                    <option value="Jazz">Jazz</option>
                    <option value="Classical">Classical</option>
                    <option value="Hip Hop">Hip Hop</option>
                    <option value="Country">Country</option>
                    <option value="R&B">R&B</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Popularity (0-100) *
                  </label>
                  <input
                    type="number"
                    value={formData.popularity || ""}
                    onChange={(e) => handleInputChange("popularity", parseInt(e.target.value) || 0)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="0"
                    min="0"
                    max="100"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Price Range */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Min Price ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.minPrice || ""}
                    onChange={(e) => handleInputChange("minPrice", parseFloat(e.target.value) || 0)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Max Price ($) *
                  </label>
                  <input
                    type="number"
                    value={formData.maxPrice || ""}
                    onChange={(e) => handleInputChange("maxPrice", parseFloat(e.target.value) || 0)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="0"
                    min="0"
                    step="0.01"
                    required
                    disabled={submitting}
                  />
                </div>
              </div>

              {/* Response Time and Status */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Avg. Response Time (HH:MM:SS) *
                  </label>
                  <input
                    type="text"
                    value={formData.averageResponseTime}
                    onChange={(e) => handleInputChange("averageResponseTime", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    placeholder="00:00:00"
                    pattern="[0-9]{2}:[0-9]{2}:[0-9]{2}"
                    required
                    disabled={submitting}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Status *
                  </label>
                  <select
                    value={formData.status}
                    onChange={(e) => handleInputChange("status", e.target.value)}
                    className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 border border-neutral-700 focus:border-lime-500 transition-colors"
                    required
                    disabled={submitting}
                  >
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Pending">Pending</option>
                  </select>
                </div>
              </div>

              {/* Technical Requirements */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Technical Requirements *
                </label>
                <textarea
                  value={formData.technicalRequirements}
                  onChange={(e) => handleInputChange("technicalRequirements", e.target.value)}
                  className="w-full p-3 bg-neutral-800/50 text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-500 h-24 resize-none border border-neutral-700 focus:border-lime-500 transition-colors"
                  placeholder="Describe technical requirements (sound system, lighting, stage setup, etc.)"
                  required
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
                    ? (editingPerformer ? "Updating..." : "Creating...") 
                    : (editingPerformer ? "Update Performer" : "Create Performer")
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

export default Performers;