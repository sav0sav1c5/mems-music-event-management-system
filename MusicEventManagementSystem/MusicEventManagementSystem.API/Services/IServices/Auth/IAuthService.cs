using MusicEventManagementSystem.Core.Models.DTOs.Auth;

namespace MusicEventManagementSystem.API.Services.IServices.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<UserDto?> GetUserByIdAsync(string userId);
    }
}
