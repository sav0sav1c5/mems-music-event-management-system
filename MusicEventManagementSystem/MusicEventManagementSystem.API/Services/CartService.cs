using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.Core.Models.DTOs.Client;

namespace MusicEventManagementSystem.API.Services
{
    public class CartService : ICartService
    {
        public Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            throw new NotImplementedException();
        }

        public Task<decimal> CalculateCartTotalAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ClearCartAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<CartDto> GetCartAsync(string userId)
        {
            throw new NotImplementedException();
        }

        public Task<CartDto> RemoveFromCartAsync(string userId, int ticketTypeId)
        {
            throw new NotImplementedException();
        }

        public Task<CartDto> UpdateCartItemAsync(string userId, UpdateCartItemDto updateDto)
        {
            throw new NotImplementedException();
        }

        public Task<bool> ValidateCartAsync(string userId)
        {
            throw new NotImplementedException();
        }
    }
}
