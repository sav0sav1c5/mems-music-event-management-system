using MusicEventManagementSystem.Core.Enums.EventOrganization;
using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.DTOs.EventOrganization
{
    public class PerformanceResponseDto
    {
        public int Id { get; set; }
        public int PerformerId { get; set; }
        public int VenueId { get; set; }
        public DateTime StartTime { get; set; }
        public DateTime EndTime { get; set; }
        public int SetupTime { get; set; }
        public int SoundcheckTime { get; set; }
        public PerformanceStatus Status { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public class PerformanceCreateDto
    {
        [Required]
        public int PerformerId { get; set; }

        [Required]
        public int VenueId { get; set; }

        [Required]
        public DateTime StartTime { get; set; }

        [Required]
        public DateTime EndTime { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int SetupTime { get; set; }

        [Required]
        [Range(0, int.MaxValue)]
        public int SoundcheckTime { get; set; }

        [Required]
        public PerformanceStatus Status { get; set; }
    }

    public class PerformanceUpdateDto
    {
        public int? PerformerId { get; set; }
        public int? VenueId { get; set; }
        public DateTime? StartTime { get; set; }
        public DateTime? EndTime { get; set; }

        [Range(0, int.MaxValue)]
        public int? SetupTime { get; set; }

        [Range(0, int.MaxValue)]
        public int? SoundcheckTime { get; set; }

        public PerformanceStatus? Status { get; set; }
    }
}
