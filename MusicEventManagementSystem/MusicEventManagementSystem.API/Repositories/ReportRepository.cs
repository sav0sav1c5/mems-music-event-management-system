using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.Data;

namespace MusicEventManagementSystem.API.Repositories
{
    public class ReportRepository : IReportRepository
    {
        private readonly ApplicationDbContext _context;

        public ReportRepository(ApplicationDbContext context)
        {
            _context = context;
        }

        public async Task<IEnumerable<EventNegotiationSummaryDto>> GetEventNegotiationsReportAsync()
        {
            // Pozivanje PostgreSQL funkcije sa eksplicitnim mapiranjem kolona
            var sql = @"
                SELECT 
                    event_id AS ""EventId"",
                    event_name AS ""EventName"",
                    event_date AS ""EventDate"",
                    ukupno_pregovora AS ""UkupnoPregovora"",
                    uspesno_zavrsenih AS ""UspesnoZavrsenih"",
                    ukupna_vrednost AS ""UkupnaVrednost"",
                    prosecna_vrednost AS ""ProsecnaVrednost"",
                    broj_performera AS ""BrojPerformera""
                FROM generate_event_negotiations_report()";

            var result = await _context.Database
                .SqlQueryRaw<EventNegotiationSummaryDto>(sql)
                .ToListAsync();

            return result;
        }

        public async Task<IEnumerable<PerformerPhaseStatsDto>> GetPerformerPhaseReportAsync()
        {
            // Pozivanje PostgreSQL funkcije sa eksplicitnim mapiranjem kolona
            var sql = @"
                SELECT 
                    performer_id AS ""PerformerId"",
                    performer_name AS ""PerformerName"",
                    zanr AS ""Zanr"",
                    trenutna_faza AS ""TrenutnaFaza"",
                    broj_pregovora AS ""BrojPregovora"",
                    broj_evenata AS ""BrojEvenata"",
                    ukupna_ponudjena_cena AS ""UkupnaPonudjenaCena"",
                    prosecna_ponudjena_cena AS ""ProsecnaPonudjenaCena"",
                    min_cena AS ""MinCena"",
                    max_cena AS ""MaxCena"",
                    zavrsenih AS ""Zavrsenih"",
                    u_toku AS ""UToku""
                FROM generate_performer_phase_report()";

            var result = await _context.Database
                .SqlQueryRaw<PerformerPhaseStatsDto>(sql)
                .ToListAsync();

            return result;
        }
    }
}
