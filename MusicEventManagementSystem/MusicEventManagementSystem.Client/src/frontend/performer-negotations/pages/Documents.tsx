import { useState, useEffect } from "react";
import { Plus, Edit, Trash2, X, FileText, ArrowUp, ArrowDown, CheckCircle, Clock } from "lucide-react";
import { documentService } from "../services/documentService";
import type { DocumentDto } from "../services/documentService";

const Documents = () => {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<DocumentDto | null>(null);
  const [formData, setFormData] = useState<Omit<DocumentDto, 'documentId' | 'updatedAt'>>({
    title: '',
    type: '',
    path: '',
    version: '',
  });

  useEffect(() => {
    fetchDocuments();
  }, []);

  const fetchDocuments = async () => {
    try {
      setLoading(true);
      const data = await documentService.getAllDocuments();
      setDocuments(data);
    } catch (err) {
      setError('Failed to fetch documents');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDocument) {
        const updated = await documentService.updateDocument(
          editingDocument.documentId,
          { ...formData, documentId: editingDocument.documentId, updatedAt: editingDocument.updatedAt }
        );
        setDocuments(prev => 
          prev.map(item => item.documentId === updated.documentId ? updated : item)
        );
      } else {
        const created = await documentService.createDocument(formData);
        setDocuments(prev => [...prev, created]);
      }
      resetForm();
    } catch (err) {
      setError('Failed to save document');
      console.error(err);
    }
  };

  const handleEdit = (document: DocumentDto) => {
    setEditingDocument(document);
    setFormData({
      title: document.title,
      type: document.type,
      path: document.path,
      version: document.version,
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this document?')) {
      try {
        await documentService.deleteDocument(id);
        setDocuments(prev => prev.filter(item => item.documentId !== id));
      } catch (err) {
        setError('Failed to delete document');
        console.error(err);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      title: '',
      type: '',
      path: '',
      version: '',
    });
    setEditingDocument(null);
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
      title: "Total Documents",
      value: documents.length.toString(),
      change: "+12.5%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "lime"
    },
    {
      title: "Contracts",
      value: documents.filter(d => d.type === 'Contract').length.toString(),
      change: "+8.2%",
      trend: "up",
      icon: <CheckCircle className="w-5 h-5" />,
      color: "blue"
    },
    {
      title: "Requirements",
      value: documents.filter(d => d.type === 'Requirement').length.toString(),
      change: "+15.3%",
      trend: "up",
      icon: <FileText className="w-5 h-5" />,
      color: "purple"
    },
    {
      title: "Recent Updates",
      value: documents.filter(d => {
        const docDate = new Date(d.updatedAt);
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        return docDate > weekAgo;
      }).length.toString(),
      change: "+18.7%",
      trend: "up",
      icon: <Clock className="w-5 h-5" />,
      color: "orange"
    },
  ];

  if (loading) return <div className="text-center py-8 text-white">Loading...</div>;
  if (error) return <div className="text-center py-8 text-red-400">{error}</div>;

  return (
    <div className="text-white h-full flex flex-col">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-2xl font-bold text-white mb-1">Documents</h1>
        <p className="text-neutral-400 text-sm">
          Manage documents and track their versions.
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
          <h2 className="text-xl font-bold text-white">All Documents</h2>
          <p className="text-neutral-400 text-sm">Create and manage documents</p>
        </div>
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-lime-500 hover:bg-lime-600 px-4 py-2 rounded-xl flex items-center gap-2 transition-all duration-200 text-black font-semibold border border-lime-400/30 hover:border-lime-400"
        >
          <Plus className="w-4 h-4" />
          Add Document
        </button>
      </div>

      {/* Documents Table */}
      <div className="bg-neutral-800/50 backdrop-blur-sm border border-neutral-700 rounded-xl hover:border-lime-400/30 transition-all duration-200 flex-1 min-h-0 flex flex-col">
        <div className="overflow-x-auto flex-1">
          <table className="w-full">
            <thead className="border-b border-neutral-700">
              <tr>
                <th className="text-left p-4 pl-10 text-neutral-300 font-semibold">ID</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Title</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Type</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Version</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Path</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Updated</th>
                <th className="text-left p-4 text-neutral-300 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {documents.map((document) => (
                <tr key={document.documentId} className="border-b border-neutral-700/50 hover:bg-neutral-700/30 transition-all duration-200">
                  <td className="p-4 pl-10 text-white font-semibold">{document.documentId}</td>
                  <td className="p-4 text-white font-medium">{document.title}</td>
                  <td className="p-4 text-neutral-300">{document.type}</td>
                  <td className="p-4 text-lime-400 font-semibold">{document.version}</td>
                  <td className="p-4 text-neutral-300 max-w-xs truncate">{document.path}</td>
                  <td className="p-4 text-neutral-300">{formatDate(document.updatedAt)}</td>
                  <td className="p-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(document)}
                        className="p-1.5 hover:bg-neutral-600 rounded-lg transition-all duration-200 text-neutral-400 hover:text-lime-400 border border-transparent hover:border-lime-400/30"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(document.documentId)}
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

        {documents.length === 0 && (
          <div className="text-center py-12 text-neutral-400">
            <p>No documents found. Create your first document!</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-neutral-900 rounded-2xl p-6 w-full max-w-md border border-neutral-800 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-bold text-white">
                {editingDocument ? 'Edit Document' : 'Add New Document'}
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
                  placeholder="Enter document title"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white transition-all"
                  required
                >
                  <option value="">Select document type</option>
                  <option value="Contract">Contract</option>
                  <option value="Requirement">Requirement</option>
                  <option value="Specification">Specification</option>
                  <option value="Report">Report</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2 text-neutral-300">Path</label>
                <input
                  type="text"
                  value={formData.path}
                  onChange={(e) => setFormData(prev => ({ ...prev, path: e.target.value }))}
                  className="w-full p-3 bg-neutral-800 border border-neutral-700 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-400 focus:border-transparent text-white placeholder-neutral-500 transition-all"
                  placeholder="Enter file path"
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
                  {editingDocument ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Documents;
