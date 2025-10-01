using AutoMapper;
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.Enums;

namespace MusicEventManagementSystem.API.Services
{
    public class EventService : IEventService
    {
        private readonly IEventRepository _eventRepository;
        private readonly ILocationRepository _locationRepository; // Dodaj ako ima?, za provere
        private readonly IMapper _mapper;

        public EventService(IEventRepository eventRepository, ILocationRepository locationRepository, IMapper mapper)
        {
            _eventRepository = eventRepository ?? throw new ArgumentNullException(nameof(eventRepository));
            _locationRepository = locationRepository ?? throw new ArgumentNullException(nameof(locationRepository));
            _mapper = mapper ?? throw new ArgumentNullException(nameof(mapper));
        }

        public async Task<IEnumerable<EventResponseDto>> GetAllEventsAsync()
        {
            var events = await _eventRepository.GetAllAsync(); // A?uriraj repo da ima .Include(e => e.Location)
            return _mapper.Map<IEnumerable<EventResponseDto>>(events);
        }

        public async Task<EventResponseDto?> GetEventByIdAsync(int id)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(id); // Sa .Include
            return eventEntity != null ? _mapper.Map<EventResponseDto>(eventEntity) : null;
        }

        public async Task<EventResponseDto> CreateEventAsync(EventCreateDto dto)
        {
            // Biznis logika: Proveri duplikat name
            var existingByName = await _eventRepository.GetByNameAsync(dto.Name);
            if (existingByName != null)
            {
                throw new InvalidOperationException("Event with this name already exists");
            }

            // Proveri location postoji
            var location = await _locationRepository.GetByIdAsync(dto.LocationId);
            if (location == null)
            {
                throw new InvalidOperationException("Location not found");
            }

            var eventEntity = _mapper.Map<Event>(dto);
            eventEntity.Location = location;
            eventEntity.CreatedAt = DateTime.UtcNow;
            eventEntity.UpdatedAt = DateTime.UtcNow;

            await _eventRepository.AddAsync(eventEntity);
            await _eventRepository.SaveChangesAsync();

            return _mapper.Map<EventResponseDto>(eventEntity);
        }

        public async Task<EventResponseDto?> UpdateEventAsync(int id, EventUpdateDto dto)
        {
            var existingEvent = await _eventRepository.GetByIdAsync(id);
            if (existingEvent == null)
            {
                return null;
            }

            // Biznis logika: Ako menja? name, proveri duplikat
            if (dto.Name != null && dto.Name != existingEvent.Name)
            {
                var duplicate = await _eventRepository.GetByNameAsync(dto.Name);
                if (duplicate != null)
                {
                    throw new InvalidOperationException("Event with this name already exists");
                }
            }

            // Proveri location ako se menja
            Location? updatedLocation = null;
            if (dto.LocationId.HasValue && dto.LocationId != existingEvent.LocationId)
            {
                updatedLocation = await _locationRepository.GetByIdAsync(dto.LocationId.Value);
                if (updatedLocation == null)
                {
                    throw new InvalidOperationException("Location not found");
                }
            }

            _mapper.Map(dto, existingEvent); // Partial update
            if (updatedLocation != null)
            {
                existingEvent.Location = updatedLocation;
            }
            existingEvent.UpdatedAt = DateTime.UtcNow;

            _eventRepository.Update(existingEvent);
            await _eventRepository.SaveChangesAsync();

            return _mapper.Map<EventResponseDto>(existingEvent);
        }

        public async Task<bool> DeleteEventAsync(int id)
        {
            var eventEntity = await _eventRepository.GetByIdAsync(id);
            if (eventEntity == null)
            {
                return false;
            }

            // Biznis logika: Soft delete
            eventEntity.DeletedAt = DateTime.UtcNow;
            _eventRepository.Update(eventEntity);
            await _eventRepository.SaveChangesAsync();
            return true;
        }
    }
}