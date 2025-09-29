using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;

        public EventService(IEventRepository eventRepository)
        {
            _eventRepository = eventRepository;
        }

        public async Task<IEnumerable<Event>> GetAllEventsAsync()
        {
            return await _eventRepository.GetAllAsync();
        }

        public async Task<Event?> GetEventByIdAsync(int id)
        {
            return await _eventRepository.GetByIdAsync(id);
        }

        public async Task<Event> CreateEventAsync(Event @event)
        {
            @event.CreatedAt = DateTime.UtcNow;
            @event.UpdatedAt = DateTime.UtcNow;
            await _eventRepository.AddAsync(@event);
            await _eventRepository.SaveChangesAsync();
            return @event;
        }

        public async Task<Event?> UpdateEventAsync(int id, Event @event)
        {
            var existingEvent = await _eventRepository.GetByIdAsync(id);
            if (existingEvent == null)
            {
                return null;
            }

            existingEvent.Name = @event.Name;
            existingEvent.Description = @event.Description;
//            existingEvent.EventInterval = @event.EventInterval;
            existingEvent.Status = @event.Status;
            existingEvent.LocationId = @event.LocationId;
            existingEvent.CreatedById = @event.CreatedById;
            existingEvent.UpdatedAt = DateTime.UtcNow;

            _eventRepository.Update(existingEvent);
            await _eventRepository.SaveChangesAsync();
            return existingEvent;
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
    }
}