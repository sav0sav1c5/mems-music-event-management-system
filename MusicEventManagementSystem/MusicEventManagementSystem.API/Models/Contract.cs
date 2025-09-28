namespace MusicEventManagementSystem.API.Models
{
    public class Contract
    {
        public int ContractId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ContractType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? SignedAt { get; set; }

        // Foreign Key
        public int PerformerId { get; set; }

        // Navigation Properties
        public Performer Performer { get; set; } = null!;
    }
}
