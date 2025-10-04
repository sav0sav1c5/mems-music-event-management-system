using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services.IServices
{
    public interface IOrderService
    {
        Task<CheckoutResponseDto> CheckoutAsync(string userId, CheckoutRequestDto checkoutRequest);
        Task<IEnumerable<OrderDto>> GetUserOrdersAsync(string userId);
        Task<OrderDetailsDto?> GetOrderDetailsAsync(int orderId, string userId);
        Task<bool> CancelOrderAsync(int orderId, string userId);
        Task<OrderTicketDto?> GetTicketDetailsAsync(int ticketId, string userId);
        Task<byte[]> GenerateTicketPdfAsync(int ticketId, string userId);
    }
}
