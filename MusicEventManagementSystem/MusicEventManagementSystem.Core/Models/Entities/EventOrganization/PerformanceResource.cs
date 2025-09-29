using MusicEventManagementSystem.Core.Enums.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class PerformanceResource
    {
        public int Id { get; set; }
        public int PerformanceId { get; set; }
        //public Performance Performance { get; set; }

        public int ResourceId { get; set; }
        //public Resource Resource { get; set; }

        public int QuantityNeeded { get; set; }
        public PerformanceResourceStatus Status { get; set; }

        public DateTime CreatedAt { get; set; }
        public DateTime UpdatedAt { get; set; }
        public DateTime? DeletedAt { get; set; }
    }

}
