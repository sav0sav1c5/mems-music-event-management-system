using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class TicketService : ITicketService
    {
        private readonly ITicketRepository _ticketRepository;
        private readonly IRecordedSaleRepository _recordedSaleRepository;

        public TicketService(ITicketRepository ticketRepository, IRecordedSaleRepository recordedSaleRepository)
        {
            _ticketRepository = ticketRepository;
            _recordedSaleRepository = recordedSaleRepository;
        }

        public async Task<IEnumerable<TicketResponseDto>> GetAllTicketsAsync()
        {
            var tickets = await _ticketRepository.GetAllAsync();
            return tickets.Select(MapToResponseDto);
        }

        public async Task<TicketResponseDto?> GetTicketByIdAsync(int id)
        {
            var ticket = await _ticketRepository.GetByIdAsync(id);

            if (ticket == null)
            {
                return null;
            }

            return MapToResponseDto(ticket);
        }

        public async Task<TicketResponseDto> CreateTicketAsync(TicketCreateDto createTicketDto)
        {
            var ticket = MapToEntity(createTicketDto);

            // Generate unique code if not provided
            if (string.IsNullOrEmpty(ticket.UniqueCode))
            {
                ticket.UniqueCode = await GenerateUniqueCodeAsync();
            }

            // Generate QR code if not provided
            if (string.IsNullOrEmpty(ticket.QrCode))
            {
                ticket.QrCode = GenerateQrCode(ticket.UniqueCode);
            }

            await _ticketRepository.AddAsync(ticket);
            await _ticketRepository.SaveChangesAsync();
            return MapToResponseDto(ticket);
        }

        public async Task<TicketResponseDto?> UpdateTicketAsync(int id, TicketUpdateDto updateTicketDto)
        {
            var existingTicket = await _ticketRepository.GetByIdAsync(id);
            
            if (existingTicket == null)
            {
                return null;
            }

            if (!string.IsNullOrEmpty(updateTicketDto.UniqueCode))
                existingTicket.UniqueCode = updateTicketDto.UniqueCode;

            if (!string.IsNullOrEmpty(updateTicketDto.QrCode))
                existingTicket.QrCode = updateTicketDto.QrCode;

            if (updateTicketDto.IssueDate.HasValue)
                existingTicket.IssueDate = updateTicketDto.IssueDate.Value;

            if (updateTicketDto.FinalPrice.HasValue)
                existingTicket.FinalPrice = updateTicketDto.FinalPrice.Value;

            if (updateTicketDto.Status.HasValue)
                existingTicket.Status = updateTicketDto.Status.Value;

            if (updateTicketDto.RecordedSaleId.HasValue)
                existingTicket.RecordedSaleId = updateTicketDto.RecordedSaleId.Value;

            _ticketRepository.Update(existingTicket);
            await _ticketRepository.SaveChangesAsync();
            return MapToResponseDto(existingTicket);
        }

        public async Task<bool> DeleteTicketAsync(int id)
        {
            var ticket = await _ticketRepository.GetByIdAsync(id);

            if (ticket == null)
            {
                return false;
            }

            _ticketRepository.Delete(ticket);
            await _ticketRepository.SaveChangesAsync();
            return true;
        }

        // Filtered methods
        public async Task<IEnumerable<TicketResponseDto>> GetTicketsByStatusAsync(TicketStatus status)
        {
            var tickets = await _ticketRepository.GetTicketsByStatusAsync(status);
            return tickets.Select(MapToResponseDto);
        }

        public async Task<TicketResponseDto?> GetTicketByUniqueCodeAsync(string uniqueCode)
        {
            var ticket = await _ticketRepository.GetTicketByUniqueCodeAsync(uniqueCode);

            if (ticket == null)
            {
                return null;
            }

            return MapToResponseDto(ticket);
        }

        public async Task<TicketResponseDto?> GetTicketByQrCodeAsync(string qrCode)
        {
            var ticket = await _ticketRepository.GetTicketByQrCodeAsync(qrCode);
            
            if (ticket == null)
            {
                return null;
            }

            return MapToResponseDto(ticket);
        }

        public async Task<int> GetTicketsCountByStatusAsync(TicketStatus status)
        {
            return await _ticketRepository.GetTicketsCountByStatusAsync(status);
        }

        public async Task<decimal> GetTotalRevenueAsync()
        {
            return await _ticketRepository.GetTotalRevenueAsync();
        }

        public async Task<decimal> GetRevenueByDateRangeAsync(DateTime from, DateTime to)
        {
            return await _ticketRepository.GetRevenueByDateRangeAsync(from, to);
        }

        public async Task<decimal> GetRevenueByStatusAsync(TicketStatus status)
        {
            return await _ticketRepository.GetRevenueByStatusAsync(status);
        }

        public async Task<IEnumerable<TicketResponseDto>> GetSoldTicketsAsync()
        {
            var tickets = await _ticketRepository.GetSoldTicketsAsync();
            return tickets.Select(MapToResponseDto);
        }

        public async Task<IEnumerable<TicketResponseDto>> GetTodaysTicketsAsync()
        {
            var tickets = await _ticketRepository.GetTodaysTicketsAsync();
            return tickets.Select(MapToResponseDto);
        }

        // Lifecycle methods
        public async Task<TicketResponseDto?> SellTicketAsync(int ticketId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId);

            if (ticket == null || ticket.Status != TicketStatus.Available)
            {
                return null;
            }

            var recordedSale = new RecordedSale
            {
                TotalAmount = ticket.FinalPrice,
                SaleDate = DateTime.UtcNow,
                TransactionStatus = TransactionStatus.Completed,
                ApplicationUserId = "97e8219b-fb09-453e-b8ba-1b610d1eb255",
                // Need to be done: set the actual user ID from the context
                PaymentMethod = PaymentMethod.CreditCard,
                Tickets = new List<Ticket> { ticket }
            };

            await _recordedSaleRepository.AddAsync(recordedSale);
            await _recordedSaleRepository.SaveChangesAsync();

            ticket.Status = TicketStatus.Sold;
            ticket.RecordedSaleId = recordedSale.RecordedSaleId;

            _ticketRepository.Update(ticket);
            await _ticketRepository.SaveChangesAsync();
            return MapToResponseDto(ticket);
        }

        public async Task<TicketResponseDto?> UseTicketAsync(string uniqueCode)
        {
            var ticket = await _ticketRepository.GetTicketByUniqueCodeAsync(uniqueCode);

            if (ticket == null || ticket.Status != TicketStatus.Sold)
            {
                return null;
            }

            ticket.Status = TicketStatus.Used;

            _ticketRepository.Update(ticket);
            await _ticketRepository.SaveChangesAsync();
            return MapToResponseDto(ticket);
        }

        public async Task<TicketResponseDto?> CancelTicketAsync(int ticketId)
        {
            var ticket = await _ticketRepository.GetByIdAsync(ticketId);

            if (ticket == null)
            {
                return null;
            }

            ticket.Status = TicketStatus.Cancelled;
            _ticketRepository.Update(ticket);
            await _ticketRepository.SaveChangesAsync();

            return MapToResponseDto(ticket);
        }

        // Validation methods
        public async Task<bool> IsUniqueCodeValidAsync(string uniqueCode)
        {
            var ticket = await _ticketRepository.GetTicketByUniqueCodeAsync(uniqueCode);
            return ticket != null && ticket.Status == TicketStatus.Sold;
        }

        public async Task<bool> IsQrCodeValidAsync(string qrCode)
        {
            var ticket = await _ticketRepository.GetTicketByQrCodeAsync(qrCode);
            return ticket != null && ticket.Status == TicketStatus.Sold;
        }

        public async Task<bool> CanTicketBeUsedAsync(string uniqueCode)
        {
            var ticket = await _ticketRepository.GetTicketByUniqueCodeAsync(uniqueCode);
            return ticket != null && ticket.Status == TicketStatus.Sold;
        }

        // Helper methods
        private static TicketResponseDto MapToResponseDto(Ticket ticket)
        {
            return new TicketResponseDto
            {
                TicketId = ticket.TicketId,
                UniqueCode = ticket.UniqueCode,
                QrCode = ticket.QrCode,
                IssueDate = ticket.IssueDate,
                FinalPrice = ticket.FinalPrice,
                Status = ticket.Status,
                TicketTypeId = ticket.TicketTypeId,
                RecordedSaleId = ticket.RecordedSaleId
            };
        }

        private static Ticket MapToEntity(TicketCreateDto dto)
        {
            return new Ticket
            {
                UniqueCode = dto.UniqueCode,
                QrCode = dto.QrCode,
                IssueDate = dto.IssueDate,
                FinalPrice = dto.FinalPrice,
                Status = dto.Status,
                TicketTypeId = dto.TicketTypeId,
                RecordedSaleId = dto.RecordedSaleId
            };
        }

        private async Task<string> GenerateUniqueCodeAsync()
        {
            string uniqueCode;
            bool isCodeUnique;

            do
            {
                uniqueCode = GenerateRandomCode();
                var existing = await _ticketRepository.GetTicketByUniqueCodeAsync(uniqueCode);
                
                isCodeUnique = existing == null;
            } while (!isCodeUnique);
            
            return uniqueCode;
        }

        private static string GenerateRandomCode()
        {
            var random = new Random();
            const string chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
            const int length = 10;

            return new string(Enumerable.Repeat(chars, length).Select(s => s[random.Next(s.Length)]).ToArray());
        }

        private static string GenerateQrCode(string uniqueCode)
        {
            // Method for generating QR code from unique code
            // Until implemented, return a base64 representation of the unique code
            byte[] encodedBytes = System.Text.Encoding.UTF8.GetBytes(uniqueCode);
            return Convert.ToBase64String(encodedBytes);
        }
    }
}
