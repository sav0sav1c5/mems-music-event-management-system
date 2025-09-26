namespace MusicEventManagementSystem.API.Models
{
    public class AdType
    {
        public int AdTypeId { get; set; }
        public string? TypeName { get; set; }
        public string? TypeDescription { get; set; }
        public string? Dimensions { get; set; }
        public int Duration { get; set; }
        public string? FileFormat { get; set; }

    }
}