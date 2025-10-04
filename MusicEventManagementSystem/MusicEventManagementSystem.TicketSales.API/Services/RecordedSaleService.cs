using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class RecordedSaleService : IRecordedSaleService
    {
        private readonly IRecordedSaleRepository _recordedSaleRepository;

        public RecordedSaleService(IRecordedSaleRepository recordedSaleRepository)
        {
            _recordedSaleRepository = recordedSaleRepository;
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetAllRecordedSalesAsync()
        {
            var recordedSales = await _recordedSaleRepository.GetAllAsync();
            return recordedSales.Select(MapToResponseDto);
        }

        public async Task<RecordedSaleResponseDto?> GetRecordedSaleByIdAsync(int id)
        {
            var recordedSale = await _recordedSaleRepository.GetByIdAsync(id);
            
            if (recordedSale == null)
            {
                return null;
            }

            return MapToResponseDto(recordedSale);
        }

        public async Task<RecordedSaleResponseDto> CreateRecordedSaleAsync(RecordedSaleCreateDto createRecordedSaleDto)
        {
            var recordedSale = MapToEntity(createRecordedSaleDto);

            recordedSale.SaleDate = DateTime.UtcNow;

            await _recordedSaleRepository.AddAsync(recordedSale);
            await _recordedSaleRepository.SaveChangesAsync();
            return MapToResponseDto(recordedSale);
        }

        public async Task<RecordedSaleResponseDto?> UpdateRecordedSaleAsync(int id, RecordedSaleUpdateDto updateRecordedSaleDto)
        {
            var existingRecordedSale = await _recordedSaleRepository.GetByIdAsync(id);

            if (existingRecordedSale == null)
            {
                return null;
            }

            if (updateRecordedSaleDto.TotalAmount.HasValue)
                existingRecordedSale.TotalAmount = updateRecordedSaleDto.TotalAmount.Value;

            if (updateRecordedSaleDto.PaymentMethod.HasValue)
                existingRecordedSale.PaymentMethod = updateRecordedSaleDto.PaymentMethod.Value;

            if (updateRecordedSaleDto.SaleDate.HasValue)
                existingRecordedSale.SaleDate = updateRecordedSaleDto.SaleDate.Value;

            if (updateRecordedSaleDto.TransactionStatus.HasValue)
                existingRecordedSale.TransactionStatus = updateRecordedSaleDto.TransactionStatus.Value;

            _recordedSaleRepository.Update(existingRecordedSale);
            await _recordedSaleRepository.SaveChangesAsync();
            return MapToResponseDto(existingRecordedSale);
        }

        public async Task<bool> DeleteRecordedSaleAsync(int id)
        {
            var recordedSale = await _recordedSaleRepository.GetByIdAsync(id);
            
            if (recordedSale == null)
            {
                return false;
            }

            _recordedSaleRepository.Delete(recordedSale);
            await _recordedSaleRepository.SaveChangesAsync();
            return true;
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByUserAsync(string userId)
        {
            var sales = await _recordedSaleRepository.GetSalesByUserAsync(userId);
            return sales.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByDateRangeAsync(DateTime fromDate, DateTime toDate)
        {
            var sales = await _recordedSaleRepository.GetSalesByDateRangeAsync(fromDate, toDate);
            return sales.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByStatusAsync(TransactionStatus status)
        {
            var sales = await _recordedSaleRepository.GetSalesByStatusAsync(status);
            return sales.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByPaymentMethodAsync(PaymentMethod paymentMethod)
        {
            var sales = await _recordedSaleRepository.GetSalesByPaymentMethodAsync(paymentMethod);
            return sales.Select(MapToResponseDto);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _recordedSaleRepository.GetTotalRevenueAsync();
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _recordedSaleRepository.GetRevenueByDateRangeAsync(from, to);
        }

        public async Task<int> GetSalesCountByStatusAsync(TransactionStatus status)
        {
            return await _recordedSaleRepository.GetSalesCountByStatusAsync(status);
        }

        // Helper methods for mapping
        
        private static RecordedSaleResponseDto MapToResponseDto(RecordedSale recordedSale)
        {
            return new RecordedSaleResponseDto
            {
                RecordedSaleId = recordedSale.RecordedSaleId,
                TotalAmount = recordedSale.TotalAmount,
                PaymentMethod = recordedSale.PaymentMethod,
                SaleDate = recordedSale.SaleDate,
                TransactionStatus = recordedSale.TransactionStatus,
                ApplicationUserId = recordedSale.ApplicationUserId,
                TicketIds = recordedSale.Tickets?.Select(t => t.TicketId).ToList(),
                SpecialOfferIds = recordedSale.SpecialOffers?.Select(so => so.SpecialOfferId).ToList()
            };
        }

        private static RecordedSale MapToEntity(RecordedSaleCreateDto dto)
        {
            return new RecordedSale
            {
                TotalAmount = dto.TotalAmount,
                PaymentMethod = dto.PaymentMethod,
                SaleDate = dto.SaleDate,
                TransactionStatus = dto.TransactionStatus,
                ApplicationUserId = dto.ApplicationUserId
            };
        }
    }
}
