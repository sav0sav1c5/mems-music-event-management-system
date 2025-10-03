import { useState, useEffect } from 'react';
import { TicketTypeService } from '../services/ticketTypeService';
import { ZoneService } from '../services/zoneService';
import { EventService } from '../../event-organization/services/eventService';
import type { TicketTypeResponse, ZoneResponse } from '../types';
import type { EventResponse } from '../../event-organization/types/api/event';
import type { TicketTypeCreateForm, TicketTypeUpdateForm } from '../types/forms/ticketType';
import { toast } from 'react-toastify';

import TicketTypeHeader from '../components/ticket-types/TicketTypeHeader';
import TicketTypeStats from '../components/ticket-types/TicketTypeStats';
import TicketTypeList from '../components/ticket-types/TicketTypeList';
import TicketTypeForm from '../components/ticket-types/TicketTypeForm';

const TicketTypes = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [selectedTicketType, setSelectedTicketType] = useState<TicketTypeResponse | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<'create' | 'edit'>('create');
  const [searchTerm, setSearchTerm] = useState('');
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [zones, setZones] = useState<ZoneResponse[]>([]);
  const [statusFilter, setStatusFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');
  
  // Form state
  const [submitting, setSubmitting] = useState(false);
  const [ticketTypeForm, setTicketTypeForm] = useState<TicketTypeCreateForm>({
    name: '',
    description: '',
    status: 0,
    availableQuantity: 0,
    zoneId: 0,
    eventId: 0
  });

  const [previousStats, setPreviousStats] = useState({
    activeTicketTypes: 0,
    availableTickets: 0,
    soldOut: 0,
    totalRevenue: 0
  });

  const loadTicketTypes = async () => {
    try {
      setLoading(true);
      const data = await TicketTypeService.getAllTicketTypes();
      setTicketTypes(data);
    } catch (err) {
      setError('Failed to load ticket types');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadSupportingData = async () => {
    try {
      const [zonesData, eventsData] = await Promise.all([
        ZoneService.getAllZones(),
        EventService.getAllEvents()
      ]);
      setZones(zonesData);
      setEvents(eventsData);
    } catch (err) {
      console.error('Failed to load supporting data:', err);
    }
  };

  useEffect(() => {
    loadTicketTypes();
    loadSupportingData();
  }, []);

  // CRUD Operations
  const handleCreateTicketType = async () => {
    try {
      setSubmitting(true);
      setError(null);
      
      if (!ticketTypeForm.name || ticketTypeForm.availableQuantity < 0 || 
          ticketTypeForm.zoneId === 0 || ticketTypeForm.eventId === 0) {
        setError('Please fill all required fields');
        return;
      }

      const created = await TicketTypeService.createTicketType(ticketTypeForm);
      setTicketTypes(prev => [...prev, created]);

      toast.success('Ticket type created successfully');
      closeForm();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to create ticket type');
      toast.error(err.message || 'Failed to create ticket type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleUpdateTicketType = async () => {
    if (!selectedTicketType) return;
    
    try {
      setSubmitting(true);
      setError(null);

      const updateForm: TicketTypeUpdateForm = {
        name: ticketTypeForm.name,
        description: ticketTypeForm.description,
        status: ticketTypeForm.status,
        availableQuantity: ticketTypeForm.availableQuantity,
        zoneId: ticketTypeForm.zoneId,
        eventId: ticketTypeForm.eventId
      };

      const updated = await TicketTypeService.updateTicketType(
        selectedTicketType.ticketTypeId, 
        updateForm
      );
      
      setTicketTypes(prev => 
        prev.map(type => 
          type.ticketTypeId === selectedTicketType.ticketTypeId ? updated : type
        )
      );

      toast.success('Ticket type updated successfully');
      closeForm();
      resetForm();
      
    } catch (err: any) {
      setError(err.message || 'Failed to update ticket type');
      toast.error(err.message || 'Failed to update ticket type');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteTicketType = async (ticketTypeId: number) => {
    if (!confirm('Are you sure you want to delete this ticket type?')) return;
    
    try {
      setError(null);
      await TicketTypeService.deleteTicketType(ticketTypeId);
      setTicketTypes(prev => prev.filter(type => type.ticketTypeId !== ticketTypeId));
      
      toast.success('Ticket type deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete ticket type');
      toast.error(err.message || 'Failed to delete ticket type');
    }
  };

  const resetForm = () => {
    setTicketTypeForm({
      name: '',
      description: '',
      status: 0,
      availableQuantity: 0,
      zoneId: 0,
      eventId: 0
    });
  };

  const openCreateForm = () => {
    resetForm();
    setSelectedTicketType(null);
    setFormMode('create');
    setShowForm(true);
    setError(null);
  };

  const openEditForm = (ticketType: TicketTypeResponse) => {
    setSelectedTicketType(ticketType);
    setTicketTypeForm({
      name: ticketType.name || '',
      description: ticketType.description || '',
      status: ticketType.status,
      availableQuantity: ticketType.availableQuantity,
      zoneId: ticketType.zoneId,
      eventId: ticketType.eventId
    });
    setFormMode('edit');
    setShowForm(true);
    setError(null);
  };

  const closeForm = () => {
    setShowForm(false);
    setSelectedTicketType(null);
    setFormMode('create');
    setError("");
    resetForm();
  };

  const getFilteredTicketTypes = () => {
    let result = [...ticketTypes];
    
    if (searchTerm) {
      result = result.filter(type => 
        type.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        type.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (statusFilter !== 'all') {
      result = result.filter(type => type.status.toString() === statusFilter);
    }
    
    if (eventFilter !== 'all') {
      result = result.filter(type => type.eventId.toString() === eventFilter);
    }
    
    return result;
  };

  const filteredTicketTypes = getFilteredTicketTypes();

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <div className="flex-1 flex gap-4 min-h-0">
          {/* Left Side - Header, Statistics, and Ticket Types List */}
          <div className={`flex-1 flex flex-col transition-all duration-300 ${showForm ? 'w-3/5' : 'w-full'}`}>
            
            <TicketTypeHeader
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              statusFilter={statusFilter}
              onStatusFilterChange={setStatusFilter}
              eventFilter={eventFilter}
              onEventFilterChange={setEventFilter}
              events={events}
              onCreateNew={openCreateForm}
              error={error}
              showForm={showForm}
            />

            <TicketTypeStats 
              ticketTypes={ticketTypes}
              previousStats={previousStats}
            />

            <TicketTypeList
              loading={loading}
              ticketTypes={filteredTicketTypes}
              events={events}
              zones={zones}
              eventFilter={eventFilter}
              onEdit={openEditForm}
              onDelete={handleDeleteTicketType}
            />
          </div>

          {/* Right Form Panel */}
          {showForm && (
            <div className="w-2/5 transition-all duration-300">
              <TicketTypeForm
                formMode={formMode}
                ticketTypeForm={ticketTypeForm}
                onFormChange={setTicketTypeForm}
                events={events}
                zones={zones}
                error={error}
                submitting={submitting}
                onSubmit={formMode === 'create' ? handleCreateTicketType : handleUpdateTicketType}
                onClose={closeForm}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TicketTypes;