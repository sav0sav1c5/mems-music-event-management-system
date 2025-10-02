namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class Location
    {
        public int Id { get; set; }
        public string Name { get; set; }

        // Opcionalno: Obrnuta veza ka Event (1,N)
        // public ICollection<Event> Events { get; set; }
    }
}