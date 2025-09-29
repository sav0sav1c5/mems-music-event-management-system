using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Models.Entities.EventOrganization
{
    public class EventInfrastructure
    {
        public int Id { get; set; }
        public decimal Size { get; set; }
        public decimal Weight { get; set; }
        public int SetupTime { get; set; }
        public int ResourceId { get; set; }
        //public Resource Resource { get; set; }
    }
}
