namespace MusicEventManagementSystem.Core.Models.Entities.MediaCampaign
{
    public class Approval
    {
        public int ApprovalId { get; set; }
        public string? ApprovalStatus { get; set; }
        public string? Comment { get; set; }
        public DateTime ApprovalDate { get; set; }
        public int MediaTaskId { get; set; }

    }
}