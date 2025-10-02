using MusicEventManagementSystem.Core.Enums.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class WorkTask
    {
        public int Id { get; set; }
        public int PerformanceId { get; set; }
        public Performance? Performance { get; set; }

        public string Name { get; set; }
        public string Description { get; set; }
        public WorkTaskStatus Status { get; set; }
        public DateTime Start { get; set; }
        public DateTime End { get; set; }
        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }
}