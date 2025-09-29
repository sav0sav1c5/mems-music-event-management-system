using MusicEventManagementSystem.Core.Enums.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Equipment
    {
        public int Id { get; set; }
        public string Model { get; set; }
        public string SerialNumber { get; set; }
        public bool RequiresSetup { get; set; }
        public PowerRequirements PowerRequirements { get; set; }
        public int ResourceId { get; set; }
        //public Resource Resource { get; set; }
    }
}
    
