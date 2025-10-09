using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories.ITicketSales;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;
using static Microsoft.EntityFrameworkCore.DbLoggerCategory;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class RecordedSaleRepository : Repository<RecordedSale>, IRecordedSaleRepository
    {
        public RecordedSaleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<RecordedSale>> GetAllAsync()
        {
            return await _context.RecordedSales.Include(rs => rs.ApplicationUser).Include(rs => rs.Tickets).Include(rs => rs.SpecialOffers).OrderByDescending(rs => rs.SaleDate).ToListAsync();
        }

        public override async Task<RecordedSale?> GetByIdAsync(int id)
        {
            return await _context.RecordedSales.Include(rs => rs.ApplicationUser).Include(rs => rs.Tickets).Include(rs => rs.SpecialOffers).FirstOrDefaultAsync(rs => rs.RecordedSaleId == id);
        }

        public async Task<IEnumerable<RecordedSale>> GetSalesByUserAsync(string userId)
        {
            return await _context.RecordedSales.Include(rs => rs.ApplicationUser).Include(rs => rs.Tickets).Include(rs => rs.SpecialOffers).Where(rs => rs.ApplicationUserId == userId).OrderByDescending(rs => rs.SaleDate).ToListAsync();
        }

        public async Task<IEnumerable<RecordedSale>> GetSalesByDateRangeAsync(DateTime from, DateTime to, TransactionStatus? statusFilter = TransactionStatus.Completed)
        {
            var fromUtc = DateTime.SpecifyKind(from.Date, DateTimeKind.Utc);
            var toUtc = DateTime.SpecifyKind(to.Date, DateTimeKind.Utc);

            var query = _context.RecordedSales.Include(rs => rs.ApplicationUser).Include(rs => rs.Tickets).Include(rs => rs.SpecialOffers).Where(rs => rs.SaleDate.Date >= fromUtc && rs.SaleDate.Date < toUtc);
            
            if (statusFilter.HasValue)
            {
                query = query.Where(rs => rs.TransactionStatus == statusFilter.Value);
            }

            return await query.OrderByDescending(rs => rs.SaleDate).ToListAsync();
        }

        public async Task<IEnumerable<RecordedSale>> GetCompletedSalesByDateRangeAsync(DateTime from, DateTime to)
        {
            return await GetSalesByDateRangeAsync(from, to, TransactionStatus.Completed);
        }

        public async Task<IEnumerable<RecordedSale>> GetSalesByStatusAsync(TransactionStatus status)
        {
            return await _context.RecordedSales.Include(rs => rs.ApplicationUser).Include(rs => rs.Tickets).Include(rs => rs.SpecialOffers).Where(rs => rs.TransactionStatus == status).OrderByDescending(rs => rs.SaleDate).ToListAsync();
        }

        public async Task<IEnumerable<RecordedSale>> GetSalesByPaymentMethodAsync(PaymentMethod paymentMethod)
        {
            return await _context.RecordedSales.Include(rs => rs.ApplicationUser).Include(rs => rs.Tickets).Include(rs => rs.SpecialOffers).Where(rs => rs.PaymentMethod == paymentMethod).OrderByDescending(rs => rs.SaleDate).ToListAsync();
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            var completedSales = await _context.RecordedSales.Where(rs => rs.TransactionStatus == TransactionStatus.Completed).ToListAsync();
            return completedSales.Sum(rs => rs.TotalAmount);
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to)
        {
            var completedSales = await _context.RecordedSales.Where(rs => rs.SaleDate.Date >= from.Date && rs.SaleDate.Date <= to.Date && rs.TransactionStatus == TransactionStatus.Completed).ToListAsync();
            return completedSales.Sum(rs => rs.TotalAmount);
        }

        public async Task<int> GetSalesCountByStatusAsync(TransactionStatus status)
        {
            return await _context.RecordedSales.CountAsync(rs => rs.TransactionStatus == status);
        }
    }
}
