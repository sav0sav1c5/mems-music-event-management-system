import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Briefcase, Search, Filter, Settings, Package, Users, Truck, Building, Wrench, CheckCircle, XCircle, ArrowLeft } from 'lucide-react';
import { Button } from '../../shared/components/ui/button';
import { Input } from '../../shared/components/ui/input';
import { Card } from '../../shared/components/ui/card';
import { Badge } from '../../shared/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './../../../../components/ui/dialog';
import { Label } from './../../../../components/ui/label';
import { resourceService } from '../services/resourceService';
import type { Resource as ExtendedResource } from '../services/resourceService';
import { performanceResourceService } from '../services/performanceResourceService';
import { PerformanceResourceStatus } from '../../shared/types/enums';

const Resources = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [resources, setResources] = useState<ExtendedResource[]>([]);
  const [filteredResources, setFilteredResources] = useState<ExtendedResource[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  
  // Assignment modal state
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [selectedResource, setSelectedResource] = useState<ExtendedResource | null>(null);
  const [quantityToAssign, setQuantityToAssign] = useState(1);
  const [assigning, setAssigning] = useState(false);
  
  // Check if we're in assignment mode
  const assignToPerformanceId = location.state?.assignToPerformance;

  useEffect(() => {
    loadResources();
  }, []);

  // Handle assignment mode
  useEffect(() => {
    if (assignToPerformanceId) {
      // Automatically show instructions for assignment mode
      setSearchTerm(''); // Clear search to show all resources
    }
  }, [assignToPerformanceId]);

  useEffect(() => {
    filterResources();
  }, [resources, searchTerm, typeFilter, statusFilter]);

  const loadResources = async () => {
    try {
      setLoading(true);
      const data = await resourceService.getAllResources();
      setResources(data);
    } catch (error) {
      console.error('Error loading resources:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterResources = () => {
    let filtered = resources;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(resource =>
        resource.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        resource.type?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Apply type filter
    if (typeFilter !== 'ALL') {
      filtered = filtered.filter(resource => resource.type && resource.type === typeFilter);
    }

    // Apply status filter
    if (statusFilter !== 'ALL') {
      filtered = filtered.filter(resource => resource.status && String(resource.status) === statusFilter);
    }

    setFilteredResources(filtered);
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'Equipment':
        return <Package className="w-5 h-5" />;
      case 'Staff':
        return <Users className="w-5 h-5" />;
      case 'Vehicle':
        return <Truck className="w-5 h-5" />;
      case 'Infrastructure':
        return <Building className="w-5 h-5" />;
      case 'Services':
        return <Wrench className="w-5 h-5" />;
      default:
        return <Briefcase className="w-5 h-5" />;
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

  const getStatusIcon = (status: string | undefined) => {
    const safeStatus = status ? String(status) : '';
    switch (safeStatus) {
      case 'AVAILABLE':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'UNAVAILABLE':
        return <XCircle className="w-4 h-4 text-red-400" />;
      default:
        return <XCircle className="w-4 h-4 text-neutral-400" />;
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

  const handleAssignResource = (resource: ExtendedResource) => {
    setSelectedResource(resource);
    setQuantityToAssign(Math.min(1, resource.available || 0));
    setShowAssignModal(true);
  };

  const confirmAssignment = async () => {
    if (!selectedResource || !assignToPerformanceId) return;
    
    try {
      setAssigning(true);
      await performanceResourceService.assignResourceToPerformance(
        assignToPerformanceId,
        selectedResource.id,
        quantityToAssign
      );
      
      toast.success(`Resource "${selectedResource.name}" assigned to performance successfully`);
      setShowAssignModal(false);
      
      // Navigate back to performance details
      navigate(`/event-organization/performances/${assignToPerformanceId}`);
    } catch (error) {
      console.error('Error assigning resource:', error);
      toast.error('Failed to assign resource. Please try again.');
    } finally {
      setAssigning(false);
    }
  };

  const cancelAssignment = () => {
    setShowAssignModal(false);
    setSelectedResource(null);
    setQuantityToAssign(1);
  };

  const getResourceStats = () => {
    const typeStats = resources.reduce((acc, resource) => {
      acc[resource.type] = (acc[resource.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: resources.length,
      available: resources.filter(r => r.status === 'AVAILABLE').length,
      unavailable: resources.filter(r => r.status === 'UNAVAILABLE').length,
      ...typeStats
    };
  };

  const stats = getResourceStats();

  const resourceTypes = ['Equipment', 'Staff', 'Vehicle', 'Infrastructure', 'Services'];

  if (loading) {
    return (
      <div className="text-white h-full flex flex-col">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h1 className="text-2xl font-bold text-white">Resources</h1>
            <p className="text-neutral-400">
              Resource creation and management
            </p>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-neutral-800/50 rounded-xl p-6 animate-pulse">
              <div className="h-4 bg-neutral-700 rounded w-3/4 mb-2"></div>
              <div className="h-4 bg-neutral-700 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-neutral-700 rounded w-full"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="text-white h-full flex flex-col space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div className="flex items-center gap-4">
          {assignToPerformanceId && (
            <Button
              onClick={() => navigate(`/event-organization/performances/${assignToPerformanceId}`)}
              className="bg-neutral-800 hover:bg-neutral-700 text-white border border-neutral-700"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Performance
            </Button>
          )}
          <div>
            <h1 className="text-2xl font-bold text-white">
              {assignToPerformanceId ? 'Assign Resource to Performance' : 'Resources'}
            </h1>
            <p className="text-neutral-400">
              {assignToPerformanceId 
                ? 'Select a resource to assign to the performance'
                : 'Resource creation and management'
              }
            </p>
          </div>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => navigate('/event-organization/resources/types')}
            className="bg-neutral-800 hover:bg-neutral-700 px-4 py-2 rounded-xl text-white transition-all duration-200 border border-neutral-700 hover:border-pink-400/30 group"
          >
            <Settings className="w-4 h-4 mr-2 group-hover:text-pink-400 transition-colors" />
            <span className="font-medium group-hover:text-pink-400 transition-colors">Manage Types</span>
          </Button>
          <Button 
            onClick={() => navigate('/event-organization/resources/add')}
            className="bg-pink-400/20 hover:bg-pink-400/30 px-4 py-2 rounded-xl text-pink-400 border border-pink-400/30 hover:border-pink-400/50 transition-all duration-200"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            <span className="font-medium">Add Resources</span>
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
        <Card className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
          <p className="text-neutral-400 text-sm">Total</p>
          <p className="text-2xl font-bold text-white">{stats.total}</p>
        </Card>
        <Card className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
          <p className="text-neutral-400 text-sm">Available</p>
          <p className="text-2xl font-bold text-green-400">{stats.available}</p>
        </Card>
        {resourceTypes.map((type) => (
          <Card key={type} className="bg-neutral-900/60 border-neutral-800 p-4 text-center">
            <p className="text-neutral-400 text-sm">{type}</p>
            <p className={`text-2xl font-bold ${getTypeColor(type)}`}>
              {stats[type] || 0}
            </p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="bg-neutral-900/60 border-neutral-800 p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-neutral-500 w-4 h-4" />
            <Input
              placeholder="Search resources..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 bg-neutral-800 border-neutral-700 text-white placeholder-neutral-500 focus:border-pink-400/50 focus:ring-pink-400/20"
            />
          </div>
          
          <div className="flex flex-wrap gap-2">
            <Button
              variant={typeFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setTypeFilter('ALL')}
              size="sm"
              className={`${typeFilter === 'ALL' ? 'bg-pink-400/20 text-pink-400 border-pink-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              All Types
            </Button>
            {resourceTypes.map((type) => (
              <Button
                key={type}
                variant={typeFilter === type ? 'default' : 'outline'}
                onClick={() => setTypeFilter(type)}
                size="sm"
                className={`${typeFilter === type ? 'bg-pink-400/20 text-pink-400 border-pink-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
              >
                {type}
              </Button>
            ))}
          </div>

          <div className="flex gap-2">
            <Button
              variant={statusFilter === 'ALL' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('ALL')}
              size="sm"
              className={`${statusFilter === 'ALL' ? 'bg-pink-400/20 text-pink-400 border-pink-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              All Status
            </Button>
            <Button
              variant={statusFilter === 'AVAILABLE' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('AVAILABLE')}
              size="sm"
              className={`${statusFilter === 'AVAILABLE' ? 'bg-green-400/20 text-green-400 border-green-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              Available
            </Button>
            <Button
              variant={statusFilter === 'UNAVAILABLE' ? 'default' : 'outline'}
              onClick={() => setStatusFilter('UNAVAILABLE')}
              size="sm"
              className={`${statusFilter === 'UNAVAILABLE' ? 'bg-red-400/20 text-red-400 border-red-400/30' : 'border-neutral-700 text-neutral-400 hover:text-white'}`}
            >
              Unavailable
            </Button>
          </div>
        </div>
      </Card>

      {/* Resources Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card 
            key={resource.id} 
            className="bg-neutral-900/60 border-neutral-800 hover:border-pink-400/30 transition-all duration-200 cursor-pointer p-6 group"
            onClick={() => navigate(`/event-organization/resources/${resource.id}`)}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className={`${getTypeColor(resource.type)}`}>
                  {getTypeIcon(resource.type)}
                </div>
                <div>
                  <h3 className="font-semibold text-white group-hover:text-pink-400 transition-colors">
                    {resource.name}
                  </h3>
                  <p className="text-neutral-400 text-sm">{resource.type}</p>
                </div>
              </div>
              <Badge className={`${getStatusColor(resource.status)} border`}>
                <div className="flex items-center gap-1">
                  {getStatusIcon(resource.status)}
                  <span className="text-xs">{resource.status ? String(resource.status) : 'Unknown'}</span>
                </div>
              </Badge>
            </div>

            <p className="text-neutral-400 text-sm mb-4 line-clamp-2">
              {resource.description}
            </p>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-sm">Total Quantity:</span>
                <span className="text-white font-medium">{resource.quantity}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-neutral-400 text-sm">Available:</span>
                <span className={`font-medium ${resource.available > 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {resource.available}
                </span>
              </div>
              {resource.available < resource.quantity && (
                <div className="w-full bg-neutral-800 rounded-full h-2">
                  <div 
                    className="bg-pink-400 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${(resource.available / resource.quantity) * 100}%` }}
                  ></div>
                </div>
              )}
            </div>

            {/* Type-specific information */}
            {resource.type === 'Equipment' && resource.model && (
              <div className="text-neutral-400 text-sm mb-2">
                <span>Model: {resource.model}</span>
              </div>
            )}
            {resource.type === 'Staff' && resource.role && (
              <div className="text-neutral-400 text-sm mb-2">
                <span>Role: {resource.role}</span>
              </div>
            )}
            {resource.type === 'Vehicle' && resource.vehicleType && (
              <div className="text-neutral-400 text-sm mb-2">
                <span>Type: {resource.vehicleType}</span>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-neutral-800">
              {assignToPerformanceId ? (
                <>
                  <div className="text-neutral-400 text-sm">
                    Available: {resource.available || 0}
                  </div>
                  <Button
                    size="sm"
                    disabled={!resource.available || resource.available <= 0}
                    className="bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 border border-orange-400/30 hover:border-orange-400/50 disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAssignResource(resource);
                    }}
                  >
                    {resource.available && resource.available > 0 ? 'Assign' : 'Not Available'}
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-neutral-700 text-neutral-400 hover:text-white hover:border-pink-400/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/event-organization/resources/${resource.id}/edit`);
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    size="sm"
                    className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
                    onClick={(e) => {
                      e.stopPropagation();
                      navigate(`/event-organization/resources/${resource.id}`);
                    }}
                  >
                    View Details
                  </Button>
                </>
              )}
            </div>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <Card className="bg-neutral-900/60 border-neutral-800 p-12 text-center">
          <Briefcase className="w-12 h-12 text-neutral-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-neutral-400 mb-2">No resources found</h3>
          <p className="text-neutral-500 mb-6">
            {searchTerm || typeFilter !== 'ALL' || statusFilter !== 'ALL'
              ? 'Try adjusting your search or filter criteria.' 
              : 'Get started by adding your first resource.'
            }
          </p>
          <Button 
            onClick={() => navigate('/event-organization/resources/add')}
            className="bg-pink-400/20 hover:bg-pink-400/30 text-pink-400 border border-pink-400/30 hover:border-pink-400/50"
          >
            <Briefcase className="w-4 h-4 mr-2" />
            Add Resource
          </Button>
        </Card>
      )}

      {/* Assignment Modal */}
      <Dialog open={showAssignModal} onOpenChange={setShowAssignModal}>
        <DialogContent className="bg-neutral-900 border-neutral-800 text-white">
          <DialogHeader>
            <DialogTitle>Assign Resource to Performance</DialogTitle>
            <DialogDescription className="text-neutral-400">
              Specify how many units of this resource you need for the performance.
            </DialogDescription>
          </DialogHeader>
          
          {selectedResource && (
            <div className="space-y-4">
              <div className="bg-neutral-800/50 p-4 rounded-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className={`${getTypeColor(selectedResource.type)}`}>
                    {getTypeIcon(selectedResource.type)}
                  </div>
                  <div>
                    <h4 className="font-semibold text-white">{selectedResource.name}</h4>
                    <p className="text-neutral-400 text-sm">{selectedResource.type}</p>
                  </div>
                </div>
                <p className="text-neutral-400 text-sm mb-2">{selectedResource.description}</p>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-neutral-400">Total Available:</span>
                  <span className="text-green-400 font-medium">{selectedResource.available || 0}</span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="quantity" className="text-neutral-300">
                  Quantity Needed
                </Label>
                <Input
                  id="quantity"
                  type="number"
                  min="1"
                  max={selectedResource.available || 0}
                  value={quantityToAssign}
                  onChange={(e) => setQuantityToAssign(Math.max(1, Math.min(parseInt(e.target.value) || 1, selectedResource.available || 0)))}
                  className="bg-neutral-800 border-neutral-700 text-white"
                />
                <p className="text-neutral-500 text-xs">
                  Maximum available: {selectedResource.available || 0}
                </p>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={cancelAssignment}
              className="border-neutral-700 text-neutral-400 hover:text-white"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmAssignment}
              disabled={assigning || !selectedResource || quantityToAssign <= 0}
              className="bg-orange-400/20 hover:bg-orange-400/30 text-orange-400 border border-orange-400/30"
            >
              {assigning ? 'Assigning...' : 'Assign Resource'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Resources;