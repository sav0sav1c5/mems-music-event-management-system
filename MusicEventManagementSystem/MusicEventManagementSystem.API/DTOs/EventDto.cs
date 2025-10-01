using MusicEventManagementSystem.API.DTOs.TicketSales;
using MusicEventManagementSystem.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MusicEventManagementSystem.API.DTOs
{
    public class EventResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public DateTime Interval { get; set; }
        public DateTime? EndInterval { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EventStatus Status { get; set; }
        public string CreatedById { get; set; } = string.Empty;
        public int LocationId { get; set; }
        public LocationResponseDto? Location { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public List<TicketTypeResponseDto>? TicketTypes { get; set; }
        public List<PricingRuleResponseDto>? PricingRules { get; set; }
    }

    public class EventCreateDto
    {
        [Required(ErrorMessage = "Name is required")]
        [StringLength(100, ErrorMessage = "Name cannot exceed 100 characters")]
        public string Name { get; set; }

        [Required(ErrorMessage = "Description is required")]
        [StringLength(500, ErrorMessage = "Description cannot exceed 500 characters")]
        public string Description { get; set; }

        [Required(ErrorMessage = "Interval is required")]
        [CustomValidation(typeof(EventCreateDto), nameof(ValidateInterval))]
        public DateTime Interval { get; set; } // Start

        [CustomValidation(typeof(EventCreateDto), nameof(ValidateEndInterval))] // Dodaj ako treba
        public DateTime? EndInterval { get; set; }

        [Required(ErrorMessage = "Status is required")]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EventStatus Status { get; set; }

        [Required(ErrorMessage = "CreatedById is required")]
        public string CreatedById { get; set; } = string.Empty;

        [Required(ErrorMessage = "LocationId is required")]
        [Range(1, int.MaxValue, ErrorMessage = "LocationId must be a positive integer")]
        public int LocationId { get; set; }

        public static ValidationResult ValidateInterval(DateTime interval, ValidationContext context)
        {
            if (interval < DateTime.UtcNow)
            {
                return new ValidationResult("Interval must be in the future");
            }
            return ValidationResult.Success;
        }


        public static ValidationResult ValidateEndInterval(DateTime? endInterval, ValidationContext context)
        {
            var instance = context.ObjectInstance as EventCreateDto;
            if (endInterval.HasValue && endInterval < instance.Interval)
            {
                return new ValidationResult("EndInterval must be after Interval");
            }
            return ValidationResult.Success;
        }
    }

    public class EventUpdateDto
    {
        [StringLength(100)]
        public string? Name { get; set; }

        [StringLength(500)]
        public string? Description { get; set; }

        [CustomValidation(typeof(EventUpdateDto), nameof(ValidateInterval))]
        public DateTime? Interval { get; set; }

        [JsonConverter(typeof(JsonStringEnumConverter))]
        public EventStatus? Status { get; set; }

        [Range(1, int.MaxValue)]
        public int? LocationId { get; set; }

        public static ValidationResult ValidateInterval(DateTime? interval, ValidationContext context)
        {
            if (interval.HasValue && interval < DateTime.UtcNow)
            {
                return new ValidationResult("Interval must be in the future");
            }
            return ValidationResult.Success;
        }
    }
}
