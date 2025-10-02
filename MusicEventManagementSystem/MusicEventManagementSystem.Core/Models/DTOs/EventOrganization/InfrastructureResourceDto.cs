using MusicEventManagementSystem.Core.Enums.EventOrganization;

public class InfrastructureResourceDto
{
    public decimal Size { get; set; }
    public decimal Weight { get; set; }
    public int SetupTime { get; set; }
    public string ResourceName { get; set; }
    public ResourceType ResourceType { get; set; }
    public string ResourceDescription { get; set; }
}