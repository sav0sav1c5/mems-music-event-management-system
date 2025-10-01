import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Save, Package, Users, Truck, Building, Wrench, Hash, FileText } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { resourceService } from '../services/resourceService';
import type { Resource } from '../services/resourceService';
import type { CreateResourceDto } from '../services/resourceService';

const AddResource = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(id);
  
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    type: 'Equipment' as Resource['type'],
    description: '',
    quantity: '1',
    available: '1',
    status: 'AVAILABLE' as Resource['status'],
    model: '',
    role: '',
    vehicleType: '',
    capacity: '',
    specifications: ''
  });

  const resourceTypes = [
    { value: 'Equipment', label: 'Equipment', icon: Package },
    { value: 'Staff', label: 'Staff', icon: Users },
    { value: 'Vehicle', label: 'Vehicle', icon: Truck },
    { value: 'Infrastructure', label: 'Infrastructure', icon: Building },
    { value: 'Services', label: 'Services', icon: Wrench }
  ];

  const statusOptions = [
    { value: 'AVAILABLE', label: 'Available' },
    { value: 'UNAVAILABLE', label: 'Unavailable' }
  ];

  useEffect(() => {
    if (isEditing && id) {
      loadResource(parseInt(id));
    }
  }, [isEditing, id]);

  const loadResource = async (resourceId: number) => {
    try {
      setLoading(true);
      const resource = await resourceService.getResourceById(resourceId);
      
      setFormData({
        name: resource.name,
        type: resource.type,
        description: resource.description,
        quantity: resource.quantity.toString(),
        available: resource.available.toString(),
        status: resource.status,
        model: resource.model || '',
        role: resource.role || '',
        vehicleType: resource.vehicleType || '',
        capacity: resource.capacity || '',
        specifications: resource.specifications || ''
      });
    } catch (error) {
      console.error('Error loading resource:', error);
      navigate('/event-organization/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name.trim() || !formData.description.trim()) {
      alert('Please fill in all required fields');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const available = parseInt(formData.available);

    if (isNaN(quantity) || quantity < 1) {
      alert('Please enter a valid quantity (minimum 1)');
      return;
    }

    if (isNaN(available) || available < 0 || available > quantity) {
      alert('Available quantity must be between 0 and total quantity');
      return;
    }

    try {
      setSaving(true);
      
      const resourceData: CreateResourceDto = {
        name: formData.name.trim(),
        type: formData.type,
        description: formData.description.trim(),
        quantity: quantity,
        available: available,
        status: formData.status,
        model: formData.model.trim() || undefined,
        role: formData.role.trim() || undefined,
        vehicleType: formData.vehicleType.trim() || undefined,
        capacity: formData.capacity.trim() || undefined,
        specifications: formData.specifications.trim() || undefined
      };

      if (isEditing && id) {
        await resourceService.updateResource(parseInt(id), { ...resourceData, id: parseInt(id) });
      } else {
        await resourceService.createResource(resourceData);
      }

      navigate('/event-organization/resources');
    } catch (error) {
      console.error('Error saving resource:', error);
      alert('Failed to save resource. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/event-organization/resources');
  };

  const getTypeIcon = (type: string) => {
    const typeObj = resourceTypes.find(t => t.value === type);
    const IconComponent = typeObj?.icon || Package;
    return <IconComponent className="w-4 h-4" />;
  };

  const renderTypeSpecificFields = () => {
    switch (formData.type) {
      case 'Equipment':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Model
              </label>
              <Input
                type="text"
                value={formData.model}
                onChange={(e) => handleInputChange('model', e.target.value)}
                placeholder="Enter equipment model"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Specifications
              </label>
              <Input
                type="text"
                value={formData.specifications}
                onChange={(e) => handleInputChange('specifications', e.target.value)}
                placeholder="Enter specifications"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>
          </div>
        );
      
      case 'Staff':
        return (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Role/Position
            </label>
            <Input
              type="text"
              value={formData.role}
              onChange={(e) => handleInputChange('role', e.target.value)}
              placeholder="Enter staff role or position"
              className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
            />
          </div>
        );
        
      case 'Vehicle':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Vehicle Type
              </label>
              <Input
                type="text"
                value={formData.vehicleType}
                onChange={(e) => handleInputChange('vehicleType', e.target.value)}
                placeholder="e.g., Truck, Van, Car"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Capacity
              </label>
              <Input
                type="text"
                value={formData.capacity}
                onChange={(e) => handleInputChange('capacity', e.target.value)}
                placeholder="e.g., 10 passengers, 5000kg"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
              />
            </div>
          </div>
        );
        
      case 'Infrastructure':
        return (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Capacity
            </label>
            <Input
              type="text"
              value={formData.capacity}
              onChange={(e) => handleInputChange('capacity', e.target.value)}
              placeholder="e.g., 500 people, 10000 sqft"
              className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
            />
          </div>
        );
        
      case 'Services':
        return (
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              Service Specifications
            </label>
            <Input
              type="text"
              value={formData.specifications}
              onChange={(e) => handleInputChange('specifications', e.target.value)}
              placeholder="Enter service specifications"
              className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
            />
          </div>
        );
        
      default:
        return null;
    }
  };

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex items-center gap-4 mb-6">
          <Button
            onClick={handleCancel}
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
          onClick={handleCancel}
          className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Resources
        </Button>
        
        <h1 className="text-2xl font-bold text-white">
          {isEditing ? 'Edit Resource' : 'Add New Resource'}
        </h1>

        <div className="w-32" /> {/* Spacer for centering */}
      </div>

      {/* Form */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Resource Name *
              </label>
              <Input
                type="text"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter resource name"
                className="bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Resource Type *
              </label>
              <select
                value={formData.type}
                onChange={(e) => handleInputChange('type', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
                required
              >
                {resourceTypes.map(type => (
                  <option key={type.value} value={type.value} className="bg-neutral-800 flex items-center">
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Quantities */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                <Hash className="w-4 h-4 inline mr-2" />
                Total Quantity *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                placeholder="1"
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Available Quantity *
              </label>
              <Input
                type="number"
                min="0"
                max={formData.quantity}
                value={formData.available}
                onChange={(e) => handleInputChange('available', e.target.value)}
                placeholder="1"
                className="bg-neutral-800 border-neutral-700 text-white"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Status
              </label>
              <select
                value={formData.status}
                onChange={(e) => handleInputChange('status', e.target.value)}
                className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md focus:outline-none focus:ring-2 focus:ring-pink-400"
              >
                {statusOptions.map(option => (
                  <option key={option.value} value={option.value} className="bg-neutral-800">
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-white mb-2">
              <FileText className="w-4 h-4 inline mr-2" />
              Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              placeholder="Enter resource description..."
              rows={3}
              className="w-full px-3 py-2 bg-neutral-800 border border-neutral-700 text-white rounded-md placeholder-neutral-500 focus:outline-none focus:ring-2 focus:ring-pink-400 resize-vertical"
              required
            />
          </div>

          {/* Type-specific Fields */}
          {renderTypeSpecificFields()}

          {/* Action Buttons */}
          <div className="flex gap-4 pt-6">
            <Button
              type="button"
              onClick={handleCancel}
              className="flex-1 bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={saving}
              className="flex-1 bg-lime-400/20 hover:bg-lime-400/30 text-lime-400 border border-lime-400/30 hover:border-lime-400/50"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-lime-400 mr-2"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-4 h-4 mr-2" />
                  {isEditing ? 'Update Resource' : 'Create Resource'}
                </>
              )}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
};

export default AddResource;