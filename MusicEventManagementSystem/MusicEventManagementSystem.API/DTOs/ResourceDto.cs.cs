using MusicEventManagementSystem.Enums;
using System.ComponentModel.DataAnnotations;
using System.Text.Json.Serialization;

namespace MusicEventManagementSystem.API.DTOs
{
    public class ResourceResponseDto
    {
        public int Id { get; set; }
        public string Name { get; set; } = string.Empty;
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType Type { get; set; }
        public string Description { get; set; } = string.Empty;
        public int Quantity { get; set; }
        public bool IsAvailable { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

    public class ResourceCreateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType Type { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        public bool IsAvailable { get; set; }
    }

    public class ResourceUpdateDto
    {
        [Required]
        [StringLength(100)]
        public string Name { get; set; } = string.Empty;

        [Required]
        [StringLength(500)]
        public string Description { get; set; } = string.Empty;

        [Required]
        [JsonConverter(typeof(JsonStringEnumConverter))]
        public ResourceType Type { get; set; }

        [Range(1, int.MaxValue)]
        public int Quantity { get; set; }

        public bool IsAvailable { get; set; }
    }
}
