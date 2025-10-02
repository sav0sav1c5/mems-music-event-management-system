using Microsoft.AspNetCore.Identity;
using MusicEventManagementSystem.Core.Enums.Auth;

namespace MusicEventManagementSystem.Core.Models.Entities.Auth
{
    public class ApplicationUser : IdentityUser
    {
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
        public bool IsActive { get; set; } = true;
        public Department Department { get; set; }
    }
}
