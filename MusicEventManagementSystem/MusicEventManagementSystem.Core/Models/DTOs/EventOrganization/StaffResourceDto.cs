using MusicEventManagementSystem.Core.Enums.EventOrganization;

public class StaffResourceDto
{
    public StaffRole Role { get; set; }
    public RequiredSkillLevel RequiredSkillLevel { get; set; }
    public string ResourceName { get; set; }
    public ResourceType ResourceType { get; set; }
    public string ResourceDescription { get; set; }
}