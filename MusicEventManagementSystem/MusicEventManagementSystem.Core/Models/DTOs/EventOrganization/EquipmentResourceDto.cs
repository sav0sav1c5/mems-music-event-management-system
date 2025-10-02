using MusicEventManagementSystem.Core.Enums.EventOrganization;

public class EquipmentResourceDto
{
    public string Model { get; set; }
    public string SerialNumber { get; set; }
    public bool RequiresSetup { get; set; }
    public PowerRequirements PowerRequirements { get; set; }
    public string ResourceName { get; set; }
    public ResourceType ResourceType { get; set; }
    public string ResourceDescription { get; set; }
}