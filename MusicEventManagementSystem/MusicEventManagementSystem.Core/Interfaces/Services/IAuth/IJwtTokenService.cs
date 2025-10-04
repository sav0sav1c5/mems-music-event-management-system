using MusicEventManagementSystem.Core.Models.Entities.Auth;

namespace MusicEventManagementSystem.Core.Interfaces.Services.Auth
{
    public interface IJwtTokenService
    {
        string GenerateToken(ApplicationUser user, IList<string> roles);
    }

}
