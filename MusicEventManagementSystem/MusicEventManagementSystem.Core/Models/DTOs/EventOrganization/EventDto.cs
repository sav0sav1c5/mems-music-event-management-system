using MusicEventManagementSystem.Core.Enums.EventOrganization;
using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.Core.Models.DTOs.EventOrganization
{
    public class EventResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime StartDate { get; set; }
        public DateTime EndDate { get; set; }
        public EventStatus Status { get; set; }
        public Guid CreatedById { get; set; }
        public int LocationId { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public List<int>? VenueIds { get; set; }
        public List<int>? TicketTypeIds { get; set; }
        public List<int>? PricingRuleIds { get; set; }
    }

    public class EventCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; }

        [Required]
        [StringLength(500)]
        public string Description { get; set; }

        [Required]
        public DateTime StartDate { get; set; }

        [Required]
        public DateTime EndDate { get; set; }

        [Required]
        public EventStatus Status { get; set; }

        [Required]
        public Guid CreatedById { get; set; }

        [Required]
        public int LocationId { get; set; }
    }

    public class EventUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }
        public EventStatus? Status { get; set; }
        public int? LocationId { get; set; }
    }
}
