using MusicEventManagementSystem.Core.Enums.EventOrganization;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Vehicle
    {
        public int Id { get; set; }
        public VehicleType VehicleType { get; set; }
        public string LicensePlate { get; set; }
        public int Capacity { get; set; }
        public bool DriverRequired { get; set; }
        public FuelType FuelType { get; set; }
        public int ResourceId { get; set; }

        //public Resource Resource { get; set; }
    }
}
