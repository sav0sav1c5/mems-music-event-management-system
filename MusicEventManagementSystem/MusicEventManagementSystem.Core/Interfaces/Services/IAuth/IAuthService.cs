using MusicEventManagementSystem.Core.Models.DTOs.Auth;

namespace MusicEventManagementSystem.Core.Interfaces.Services.Auth
{
    public interface IAuthService
    {
        Task<AuthResponseDto> RegisterAsync(RegisterDto registerDto);
        Task<AuthResponseDto> LoginAsync(LoginDto loginDto);
        Task<bool> LogoutAsync();
        Task<UserDto?> GetUserByIdAsync(string userId);
    }
}
