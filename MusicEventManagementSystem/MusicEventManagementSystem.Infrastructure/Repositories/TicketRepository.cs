using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class TicketRepository : Repository<Ticket>, ITicketRepository
    {
        public TicketRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<Ticket>> GetAllAsync()
        {
            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).ToListAsync();
        }

        public override async Task<Ticket?> GetByIdAsync(int id)
        {
            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).FirstOrDefaultAsync(t => t.TicketId == id);
        }

        public async Task<IEnumerable<Ticket>> GetTicketsByStatusAsync(TicketStatus status)
        {
            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).Where(t => t.Status == status).ToListAsync();
        }

        public async Task<Ticket?> GetTicketByUniqueCodeAsync(string uniqueCode)
        {
            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).FirstOrDefaultAsync(t => t.UniqueCode == uniqueCode);
        }

        public async Task<Ticket?> GetTicketByQrCodeAsync(string qrCode)
        {
            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).FirstOrDefaultAsync(t => t.QrCode == qrCode);
        }

        public async Task<IEnumerable<Ticket>> GetSoldTicketsAsync()
        {
            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).Where(t => t.Status == TicketStatus.Sold || t.Status! == TicketStatus.Used).OrderByDescending(t => t.IssueDate).ToListAsync();
        }

        public async Task<IEnumerable<Ticket>> GetTodaysTicketsAsync()
        {
            var today = DateTime.SpecifyKind(DateTime.UtcNow.Date, DateTimeKind.Utc);
            var tomorrow = DateTime.SpecifyKind(today.AddDays(1), DateTimeKind.Utc);

            return await _context.Tickets.Include(t => t.TicketType).Include(t => t.RecordedSale).Where(t => t.RecordedSale != null && t.RecordedSale.SaleDate >= today && t.RecordedSale.SaleDate < tomorrow).OrderByDescending(t => t.RecordedSale.SaleDate).ToListAsync();
        }

        public async Task<int> GetTicketsCountByStatusAsync(TicketStatus status)
        {
            return await _context.Tickets.CountAsync(t => t.Status! == status);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            var tickets = await _context.Tickets.Where(t => t.Status == TicketStatus.Sold || t.Status! == TicketStatus.Used).ToListAsync();
            return tickets.Sum(t => t.FinalPrice);
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to)
        {
            var tickets = await _context.Tickets.Where(t => t.IssueDate.Date >= from.Date && t.IssueDate.Date <= to.Date && (t.Status == TicketStatus.Sold || t.Status! == TicketStatus.Used)).ToListAsync();
            return tickets.Sum(t => t.FinalPrice);
        }

        public async Task<decimal> GetRevenueByStatusAsync(TicketStatus status)
        {
            var tickets = await _context.Tickets.Where(t => t.Status == status).ToListAsync();
            return tickets.Sum(t => t.FinalPrice);
        }
    }
}
