namespace MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication
{
    public class ContractDto
    {
        public int ContractId { get; set; }
        public string Title { get; set; } = string.Empty;
        public string ContractType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        public DateTime CreatedAt { get; set; }
        public DateTime? SignedAt { get; set; }
        
        // Related entity
        public int PerformerId { get; set; }
        public string? PerformerName { get; set; }
    }

    public class CreateContractDto
    {
        public string Title { get; set; } = string.Empty;
        public string ContractType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        // Required foreign key
        public int PerformerId { get; set; }
    }

    public class UpdateContractDto
    {
        public string Title { get; set; } = string.Empty;
        public string ContractType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;
        
        // Allow updating foreign key
        public int PerformerId { get; set; }
    }

    public class ContractWithDetailsDto : ContractDto
    {
        // Extended version with full related entity details
        public PerformerResponseDto? Performer { get; set; }
        public PhaseDto? Phase { get; set; } // Optional one-to-one relationship
    }
}
