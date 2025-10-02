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

        // Contract Document Information
        public string ContractFilePath { get; set; } = string.Empty;
        public DateTime? FinalVersionDate { get; set; }

        // Requirements
        public string TechnicalRequirements { get; set; } = string.Empty;
        public string AccommodationRequirements { get; set; } = string.Empty;

        // Payment Information
        public decimal? DepositAmount { get; set; }
        public decimal? FinalPaymentAmount { get; set; }
        public DateTime? DepositDueDate { get; set; }
        public DateTime? FinalPaymentDueDate { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;
        public bool IsDepositPaid { get; set; } = false;
        public bool IsFinalPaymentPaid { get; set; } = false;

        // Banking Information
        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankRoutingNumber { get; set; } = string.Empty;
        public string BankAccountHolderName { get; set; } = string.Empty;
        public string BankIBAN { get; set; } = string.Empty;
        public string BankSWIFT { get; set; } = string.Empty;

        // Review Information
        public bool ReviewedByStakeholders { get; set; } = false;
        public DateTime? StakeholderReviewDate { get; set; }

        // Notes
        public string Notes { get; set; } = string.Empty;

        // Foreign Keys
        public int PerformerId { get; set; }
        public int? EventId { get; set; }

        // Navigation Properties
        public Performer Performer { get; set; } = null!;
        public Event? Event { get; set; }
    }
}