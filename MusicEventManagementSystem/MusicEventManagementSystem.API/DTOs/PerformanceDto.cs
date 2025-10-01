using System;
using MusicEventManagementSystem.Enums;
using MusicEventManagementSystem.API.DTOs.TicketSales;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MusicEventManagementSystem.API.DTOs
{
    public class PerformanceResponseDto
    {
        public int Id { get; set; }
        public int EventId { get; set; }
        public int PerformerId { get; set; }
        public int VenueId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SetupTime { get; set; }
        public int SoundcheckTime { get; set; }
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PerformanceStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
        public EventResponseDto? Event { get; set; }
        public PerformerDto? Performer { get; set; }
        public VenueResponseDto? Venue { get; set; }
    }

    public class PerformanceCreateDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        public int PerformerId { get; set; }

        [Required]
        public int VenueId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Range(0, int.MaxValue)]
        public int SetupTime { get; set; }

        [Range(0, int.MaxValue)]
        public int SoundcheckTime { get; set; }

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PerformanceStatus Status { get; set; }
    }

    public class PerformanceUpdateDto
    {
        [Required]
        public int EventId { get; set; }

        [Required]
        public int PerformerId { get; set; }

        [Required]
        public int VenueId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Range(0, int.MaxValue)]
        public int SetupTime { get; set; }

        [Range(0, int.MaxValue)]
        public int SoundcheckTime { get; set; }

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public PerformanceStatus Status { get; set; }
    }
}
