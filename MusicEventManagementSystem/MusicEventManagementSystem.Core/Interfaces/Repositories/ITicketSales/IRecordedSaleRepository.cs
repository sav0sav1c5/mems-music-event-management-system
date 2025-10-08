using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales
{
    public interface IRecordedSaleRepository : IRepository<RecordedSale>
    {
        Task<IEnumerable<RecordedSale>> GetSalesByUserAsync(string userId);
        Task<IEnumerable<RecordedSale>> GetSalesByDateRangeAsync(DateTime from, DateTime to, TransactionStatus? statusFilter);
        Task<IEnumerable<RecordedSale>> GetCompletedSalesByDateRangeAsync(DateTime from, DateTime to);
        Task<IEnumerable<RecordedSale>> GetSalesByStatusAsync(TransactionStatus status);
        Task<IEnumerable<RecordedSale>> GetSalesByPaymentMethodAsync(PaymentMethod paymentMethod);
        Task<decimal> GetTotalRevenueAsync();
        Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to);
        Task<int> GetSalesCountByStatusAsync(TransactionStatus status);
    }
}
