using MusicEventManagementSystem.Core.Enums.EventOrganization;

public class ServiceResourceDto
{
    public string Provider { get; set; }
    public string Contact { get; set; }
    public ContractSigned ContractSigned { get; set; }
    public int ServiceDuration { get; set; }
    public string ResourceName { get; set; }
    public ResourceType ResourceType { get; set; }
    public string ResourceDescription { get; set; }
}