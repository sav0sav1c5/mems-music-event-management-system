using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services.IServices
{
    public interface ICartService
    {
        Task<CartDto> GetCartAsync(string userId);
        Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto);
        Task<CartDto> UpdateCartItemAsync(string userId, UpdateCartItemDto updateDto);
        Task<CartDto> RemoveFromCartAsync(string userId, int ticketTypeId);
        Task<bool> ClearCartAsync(string userId);
        Task<bool> ValidateCartAsync(string userId);
        Task<decimal> CalculateCartTotalAsync(string userId);
    }
}
