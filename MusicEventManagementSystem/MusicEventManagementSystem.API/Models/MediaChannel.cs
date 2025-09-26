namespace MusicEventManagementSystem.API.Models
{
    public class MediaChannel
    {
        public int MediaChannelId { get; set; }
        public string? PlatformType { get; set; }
        public string? APIKey { get; set; }
        public string? APIURL { get; set; }
        public string? APIVersion { get; set; }

        // Navigation properties
       // public virtual ICollection<IntegrationStatus> IntegrationStatuses { get; set; } = new List<IntegrationStatus>();
    }
}