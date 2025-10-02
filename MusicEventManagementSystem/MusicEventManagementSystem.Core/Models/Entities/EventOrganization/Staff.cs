using MusicEventManagementSystem.Core.Enums.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{

    public class Staff
    {
        public int Id { get; set; }
        public StaffRole Role { get; set; }
        public RequiredSkillLevel RequiredSkillLevel { get; set; }
        public int ResourceId { get; set; }
        //public Resource Resource { get; set; }
    }
}

