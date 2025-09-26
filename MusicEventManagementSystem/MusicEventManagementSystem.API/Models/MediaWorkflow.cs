namespace MusicEventManagementSystem.API.Models
{
    public class MediaWorkflow
    {
        public int MediaWorkflowId { get; set; }
        public string? WorkflowDescription { get; set; }

        // Navigation properties
       // public virtual ICollection<Ad>? Ads { get; set; } = new List<Ad>();
        public virtual ICollection<MediaTask>? Tasks { get; set; } = new List<MediaTask>();
    }
}