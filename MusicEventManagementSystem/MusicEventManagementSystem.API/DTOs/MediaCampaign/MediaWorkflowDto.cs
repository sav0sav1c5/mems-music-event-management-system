using System.ComponentModel.DataAnnotations;

namespace MusicEventManagementSystem.API.DTOs.MediaCampaign
{
    public class MediaWorkflowResponseDto
    {
        public int MediaWorkflowId { get; set; }
        public string? WorkflowDescription { get; set; }
    }

    public class MediaWorkflowCreateDto
    {
        [StringLength(500)]
        public string? WorkflowDescription { get; set; }
    }

    public class MediaWorkflowUpdateDto
    {
        [StringLength(500)]
        public string? WorkflowDescription { get; set; }
    }
}