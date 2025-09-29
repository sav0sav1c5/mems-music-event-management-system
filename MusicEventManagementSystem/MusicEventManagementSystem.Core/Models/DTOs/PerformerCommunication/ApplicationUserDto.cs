using MusicEventManagementSystem.Core.Enums.Auth;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class ApplicationUserResponseDto
    {
        public string Id { get; set; }
        public string UserName { get; set; }
        public string Email { get; set; }
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public DateTime CreatedAt { get; set; }
        public bool IsActive { get; set; }
        public Department Department { get; set; }
        public string PhoneNumber { get; set; }
    }

    public class ApplicationUserCreateDto
    {
        [Required]
        [StringLength(50)]
        public string UserName { get; set; }

        [Required]
        [EmailAddress]
        public string Email { get; set; }

        [Required]
        [StringLength(50)]
        public string FirstName { get; set; }

        [Required]
        [StringLength(50)]
        public string LastName { get; set; }

        [Required]
        public Department Department { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        [Required]
        [MinLength(6)]
        public string Password { get; set; }
    }

    public class ApplicationUserUpdateDto
    {
        [StringLength(50)]
        public string? FirstName { get; set; }

        [StringLength(50)]
        public string? LastName { get; set; }

        [EmailAddress]
        public string? Email { get; set; }

        public Department? Department { get; set; }

        [Phone]
        public string? PhoneNumber { get; set; }

        public bool? IsActive { get; set; }
    }
}
