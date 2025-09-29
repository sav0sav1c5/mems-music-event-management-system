using MusicEventManagementSystem.Core.Enums.EventOrganization;

public class VehicleResourceDto
{
    public VehicleType VehicleType { get; set; }
    public string LicensePlate { get; set; }
    public int Capacity { get; set; }
    public bool DriverRequired { get; set; }
    public FuelType FuelType { get; set; }
    public string ResourceName { get; set; }
    public ResourceType ResourceType { get; set; }
    public string ResourceDescription { get; set; }
}