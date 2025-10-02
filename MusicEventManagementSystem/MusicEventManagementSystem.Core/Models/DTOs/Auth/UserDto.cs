using MusicEventManagementSystem.Core.Enums.Auth;

namespace MusicEventManagementSystem.Core.Models.DTOs.Auth
{
    public class UserDto
    {
        public string Id { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string FirstName { get; set; } = string.Empty;
        public string LastName { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public Department Department { get; set; }
    }
}
