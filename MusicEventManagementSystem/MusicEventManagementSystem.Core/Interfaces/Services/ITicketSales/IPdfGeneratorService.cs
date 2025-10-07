using MusicEventManagementSystem.Core.Models.DTOs.TicketSales;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales
{
    public interface IPdfGeneratorService
    {
        byte[] GenerateSalesAnalysisPdf(AnalysisReport report);
    }
}
