using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class SpecialOfferService : ISpecialOfferService
    {
        private readonly ISpecialOfferRepository _specialOfferRepository;
        private readonly ITicketTypeRepository _ticketTypeRepository;
        public SpecialOfferService(ISpecialOfferRepository specialOfferRepository, ITicketTypeRepository ticketTypeRepository)
        {
            _specialOfferRepository = specialOfferRepository;
            _ticketTypeRepository = ticketTypeRepository;
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetAllSpecialOffersAsync()
        {
            var specialOffers = await _specialOfferRepository.GetAllAsync();
            return specialOffers.Select(MapToResponseDto);
        }

        public async Task<SpecialOfferResponseDto?> GetSpecialOfferByIdAsync(int id)
        {
            var existingSpecialOffer = await _specialOfferRepository.GetByIdAsync(id);

            if (existingSpecialOffer == null)
            {
                return null;
            }

            return MapToResponseDto(existingSpecialOffer);
        }

        public async Task<SpecialOfferResponseDto> CreateSpecialOfferAsync(SpecialOfferCreateDto createSpecialOfferDto)
        {
            var specialOffer = MapToEntity(createSpecialOfferDto);

            // Associate TicketTypes
            if (createSpecialOfferDto.TicketTypeIds?.Any() == true)
            {
                var ticketTypes = await _ticketTypeRepository.GetByIdsAsync(createSpecialOfferDto.TicketTypeIds);
                specialOffer.TicketTypes = ticketTypes.ToList();
            }

            await _specialOfferRepository.AddAsync(specialOffer);
            await _specialOfferRepository.SaveChangesAsync();
            return MapToResponseDto(specialOffer);
        }

        public async Task<SpecialOfferResponseDto?> UpdateSpecialOfferAsync(int id, SpecialOfferUpdateDto updateSpecialOfferDto)
        {
            var existingSpecialOffer = await _specialOfferRepository.GetByIdAsync(id);
            if (existingSpecialOffer == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(updateSpecialOfferDto.Name))
                existingSpecialOffer.Name = updateSpecialOfferDto.Name;

            if (updateSpecialOfferDto.Description != null)
                existingSpecialOffer.Description = updateSpecialOfferDto.Description;

            if (updateSpecialOfferDto.OfferType.HasValue)
                existingSpecialOffer.OfferType = updateSpecialOfferDto.OfferType.Value;

            if (updateSpecialOfferDto.StartDate.HasValue)
                existingSpecialOffer.StartDate = updateSpecialOfferDto.StartDate.Value;

            if (updateSpecialOfferDto.EndDate.HasValue)
                existingSpecialOffer.EndDate = updateSpecialOfferDto.EndDate.Value;

            if (updateSpecialOfferDto.ApplicationCondition != null)
                existingSpecialOffer.ApplicationCondition = updateSpecialOfferDto.ApplicationCondition;

            if (updateSpecialOfferDto.DiscountValue.HasValue)
                existingSpecialOffer.DiscountValue = updateSpecialOfferDto.DiscountValue.Value;

            if (updateSpecialOfferDto.TicketLimit.HasValue)
                existingSpecialOffer.TicketLimit = updateSpecialOfferDto.TicketLimit.Value;

            // Update associated TicketTypes
            if (updateSpecialOfferDto.TicketTypeIds != null)
            {
                existingSpecialOffer.TicketTypes.Clear();

                if (updateSpecialOfferDto.TicketTypeIds.Any())
                {
                    var ticketTypes = await _ticketTypeRepository.GetByIdsAsync(updateSpecialOfferDto.TicketTypeIds);
                    existingSpecialOffer.TicketTypes = ticketTypes.ToList();
                }
            }

            _specialOfferRepository.Update(existingSpecialOffer);
            await _specialOfferRepository.SaveChangesAsync();
            return MapToResponseDto(existingSpecialOffer);
        }


        public async Task<bool> DeleteSpecialOfferAsync(int id)
        {
            var specialOffer = await _specialOfferRepository.GetByIdAsync(id);
            
            if (specialOffer == null)
            {
                return false;
            }

            _specialOfferRepository.Delete(specialOffer);
            await _specialOfferRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetActiveOffersAsync(DateTime currentDate)
        {
            var offers = await _specialOfferRepository.GetActiveOffersAsync(currentDate);
            return offers.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetByOfferTypeAsync(OfferType offerType)
        {
            var offers = await _specialOfferRepository.GetByOfferTypeAsync(offerType);
            return offers.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetByDateRangeAsync(DateTime start, DateTime end)
        {
            if (start > end)
            {
                throw new ArgumentException("Start date cannot be greater than end date.");
            }

            var offers = await _specialOfferRepository.GetByDateRangeAsync(start, end);
            return offers.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<SpecialOfferResponseDto>> GetByTicketTypeAsync(int ticketTypeId)
        {
            if (ticketTypeId <= 0)
            {
                throw new ArgumentException("Ticket type ID must be greater than 0.", nameof(ticketTypeId));
            }

            var offers = await _specialOfferRepository.GetByTicketTypeAsync(ticketTypeId);
            return offers.Select(MapToResponseDto);
        }

        public async Task<bool> IsOfferValidAsync(int specialOfferId, DateTime checkDate)
        {
            if (specialOfferId <= 0)
            {
                return false;
            }

            return await _specialOfferRepository.IsOfferValidAsync(specialOfferId, checkDate);
        }

        public async Task<bool> HasActiveOfferForTicketTypeAsync(int ticketTypeId, DateTime currentDate)
        {
            if (ticketTypeId <= 0)
            {
                return false;
            }

            return await _specialOfferRepository.HasActiveOfferForTicketTypeAsync(ticketTypeId, currentDate);
        }

        // Helper methods for mapping

        private static SpecialOfferResponseDto MapToResponseDto(SpecialOffer specialOffer)
        {
            return new SpecialOfferResponseDto
            {
                SpecialOfferId = specialOffer.SpecialOfferId,
                Name = specialOffer.Name,
                Description = specialOffer.Description,
                OfferType = specialOffer.OfferType,
                StartDate = specialOffer.StartDate,
                EndDate = specialOffer.EndDate,
                ApplicationCondition = specialOffer.ApplicationCondition,
                DiscountValue = specialOffer.DiscountValue,
                TicketLimit = specialOffer.TicketLimit,
                TicketTypeIds = specialOffer.TicketTypes?.Select(tt => tt.TicketTypeId).ToList(),
                RecordedSaleIds = specialOffer.RecordedSales?.Select(rs => rs.RecordedSaleId).ToList()
            };
        }

        private static SpecialOffer MapToEntity(SpecialOfferCreateDto dto)
        {
            return new SpecialOffer
            {
                Name = dto.Name,
                Description = dto.Description,
                OfferType = dto.OfferType,
                StartDate = dto.StartDate,
                EndDate = dto.EndDate,
                ApplicationCondition = dto.ApplicationCondition,
                DiscountValue = dto.DiscountValue,
                TicketLimit = dto.TicketLimit
            };
        }
    }
}
