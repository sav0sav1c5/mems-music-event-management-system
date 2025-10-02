namespace MusicEventManagementSystem.API.DTOs
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
        public bool IsDepositPaid { get; set; }
        public bool IsFinalPaymentPaid { get; set; }

        // Banking Information
        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankRoutingNumber { get; set; } = string.Empty;
        public string BankAccountHolderName { get; set; } = string.Empty;
        public string BankIBAN { get; set; } = string.Empty;
        public string BankSWIFT { get; set; } = string.Empty;

        // Review Information
        public bool ReviewedByStakeholders { get; set; }
        public DateTime? StakeholderReviewDate { get; set; }

        // Notes
        public string Notes { get; set; } = string.Empty;
        
        // Related entities (populated from navigation properties)
        public int PerformerId { get; set; }
        public string? PerformerName { get; set; }
        public int? EventId { get; set; }
        public string? EventTitle { get; set; }
        public string? EventLocation { get; set; }
        public DateTime? EventDate { get; set; }
    }

    public class UpdateContractDto
    {
        public string? Title { get; set; }
        public string? ContractType { get; set; }
        public decimal? Price { get; set; }
        public string? Version { get; set; }
        public string? Status { get; set; }
        public DateTime? SignedAt { get; set; }

        // Contract Document Information
        public string? ContractFilePath { get; set; }
        public DateTime? FinalVersionDate { get; set; }

        // Requirements
        public string? TechnicalRequirements { get; set; }
        public string? AccommodationRequirements { get; set; }

        // Payment Information
        public decimal? DepositAmount { get; set; }
        public decimal? FinalPaymentAmount { get; set; }
        public DateTime? DepositDueDate { get; set; }
        public DateTime? FinalPaymentDueDate { get; set; }
        public string? PaymentMethod { get; set; }
        public bool? IsDepositPaid { get; set; }
        public bool? IsFinalPaymentPaid { get; set; }

        // Banking Information
        public string? BankName { get; set; }
        public string? BankAccountNumber { get; set; }
        public string? BankRoutingNumber { get; set; }
        public string? BankAccountHolderName { get; set; }
        public string? BankIBAN { get; set; }
        public string? BankSWIFT { get; set; }

        // Review Information
        public bool? ReviewedByStakeholders { get; set; }
        public DateTime? StakeholderReviewDate { get; set; }

        // Notes
        public string? Notes { get; set; }
    }

    public class CreateContractDto
    {
        public string Title { get; set; } = string.Empty;
        public string ContractType { get; set; } = string.Empty;
        public decimal Price { get; set; }
        public string Version { get; set; } = string.Empty;
        public string Status { get; set; } = string.Empty;

        // Contract Document Information
        public string ContractFilePath { get; set; } = string.Empty;

        // Requirements
        public string TechnicalRequirements { get; set; } = string.Empty;
        public string AccommodationRequirements { get; set; } = string.Empty;

        // Payment Information
        public decimal? DepositAmount { get; set; }
        public decimal? FinalPaymentAmount { get; set; }
        public DateTime? DepositDueDate { get; set; }
        public DateTime? FinalPaymentDueDate { get; set; }
        public string PaymentMethod { get; set; } = string.Empty;

        // Banking Information
        public string BankName { get; set; } = string.Empty;
        public string BankAccountNumber { get; set; } = string.Empty;
        public string BankRoutingNumber { get; set; } = string.Empty;
        public string BankAccountHolderName { get; set; } = string.Empty;
        public string BankIBAN { get; set; } = string.Empty;
        public string BankSWIFT { get; set; } = string.Empty;

        // Notes
        public string Notes { get; set; } = string.Empty;

        // Foreign Keys
        public int PerformerId { get; set; }
        public int? EventId { get; set; }
    }
}