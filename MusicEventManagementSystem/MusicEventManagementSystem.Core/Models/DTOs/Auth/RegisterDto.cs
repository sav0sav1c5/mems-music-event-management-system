using System.ComponentModel.DataAnnotations;
using MusicEventManagementSystem.Core.Enums.Auth;

namespace MusicEventManagementSystem.Core.Models.DTOs.Auth
{
    public class RegisterDto
    {
        [Required]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;

        [Required]
        [MinLength(6)]
        public string Password { get; set; } = string.Empty;

        [Required]
        public string FirstName { get; set; } = string.Empty;

        [Required]
        public string LastName { get; set; } = string.Empty;

        public Department Department { get; set; }
    }
}
