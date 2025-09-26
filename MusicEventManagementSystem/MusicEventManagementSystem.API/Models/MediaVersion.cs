namespace MusicEventManagementSystem.API.Models
{
    public class MediaVersion
    {
        public int MediaVersionId { get; set; }
        public string? VersionFileName { get; set; }
        public string? FileType { get; set; }
        public string? FileURL { get; set; }
        public bool IsFinalVersion { get; set; }
        public int AdId { get; set; }

        // Navigation properties
        public virtual Ad Ad { get; set; } = null!;
    }
}