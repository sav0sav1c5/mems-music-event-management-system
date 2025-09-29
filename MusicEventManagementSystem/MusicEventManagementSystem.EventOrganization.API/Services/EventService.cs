using MusicEventManagementSystem.Core.Enums.EventOrganization;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;

        public EventService(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllAsync();
            return events.Select(MapToResponseDto);
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(int id)
        {
            var @event = await _eventRepository.GetByIdAsync(id);
            return @event == null ? null : MapToResponseDto(@event);
        }

        public async Task<EventResponseDto> CreateEventAsync(EventCreateDto eventDto)
        {
            var @event = MapToEntity(eventDto);
            @event.CreatedAt = DateTime.UtcNow;
            @event.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.AddAsync(@event);
            await _eventRepository.SaveChangesAsync();

            return MapToResponseDto(@event);
        }

        public async Task<EventResponseDto?> UpdateEventAsync(int id, EventUpdateDto eventDto)
        {
            var existingEvent = await _eventRepository.GetByIdAsync(id);
            if (existingEvent == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(eventDto.Name))
                existingEvent.Name = eventDto.Name;

            if (!string.IsNullOrEmpty(eventDto.Description))
                existingEvent.Description = eventDto.Description;

            if (eventDto.StartDate.HasValue)
                existingEvent.StartDate = eventDto.StartDate.Value;

            if (eventDto.EndDate.HasValue)
                existingEvent.EndDate = eventDto.EndDate.Value;

            if (eventDto.Status.HasValue)
                existingEvent.Status = eventDto.Status.Value;

            if (eventDto.LocationId.HasValue)
                existingEvent.LocationId = eventDto.LocationId.Value;

            existingEvent.UpdatedAt = DateTime.UtcNow;

            _eventRepository.Update(existingEvent);
            await _eventRepository.SaveChangesAsync();

            return MapToResponseDto(existingEvent);
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            var @event = await _eventRepository.GetByIdAsync(id);
            if (@event == null)
            {
                return false;
            }

            _eventRepository.Delete(@event);
            await _eventRepository.SaveChangesAsync();
            return true;
        }

        public async Task<EventResponseDto?> GetByNameAsync(string name)
        {
            var @event = await _eventRepository.GetByNameAsync(name);
            return @event == null ? null : MapToResponseDto(@event);
        }

        public async Task<IEnumerable<EventResponseDto>> GetByStatusAsync(EventStatus status)
        {
            var events = await _eventRepository.GetByStatusAsync(status);
            return events.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<EventResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            var events = await _eventRepository.GetByDateRangeAsync(start, end);
            return events.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<EventResponseDto>> GetByCreatedByIdAsync(Guid createdById)
        {
            var events = await _eventRepository.GetByCreatedByIdAsync(createdById);
            return events.Select(MapToResponseDto);
        }

        // Helper methods for mapping
        private static EventResponseDto MapToResponseDto(Event @event)
        {
            return new EventResponseDto
            {
                Id = @event.Id,
                Name = @event.Name,
                Description = @event.Description,
                StartDate = @event.StartDate,
                EndDate = @event.EndDate,
                Status = @event.Status,
                CreatedById = @event.CreatedById,
                LocationId = @event.LocationId,
                CreatedAt = @event.CreatedAt,
                UpdatedAt = @event.UpdatedAt,
                DeletedAt = @event.DeletedAt,
                VenueIds = @event.Venues?.Select(v => v.VenueId).ToList(),
                TicketTypeIds = @event.TicketTypes?.Select(tt => tt.TicketTypeId).ToList(),
                PricingRuleIds = @event.PricingRules?.Select(pr => pr.PricingRuleId).ToList()
            };
        }

        private static Event MapToEntity(EventCreateDto dto)
        {
            return new Event
            {
                Name = dto.Name,
                Description = dto.Description,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                Status = dto.Status,
                CreatedById = dto.CreatedById,
                LocationId = dto.LocationId
            };
        }
    }
}