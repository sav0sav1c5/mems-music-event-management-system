using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class TicketTypeService : ITicketTypeService
    {
        private readonly ITicketTypeRepository _ticketTypeRepository;

        public TicketTypeService(ITicketTypeRepository ticketTypeRepository)
        {
            _ticketTypeRepository = ticketTypeRepository;
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetAllTicketTypesAsync()
        {
            var types = await _ticketTypeRepository.GetAllAsync();
            return types.Select(MapToResponseDto);
        }


        public async Task<TicketTypeResponseDto?> GetTicketTypeByIdAsync(int id)
        {
            var type = await _ticketTypeRepository.GetByIdAsync(id);
            
            if (type == null)
            {
                return null;
            }

            return MapToResponseDto(type);
        }

        public async Task<TicketTypeResponseDto> CreateTicketTypeAsync(TicketTypeCreateDto createDto)
        {
            var ticketType = MapToEntity(createDto);

            await _ticketTypeRepository.AddAsync(ticketType);
            await _ticketTypeRepository.SaveChangesAsync();
            return MapToResponseDto(ticketType);
        }

        public async Task<TicketTypeResponseDto?> UpdateTicketTypeAsync(int id, TicketTypeUpdateDto updateDto)
        {
            var existing = await _ticketTypeRepository.GetByIdAsync(id);
            if (existing == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(updateDto.Name))
                existing.Name = updateDto.Name;
            if (updateDto.Description != null)
                existing.Description = updateDto.Description;
            if (updateDto.Status.HasValue)
                existing.Status = updateDto.Status.Value;
            if (updateDto.AvailableQuantity.HasValue)
                existing.AvailableQuantity = updateDto.AvailableQuantity.Value;
            if (updateDto.ZoneId.HasValue)
                existing.ZoneId = updateDto.ZoneId.Value;
            if (updateDto.EventId.HasValue)
                existing.EventId = updateDto.EventId.Value;

            _ticketTypeRepository.Update(existing);
            await _ticketTypeRepository.SaveChangesAsync();
            return MapToResponseDto(existing);
        }

        public async Task<bool> DeleteTicketTypeAsync(int id)
        {
            var ticketType = await _ticketTypeRepository.GetByIdAsync(id);
            
            if (ticketType == null)
            {
                return false;
            }

            _ticketTypeRepository.Delete(ticketType);
            await _ticketTypeRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByZoneIdAsync(int zoneId)
        {
            var list = await _ticketTypeRepository.GetByZoneIdAsync(zoneId);
            return list.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByEventIdAsync(int eventId)
        {
            var list = await _ticketTypeRepository.GetByEventIdAsync(eventId);
            return list.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByStatusAsync(TicketTypeStatus status)
        {
            var list = await _ticketTypeRepository.GetByStatusAsync(status);
            return list.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetAvailableTicketTypesAsync()
        {
            var list = await _ticketTypeRepository.GetAvailableTicketTypesAsync();
            return list.Select(MapToResponseDto);
        }

        public async Task<bool> UpdateAvailableQuantityAsync(int id, int quantity)
        {
            if (quantity < 0)
            {
                return false;
            }

            return await _ticketTypeRepository.UpdateAvailableQuantityAsync(id, quantity);
        }

        public async Task<IEnumerable<TicketTypeResponseDto>> GetByZoneAndEventAsync(int zoneId, int eventId)
        {
            var list = await _ticketTypeRepository.GetByZoneAndEventAsync(zoneId, eventId);
            return list.Select(MapToResponseDto);
        }

        public async Task<int> GetTotalAvailableQuantityByEventAsync(int eventId)
        {
            return await _ticketTypeRepository.GetTotalAvailableQuantityByEventAsync(eventId);
        }

        public async Task<bool> ReserveTicketsAsync(int ticketTypeId, int quantity)
        {
            if (quantity <= 0)
            {
                return false;
            }

            var existingTicketType = await _ticketTypeRepository.GetByIdAsync(ticketTypeId);

            if (existingTicketType == null || existingTicketType.AvailableQuantity < quantity)
            {
                return false;
            }

            var newQuantity = existingTicketType.AvailableQuantity - quantity;
            return await _ticketTypeRepository.UpdateAvailableQuantityAsync(ticketTypeId, newQuantity);
        }

        public async Task<bool> ReleaseTicketsAsync(int ticketTypeId, int quantity)
        {
            if (quantity <= 0)
            {
                return false;
            }

            var existingTicketType = await _ticketTypeRepository.GetByIdAsync(ticketTypeId);

            if (existingTicketType == null)
            {
                return false;
            }

            var newQuantity = existingTicketType.AvailableQuantity + quantity;
            return await _ticketTypeRepository.UpdateAvailableQuantityAsync(ticketTypeId, newQuantity);
        }

        // Helper methods for mapping
        private static TicketTypeResponseDto MapToResponseDto(TicketType entity)
        {
            return new TicketTypeResponseDto
            {
                TicketTypeId = entity.TicketTypeId,
                Name = entity.Name,
                Description = entity.Description,
                Status = entity.Status,
                AvailableQuantity = entity.AvailableQuantity,
                ZoneId = entity.ZoneId,
                EventId = entity.EventId,
                TicketIds = entity.Tickets?.Select(t => t.TicketId).ToList(),
                SpecialOfferIds = entity.SpecialOffers?.Select(so => so.SpecialOfferId).ToList(),
                PricingRuleIds = entity.PricingRules?.Select(pr => pr.PricingRuleId).ToList()
            };
        }

        private static TicketType MapToEntity(TicketTypeCreateDto dto)
        {
            return new TicketType
            {
                Name = dto.Name,
                Description = dto.Description,
                Status = dto.Status,
                AvailableQuantity = dto.AvailableQuantity,
                ZoneId = dto.ZoneId,
                EventId = dto.EventId
            };
        }
    }
}
