import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Edit, Trash2, Package, Users, Truck, Building, Wrench, Briefcase, CheckCircle, XCircle } from 'lucide-react';
import { Button } from './../../shared/components/ui/button';
import { Card } from './../../shared/components/ui/card';
import { Badge } from './../../shared/components/ui/badge';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from './../../../../components/ui/alert-dialog';
import { resourceService } from '../services/resourceService';
import type { Resource } from '../services/resourceService';

const ResourceDetails = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [resource, setResource] = useState<Resource | null>(null);
  const [loading, setLoading] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (id) {
      loadResource(parseInt(id));
    }
  }, [id]);

  const loadResource = async (resourceId: number) => {
    try {
      setLoading(true);
      const resourceData = await resourceService.getResourceById(resourceId);
      setResource(resourceData);
    } catch (error) {
      console.error('Error loading resource:', error);
      navigate('/event-organization/resources');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!resource) return;
    
    try {
      setDeleting(true);
      await resourceService.deleteResource(resource.id);
      navigate('/event-organization/resources');
    } catch (error) {
      console.error('Error deleting resource:', error);
      alert('Failed to delete resource. Please try again.');
    } finally {
      setDeleting(false);
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Equipment':
        return <Package className="w-8 h-8" />;
      case 'Staff':
        return <Users className="w-8 h-8" />;
      case 'Vehicle':
        return <Truck className="w-8 h-8" />;
      case 'Infrastructure':
        return <Building className="w-8 h-8" />;
      case 'Services':
        return <Wrench className="w-8 h-8" />;
      default:
        return <Briefcase className="w-8 h-8" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Equipment':
        return 'text-blue-400';
      case 'Staff':
        return 'text-green-400';
      case 'Vehicle':
        return 'text-yellow-400';
      case 'Infrastructure':
        return 'text-purple-400';
      case 'Services':
        return 'text-orange-400';
      default:
        return 'text-neutral-400';
    }
  };

  const getStatusColor = (status: string | undefined) => {
    const safeStatus = status ? String(status) : '';
    switch (safeStatus) {
      case 'AVAILABLE':
        return 'bg-green-400/20 text-green-400 border-green-400/30';
      case 'UNAVAILABLE':
        return 'bg-red-400/20 text-red-400 border-red-400/30';
      default:
        return 'bg-neutral-400/20 text-neutral-400 border-neutral-400/30';
    }
  };

  const renderTypeSpecificFields = (resource: Resource) => {
    switch (resource.type) {
      case 'Equipment':
        return (
          <div className="space-y-4">
            {resource.model && (
              <div>
                <p className="text-neutral-400 text-sm">Model</p>
                <p className="text-white font-medium">{resource.model}</p>
              </div>
            )}
            {resource.serialNumber && (
              <div>
                <p className="text-neutral-400 text-sm">Serial Number</p>
                <p className="text-white font-medium">{resource.serialNumber}</p>
              </div>
            )}
            {resource.powerRequirements && (
              <div>
                <p className="text-neutral-400 text-sm">Power Requirements</p>
                <p className="text-white font-medium">{resource.powerRequirements}</p>
              </div>
            )}
            {resource.requiresSetup !== undefined && (
              <div>
                <p className="text-neutral-400 text-sm">Requires Setup</p>
                <p className="text-white font-medium">{resource.requiresSetup ? 'Yes' : 'No'}</p>
              </div>
            )}
          </div>
        );

      case 'Staff':
        return (
          <div className="space-y-4">
            {resource.role && (
              <div>
                <p className="text-neutral-400 text-sm">Role</p>
                <p className="text-white font-medium">{resource.role}</p>
              </div>
            )}
            {resource.skillLevel && (
              <div>
                <p className="text-neutral-400 text-sm">Skill Level</p>
                <Badge className="bg-blue-400/20 text-blue-400 border-blue-400/30">
                  {resource.skillLevel}
                </Badge>
              </div>
            )}
          </div>
        );

      case 'Vehicle':
        return (
          <div className="space-y-4">
            {resource.vehicleType && (
              <div>
                <p className="text-neutral-400 text-sm">Vehicle Type</p>
                <p className="text-white font-medium">{resource.vehicleType}</p>
              </div>
            )}
            {resource.licensePlate && (
              <div>
                <p className="text-neutral-400 text-sm">License Plate</p>
                <p className="text-white font-medium">{resource.licensePlate}</p>
              </div>
            )}
            {resource.capacity && (
              <div>
                <p className="text-neutral-400 text-sm">Capacity</p>
                <p className="text-white font-medium">{resource.capacity} kg</p>
              </div>
            )}
            {resource.fuelType && (
              <div>
                <p className="text-neutral-400 text-sm">Fuel Type</p>
                <p className="text-white font-medium">{resource.fuelType}</p>
              </div>
            )}
            {resource.driver && (
              <div>
                <p className="text-neutral-400 text-sm">Driver</p>
                <p className="text-white font-medium">{resource.driver}</p>
              </div>
            )}
          </div>
        );

      case 'Infrastructure':
        return (
          <div className="space-y-4">
            {resource.size && (
              <div>
                <p className="text-neutral-400 text-sm">Size</p>
                <Badge className="bg-purple-400/20 text-purple-400 border-purple-400/30">
                  {resource.size}
                </Badge>
              </div>
            )}
            {resource.weight && (
              <div>
                <p className="text-neutral-400 text-sm">Weight</p>
                <p className="text-white font-medium">{resource.weight}</p>
              </div>
            )}
            {resource.setupTime && (
              <div>
                <p className="text-neutral-400 text-sm">Setup Time</p>
                <p className="text-white font-medium">{resource.setupTime}</p>
              </div>
            )}
          </div>
        );

      case 'Services':
        return (
          <div className="space-y-4">
            {resource.provider && (
              <div>
                <p className="text-neutral-400 text-sm">Provider</p>
                <Badge className="bg-orange-400/20 text-orange-400 border-orange-400/30">
                  {resource.provider}
                </Badge>
              </div>
            )}
            {resource.contactPhone && (
              <div>
                <p className="text-neutral-400 text-sm">Contact Phone</p>
                <p className="text-white font-medium">{resource.contactPhone}</p>
              </div>
            )}
            {resource.serviceDuration && (
              <div>
                <p className="text-neutral-400 text-sm">Service Duration</p>
                <p className="text-white font-medium">{resource.serviceDuration}</p>
              </div>
            )}
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

  if (!resource) {
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
        <Card className="bg-neutral-900/60 border-neutral-800 p-12 text-center">
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">Resource not found</h3>
          <p className="text-neutral-500">The resource you're looking for doesn't exist.</p>
        </Card>
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
        
        <h1 className="text-2xl font-bold text-white">Resource Details</h1>

        <div className="flex gap-2">
          <Button
            onClick={() => navigate(`/event-organization/resources/${resource.id}/edit`)}
            className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
          >
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button
                className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
              >
                <Trash2 className="w-4 h-4 mr-2" />
                Delete
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="bg-neutral-900 border-neutral-800">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-white">Delete Resource</AlertDialogTitle>
                <AlertDialogDescription className="text-neutral-400">
                  Are you sure you want to delete "{resource.name}"? This action cannot be undone.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="bg-neutral-800 hover:bg-neutral-700 text-white border-neutral-700">
                  Cancel
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={handleDelete}
                  disabled={deleting}
                  className="bg-red-400/20 hover:bg-red-400/30 text-red-400 border border-red-400/30 hover:border-red-400/50"
                >
                  {deleting ? 'Deleting...' : 'Delete'}
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>

      {/* Resource Info */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-8">
        <div className="flex items-start justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className={`${getTypeColor(resource.type)}`}>
              {getTypeIcon(resource.type)}
            </div>
            <div>
              <h2 className="text-3xl font-bold text-white">{resource.name}</h2>
              <p className="text-neutral-400 mt-1">{resource.type}</p>
              <Badge className={`${getStatusColor(resource.status)} border mt-2`}>
                <div className="flex items-center gap-1">
                  {resource.status === 'AVAILABLE' ? 
                    <CheckCircle className="w-4 h-4" /> : 
                    <XCircle className="w-4 h-4" />
                  }
                  {resource.status}
                </div>
              </Badge>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Basic Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">Basic Information</h3>
            
            <div>
              <p className="text-neutral-400 text-sm">Description</p>
              <p className="text-white font-medium">{resource.description}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-neutral-400 text-sm">Total Quantity</p>
                <p className="text-white font-medium text-xl">{resource.quantity}</p>
              </div>
              <div>
                <p className="text-neutral-400 text-sm">Available</p>
                <p className={`font-medium text-xl ${resource.available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {resource.available}
                </p>
              </div>
            </div>

            {/* Availability Bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <p className="text-neutral-400 text-sm">Availability</p>
                <p className="text-neutral-400 text-sm">
                  {Math.round((resource.available / resource.quantity) * 100)}%
                </p>
              </div>
              <div className="w-full bg-neutral-800 rounded-full h-3">
                <div 
                  className="bg-pink-400 h-3 rounded-full transition-all duration-300"
                  style={{ width: `${(resource.available / resource.quantity) * 100}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Type-specific Information */}
          <div className="space-y-6">
            <h3 className="text-xl font-semibold text-white mb-4">{resource.type} Details</h3>
            {renderTypeSpecificFields(resource)}
          </div>
        </div>

        {/* Custom Attributes */}
        {resource.customAttributes && Object.keys(resource.customAttributes).length > 0 && (
          <div className="mt-8 pt-8 border-t border-neutral-800">
            <h3 className="text-xl font-semibold text-white mb-4">Custom Attributes</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {Object.entries(resource.customAttributes).map(([key, value]) => (
                <div key={key}>
                  <p className="text-neutral-400 text-sm capitalize">{key.replace(/([A-Z])/g, ' $1')}</p>
                  <p className="text-white font-medium">{String(value)}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </Card>
    </div>
  );
};

export default ResourceDetails;