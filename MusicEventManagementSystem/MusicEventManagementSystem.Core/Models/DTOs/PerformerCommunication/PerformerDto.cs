using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class PerformerDto
    {
        public int PerformerId { get; set; }
        public string Name { get; set; } = string.Empty;
        public string Email { get; set; } = string.Empty;
        public string Contact { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int Popularity { get; set; }
        public string TechnicalRequirements { get; set; } = string.Empty;
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public TimeSpan AverageResponseTime { get; set; }
        public string Status { get; set; } = string.Empty;
        
        // Related collections
        public List<ContractDto>? Contracts { get; set; }
    }

    public class CreatePerformerDto
    {
        [Required(ErrorMessage = "Name is required")]
        public string Name { get; set; } = string.Empty;
        [Required(ErrorMessage = "Email is required")]
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Contact is required")]
        public string Contact { get; set; } = string.Empty;
        
        [Required(ErrorMessage = "Genre is required")]
        public string Genre { get; set; } = string.Empty;
        
        [Range(0, 100, ErrorMessage = "Popularity must be between 0 and 100")]
        public int Popularity { get; set; }
        
        public string TechnicalRequirements { get; set; } = string.Empty;
        
        [Range(0, double.MaxValue, ErrorMessage = "MinPrice must be a positive number")]
        public decimal MinPrice { get; set; }
        
        [Range(0, double.MaxValue, ErrorMessage = "MaxPrice must be a positive number")]
        public decimal MaxPrice { get; set; }
        
        [Required(ErrorMessage = "AverageResponseTime is required")]
        [RegularExpression(@"^([0-9]{2}:[0-9]{2}:[0-9]{2})$", ErrorMessage = "AverageResponseTime must be in format HH:mm:ss")]
        public TimeSpan AverageResponseTime { get; set; }
        
        [Required(ErrorMessage = "Status is required")]
        public string Status { get; set; } = string.Empty;
    }

    public class UpdatePerformerDto
    {
        public string Name { get; set; } = string.Empty;
        [EmailAddress]
        public string Email { get; set; } = string.Empty;
        public string Contact { get; set; } = string.Empty;
        public string Genre { get; set; } = string.Empty;
        public int Popularity { get; set; }
        public string TechnicalRequirements { get; set; } = string.Empty;
        public decimal MinPrice { get; set; }
        public decimal MaxPrice { get; set; }
        public TimeSpan AverageResponseTime { get; set; }
        public string Status { get; set; } = string.Empty;
    }

    public class PerformerWithDetailsDto : PerformerDto
    {
        // Extended version with full related entity details
        public NegotiationDto? Negotiation { get; set; } // One-to-One relationship
    }
}
