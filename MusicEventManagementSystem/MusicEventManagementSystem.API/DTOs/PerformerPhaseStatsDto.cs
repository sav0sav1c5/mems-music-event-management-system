namespace MusicEventManagementSystem.API.DTOs
{
    public class PerformerPhaseStatsDto
    {
        public int PerformerId { get; set; }
        public string PerformerName { get; set; } = string.Empty;
        public string Zanr { get; set; } = string.Empty;
        public int TrenutnaFaza { get; set; }
        public int BrojPregovora { get; set; }
        public int BrojEvenata { get; set; }
        public decimal UkupnaPonudjenaCena { get; set; }
        public decimal ProsecnaPonudjenaCena { get; set; }
        public decimal MinCena { get; set; }
        public decimal MaxCena { get; set; }
        public int Zavrsenih { get; set; }
        public int UToku { get; set; }
    }
}
