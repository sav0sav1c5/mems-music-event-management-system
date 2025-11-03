namespace MusicEventManagementSystem.API.DTOs
{
    public class EventNegotiationSummaryDto
    {
        public int EventId { get; set; }
        public string EventName { get; set; } = string.Empty;
        public DateTime EventDate { get; set; }
        public int UkupnoPregovora { get; set; }
        public int UspesnoZavrsenih { get; set; }
        public decimal UkupnaVrednost { get; set; }
        public decimal ProsecnaVrednost { get; set; }
        public int BrojPerformera { get; set; }
    }
}
