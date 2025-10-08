using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.DTOs.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales
{
    public interface IRecordedSaleService
    {
        Task<IEnumerable<RecordedSaleResponseDto>> GetAllRecordedSalesAsync();
        Task<RecordedSaleResponseDto?> GetRecordedSaleByIdAsync(int id);
        Task<RecordedSaleResponseDto> CreateRecordedSaleAsync(RecordedSaleCreateDto createRecordedSaleDto);
        Task<RecordedSaleResponseDto?> UpdateRecordedSaleAsync(int id, RecordedSaleUpdateDto updateRecordedSaleDto);
        Task<bool> DeleteRecordedSaleAsync(int id);

        Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByUserAsync(string userId);
        Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByDateRangeAsync(DateTime from, DateTime to);
        Task<IEnumerable<RecordedSaleResponseDto>> GetCompletedSalesByDateRangeAsync(DateTime from, DateTime to);
        Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByStatusAsync(TransactionStatus status);
        Task<IEnumerable<RecordedSaleResponseDto>> GetSalesByPaymentMethodAsync(PaymentMethod paymentMethod);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to);
        Task<int> GetSalesCountByStatusAsync(TransactionStatus status);

        Task<RevenueAnalysisDto> GetRevenueAnalysisAsync(DateTime startDate, DateTime endDate);

        // Comprehensive analysis (uses new analysis function with cursors)
        Task<AnalysisReport> GenerateComprehensiveAnalysisAsync(int? eventId = null, DateTime? startDate = null, DateTime? endDate = null);

        // Export operations
        Task<byte[]> ExportAnalysisToPdfAsync(int? eventId = null, DateTime? startDate = null, DateTime? endDate = null);
        Task<byte[]> ExportAnalysisToExcelAsync(int? eventId = null, DateTime? startDate = null, DateTime? endDate = null);

        // Audit log operations (from database trigger)
        Task<List<SalesAuditLogDto>> GetSalesAuditLogAsync(int limit = 50);

        // Performance monitoring (from index performance tests)
        Task<List<IndexPerformanceDto>> GetIndexPerformanceAsync();
    }
}
