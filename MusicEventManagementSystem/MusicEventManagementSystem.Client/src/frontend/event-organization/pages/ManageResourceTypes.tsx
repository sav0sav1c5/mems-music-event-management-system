import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Settings, Plus, Edit, Trash2, Package, X } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
// import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './../../../../components/ui/select';
// import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './../../../../components/ui/alert-dialog';
import { resourceTypeService } from '../services/resourceTypeService';
import type { ResourceType } from '../services/resourceTypeService';
import type { CreateResourceTypeDto } from '../services/resourceTypeService';

const ManageResourceTypes = () => {
  const navigate = useNavigate();
  const [resourceTypes, setResourceTypes] = useState<ResourceType[]>([]);
  const [loading, setLoading] = useState(false);
  const [editingType, setEditingType] = useState<ResourceType | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    customFields: [] as { name: string; type: string; }[]
  });

  const fieldTypeOptions = [
    { value: 'TEXT', label: 'Text' },
    { value: 'NUMBER', label: 'Number' },
    { value: 'DATE', label: 'Date' },
    { value: 'BOOLEAN', label: 'Boolean' },
    { value: 'SELECT', label: 'Select' }
  ];

  useEffect(() => {
    loadResourceTypes();
  }, []);

  const loadResourceTypes = async () => {
    try {
      setLoading(true);
      const types = await resourceTypeService.getAllResourceTypes();
      setResourceTypes(types);
    } catch (error) {
      console.error('Error loading resource types:', error);
      toast.error('Failed to load resource types');
      setResourceTypes([]);
    } finally {
      setLoading(false);
    }
  };

  const handleAddType = () => {
    setShowAddForm(true);
    setEditingType(null);
    setFormData({
      name: '',
      description: '',
      customFields: []
    });
  };

  const handleEditType = (type: ResourceType) => {
    setEditingType(type);
    setShowAddForm(true);
    setFormData({
      name: type.name,
      description: type.description || '',
      customFields: type.customFields.map(field => ({ name: field.name, type: field.type }))
    });
  };

  const handleDeleteType = async (typeId: number) => {
    try {
      await resourceTypeService.deleteResourceType(typeId);
      setResourceTypes(prev => prev.filter(type => type.id !== typeId));
      toast.success('Resource type deleted successfully');
    } catch (error) {
      console.error('Error deleting resource type:', error);
      toast.error('Failed to delete resource type');
    }
  };

  const handleSaveType = async () => {
    if (!formData.name.trim()) {
      toast.error('Please enter a type name');
      return;
    }

    // Validate custom fields
    for (const field of formData.customFields) {
      if (!field.name.trim()) {
        toast.error('Please enter names for all custom fields');
        return;
      }
    }

    try {
      const typeData: CreateResourceTypeDto = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        customFields: formData.customFields.map((field, index) => ({
          name: field.name.trim(),
          type: field.type,
          isRequired: false
        }))
      };

      if (editingType) {
        // Update existing type
        const updatedTypeData: ResourceType = {
          ...editingType,
          name: formData.name.trim(),
          description: formData.description.trim(),
          customFields: formData.customFields.map((field, index) => ({
            id: index + 1,
            name: field.name.trim(),
            type: field.type,
            isRequired: false
          }))
        };
        const updatedType = await resourceTypeService.updateResourceType(editingType.id, updatedTypeData);
        setResourceTypes(prev => prev.map(type => 
          type.id === editingType.id ? updatedType : type
        ));
        toast.success('Resource type updated successfully');
      } else {
        // Add new type
        const newType = await resourceTypeService.createResourceType(typeData);
        setResourceTypes(prev => [...prev, newType]);
        toast.success('Resource type created successfully');
      }

      setShowAddForm(false);
      setEditingType(null);
    } catch (error) {
      console.error('Error saving resource type:', error);
      toast.error('Failed to save resource type');
    }
  };

  const handleCancel = () => {
    setShowAddForm(false);
    setEditingType(null);
  };

  const addCustomField = () => {
    setFormData(prev => ({
      ...prev,
      customFields: [...prev.customFields, { name: '', type: 'TEXT' }]
    }));
  };

  const removeCustomField = (index: number) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.filter((_, i) => i !== index)
    }));
  };

  const updateCustomField = (index: number, field: 'name' | 'type', value: string) => {
    setFormData(prev => ({
      ...prev,
      customFields: prev.customFields.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={() => navigate('/event-organization/resources')}
            className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Resources
          </Button>
        </div>
        <div className="flex items-center justify-center h-64">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-pink-400"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <Button
          onClick={() => navigate('/event-organization/resources')}
          className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
        
        <h1 className="text-2xl font-bold text-white">Manage Resource Types</h1>

        <Button
          onClick={handleAddType}
          className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Type
        </Button>
      </div>

      {/* Description */}
      <p className="text-neutral-400">
        Create custom resource types with dynamic fields for your events.
      </p>

      {/* Add/Edit Form */}
      {showAddForm && (
        <Card className="bg-neutral-900/60 border-neutral-800 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">
            {editingType ? 'Edit Resource Type' : 'Add New Resource Type'}
          </h3>
          
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Type Name *
            </label>
            <Input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              placeholder="Enter type name (e.g., Audio Equipment, Staff, Vehicles)"
              className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              required
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Description
            </label>
            <Input
              type="text"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Enter description"
              className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
            />
          </div>

          {/* Custom Fields Section */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <label className="block text-sm font-medium text-white">
                Custom Fields ({formData.customFields.length})
              </label>
              <Button
                type="button"
                onClick={addCustomField}
                className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50 text-xs px-3 py-1"
              >
                <Plus className="w-3 h-3 mr-1" />
                Add Field
              </Button>
            </div>
            
            {formData.customFields.length > 0 && (
              <div className="space-y-3">
                {formData.customFields.map((field, index) => (
                  <div key={index} className="flex items-end gap-3 p-3 bg-neutral-800/50 rounded-xl border border-neutral-700">
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Field Name
                      </label>
                      <Input
                        type="text"
                        value={field.name}
                        onChange={(e) => updateCustomField(index, 'name', e.target.value)}
                        placeholder="Enter field name"
                        className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 text-sm"
                      />
                    </div>
                    
                    <div className="flex-1">
                      <label className="block text-xs font-medium text-neutral-400 mb-1">
                        Field Type
                      </label>
                      <Select
                        value={field.type}
                        onValueChange={(value) => updateCustomField(index, 'type', value)}
                      >
                        <SelectTrigger className="bg-neutral-800 border-neutral-700 text-white text-sm">
                          <SelectValue placeholder="Select type" />
                        </SelectTrigger>
                        <SelectContent className="bg-neutral-800 border-neutral-700">
                          {fieldTypeOptions.map((option) => (
                            <SelectItem key={option.value} value={option.value} className="text-white focus:bg-neutral-700">
                              {option.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <Button
                      type="button"
                      onClick={() => removeCustomField(index)}
                      className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50 p-2"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
            
            {formData.customFields.length === 0 && (
              <div className="text-center py-8 text-neutral-500 bg-neutral-800/30 rounded-xl border border-neutral-700 border-dashed">
                <Package className="w-8 h-8 mx-auto mb-2 text-neutral-600" />
                <p className="text-sm">No custom fields added yet</p>
                <p className="text-xs text-neutral-600 mt-1">Click "Add Field" to create dynamic properties</p>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button
              onClick={handleCancel}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              onClick={handleSaveType}
              className="flex-1 bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
            >
              {editingType ? 'Update Type' : 'Add Type'}
            </Button>
          </div>
        </Card>
      )}

      {/* Resource Types Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {resourceTypes.map((type) => (
          <Card 
            key={type.id} 
            className="bg-neutral-900/60 border-neutral-800 hover:border-pink-400/30 transition-all duration-200 p-6"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-pink-400">
                  <Package className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white">{type.name}</h3>
                  {type.customFields.length > 0 && (
                    <Badge className="bg-lime-400/20 text-lime-400 border-lime-400/30 text-xs mt-1">
                      {type.customFields.length} fields
                    </Badge>
                  )}
                </div>
              </div>
              
              <div className="flex gap-2">
                <Button
                  size="sm"
                  onClick={() => handleEditType(type)}
                  className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
                >
                  <Edit className="w-4 h-4" />
                </Button>
                
                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="sm"
                      className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent className="bg-neutral-900 border-neutral-800">
                    <AlertDialogHeader>
                      <AlertDialogTitle className="text-white">Delete Resource Type</AlertDialogTitle>
                      <AlertDialogDescription className="text-neutral-400">
                        Are you sure you want to delete "{type.name}"? This will affect all resources of this type.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700">
                        Cancel
                      </AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDeleteType(type.id)}
                        className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
                      >
                        Delete
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </div>

            <p className="text-neutral-400 text-sm mb-3">{type.description}</p>
            
            {/* Show custom fields */}
            {type.customFields.length > 0 && (
              <div className="mb-3">
                <p className="text-xs text-neutral-500 mb-2">Custom Fields:</p>
                <div className="flex flex-wrap gap-1">
                  {type.customFields.map((field, index) => (
                    <Badge key={index} className="bg-blue-400/20 text-blue-400 border-blue-400/30 text-xs">
                      {field.name} ({field.type.toLowerCase()})
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            
            <div className="text-xs text-neutral-500">
              Status: {type.isActive ? (
                <span className="text-green-400">Active</span>
              ) : (
                <span className="text-red-400">Inactive</span>
              )}
            </div>
          </Card>
        ))}
      </div>

      {resourceTypes.length === 0 && (
        <Card className="bg-neutral-900/60 border-neutral-800 p-12 text-center">
          <Settings className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">No resource types</h3>
          <p className="text-neutral-500 mb-6">
            Get started by adding your first custom resource type with dynamic fields.
          </p>
          <Button 
            onClick={handleAddType}
            className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add Resource Type
          </Button>
        </Card>
      )}
    </div>
  );
};

export default ManageResourceTypes;