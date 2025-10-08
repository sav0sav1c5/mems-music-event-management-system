import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { PricingRuleService } from '../services/pricingRuleService';
import { EventService } from '../../event-organization/services/eventService';
import { TicketTypeService } from '../services/ticketTypeService';
import type { PricingRuleResponse } from '../types';
import type { EventResponse } from '../../event-organization/types/api/event';
import type { TicketTypeResponse } from '../types/api/ticketType';
import { toast } from 'react-toastify';

import PricingRuleHeader from '../components/pricing-rules/PricingRuleHeader';
import PricingRuleStats from '../components/pricing-rules/PricingRuleStats';
import PricingRuleList from '../components/pricing-rules/PricingRuleList';

const PricingRules = () => {
  const navigate = useNavigate();
  const [pricingRules, setPricingRules] = useState<PricingRuleResponse[]>([]);
  const [events, setEvents] = useState<EventResponse[]>([]);
  const [ticketTypes, setTicketTypes] = useState<TicketTypeResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [eventFilter, setEventFilter] = useState('all');

  // Fetch all data
  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const [rulesData, eventsData, ticketTypesData] = await Promise.all([
        PricingRuleService.getAllPricingRules(),
        EventService.getAllEvents(),
        TicketTypeService.getAllTicketTypes()
      ]);

      setPricingRules(rulesData);
      setEvents(eventsData);
      setTicketTypes(ticketTypesData);
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch data. Please try again.';
      setError(errorMessage);
      console.error('Error fetching data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteRule = async (ruleId: number) => {
    if (!confirm('Are you sure you want to delete this pricing rule?')) return;
    
    try {
      setError(null);
      await PricingRuleService.deletePricingRule(ruleId);
      setPricingRules(prev => prev.filter(rule => rule.pricingRuleId !== ruleId));
      
      toast.success('Pricing rule deleted successfully!');
    } catch (err: any) {
      setError(err.message || 'Failed to delete pricing rule');
      toast.error(err.message || 'Failed to delete pricing rule');
    }
  };

  const handleCreateNew = () => {
    navigate('/ticket-sales/pricing-rules/new');
  };

  const handleEdit = (rule: PricingRuleResponse) => {
    navigate(`/ticket-sales/pricing-rules/${rule.pricingRuleId}`);
  };

  const handleView = (rule: PricingRuleResponse) => {
    navigate(`/ticket-sales/pricing-rules/${rule.pricingRuleId}`);
  };

  // Filter pricing rules
  const getFilteredRules = () => {
    let result = [...pricingRules];
    
    if (searchTerm) {
      result = result.filter(rule => 
        rule.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        rule.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }
    
    if (conditionFilter !== 'all') {
      result = result.filter(rule => rule.pricingCondition.toString() === conditionFilter);
    }
    
    if (eventFilter !== 'all') {
      result = result.filter(rule => 
        rule.eventIds?.includes(parseInt(eventFilter))
      );
    }
    
    return result;
  };

  const filteredRules = getFilteredRules();

  return (
    <div className="bg-neutral-900/60 backdrop-blur-sm border border-neutral-800 rounded-xl shadow-xl h-full">
      <div className="text-white h-full flex flex-col p-4 m-1">
        <div className="flex-1 flex flex-col min-h-0">
          <PricingRuleHeader
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            conditionFilter={conditionFilter}
            onConditionFilterChange={setConditionFilter}
            eventFilter={eventFilter}
            onEventFilterChange={setEventFilter}
            events={events}
            onCreateNew={handleCreateNew}
            error={error}
          />

          <PricingRuleStats pricingRules={pricingRules} />

          <PricingRuleList
            loading={loading}
            rules={filteredRules}
            events={events}
            ticketTypes={ticketTypes}
            eventFilter={eventFilter}
            onEdit={handleEdit}
            onDelete={handleDeleteRule}
            onView={handleView}
          />
        </div>
      </div>
    </div>
  );
};

export default PricingRules;