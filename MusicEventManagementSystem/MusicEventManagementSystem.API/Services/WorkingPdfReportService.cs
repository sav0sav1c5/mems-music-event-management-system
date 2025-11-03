using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class WorkingPdfReportService : IPdfReportService
    {
        private readonly IAnalyticsService _analyticsService;

        public WorkingPdfReportService(IAnalyticsService analyticsService)
        {
            _analyticsService = analyticsService;
            // Set QuestPDF license for community use
            QuestPDF.Settings.License = LicenseType.Community;
        }

        public async Task<byte[]> GenerateAnalyticsReportAsync(AnalyticsFilterDto? filters = null)
        {
            var analytics = await _analyticsService.GetAnalyticsOverviewAsync(filters);
            var phaseDistribution = await _analyticsService.GetPhaseDistributionAsync(filters);
            var workflowAnalytics = await _analyticsService.GetWorkflowStateAnalyticsAsync(filters);
            var liveAnalytics = await _analyticsService.GetLiveAnalyticsAsync();

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.DefaultTextStyle(x => x.FontSize(10));

                    // Header
                    page.Header()
                        .Height(60)
                        .Background(Colors.Blue.Darken2)
                        .AlignCenter()
                        .AlignMiddle()
                        .Text("🎵 MEMS - Napredni Analitički Izveštaj")
                        .FontSize(20)
                        .Bold()
                        .FontColor(Colors.White);

                    // Content
                    page.Content()
                        .Padding(15)
                        .Column(column =>
                        {
                            column.Spacing(15);

                            // Executive Summary
                            if (analytics != null)
                            {
                                column.Item()
                                    .Background(Colors.Blue.Lighten5)
                                    .Border(2, Unit.Point)
                                    .BorderColor(Colors.Blue.Lighten2)
                                    .Padding(15)
                                    .Column(summaryColumn =>
                                    {
                                        summaryColumn.Item()
                                            .Text("📊 Izvršni Pregled - Executive Summary")
                                            .FontSize(18)
                                            .Bold()
                                            .FontColor(Colors.Blue.Darken2);
                                        
                                        summaryColumn.Item()
                                            .PaddingTop(10)
                                            .Text($"Ovaj sveobuhvatni izveštaj analizira performanse sistema za upravljanje muzičkim događajima. " +
                                                  $"Ukupno je analizirano {analytics.TotalNegotiations} pregovora sa kumulativnom vrednošću od {analytics.TotalProposedValue:C0}.")
                                            .FontSize(12);
                                    });

                                // KPI Cards
                                column.Item()
                                    .Text("📈 Ključni Indikatori Performansi")
                                    .FontSize(16)
                                    .Bold()
                                    .FontColor(Colors.Blue.Darken2);

                                column.Item()
                                    .Row(row =>
                                    {
                                        // Total Negotiations
                                        row.RelativeItem()
                                            .Padding(5)
                                            .Background(Colors.Blue.Lighten4)
                                            .Border(2, Unit.Point)
                                            .BorderColor(Colors.Blue.Medium)
                                            .Padding(15)
                                            .Column(cardColumn =>
                                            {
                                                cardColumn.Item()
                                                    .Text("🤝 UKUPNO PREGOVORA")
                                                    .FontSize(12)
                                                    .Bold()
                                                    .FontColor(Colors.Grey.Darken2);
                                                
                                                cardColumn.Item()
                                                    .Text(analytics.TotalNegotiations.ToString())
                                                    .FontSize(32)
                                                    .Bold()
                                                    .FontColor(Colors.Blue.Darken2);
                                            });

                                        // Active Negotiations
                                        row.RelativeItem()
                                            .Padding(5)
                                            .Background(Colors.Green.Lighten4)
                                            .Border(2, Unit.Point)
                                            .BorderColor(Colors.Green.Medium)
                                            .Padding(15)
                                            .Column(cardColumn =>
                                            {
                                                cardColumn.Item()
                                                    .Text("⚡ AKTIVNI PREGOVORI")
                                                    .FontSize(12)
                                                    .Bold()
                                                    .FontColor(Colors.Grey.Darken2);
                                                
                                                cardColumn.Item()
                                                    .Text(analytics.ActiveNegotiations.ToString())
                                                    .FontSize(32)
                                                    .Bold()
                                                    .FontColor(Colors.Green.Darken2);
                                            });

                                        // Total Value
                                        row.RelativeItem()
                                            .Padding(5)
                                            .Background(Colors.Orange.Lighten4)
                                            .Border(2, Unit.Point)
                                            .BorderColor(Colors.Orange.Medium)
                                            .Padding(15)
                                            .Column(cardColumn =>
                                            {
                                                cardColumn.Item()
                                                    .Text("💰 UKUPNA VREDNOST")
                                                    .FontSize(12)
                                                    .Bold()
                                                    .FontColor(Colors.Grey.Darken2);
                                                
                                                cardColumn.Item()
                                                    .Text($"{analytics.TotalProposedValue:C0}")
                                                    .FontSize(24)
                                                    .Bold()
                                                    .FontColor(Colors.Orange.Darken2);
                                            });
                                    });
                            }

                            // Phase Distribution
                            if (phaseDistribution != null && phaseDistribution.Any())
                            {
                                column.Item()
                                    .PaddingTop(10)
                                    .Text("📊 Distribucija po Fazama")
                                    .FontSize(16)
                                    .Bold()
                                    .FontColor(Colors.Purple.Darken2);

                                column.Item()
                                    .Background(Colors.Purple.Lighten5)
                                    .Border(2, Unit.Point)
                                    .BorderColor(Colors.Purple.Lighten3)
                                    .Padding(15)
                                    .Column(phaseColumn =>
                                    {
                                        var maxCount = phaseDistribution.Max(p => p.NegotiationCount);
                                        
                                        foreach (var phase in phaseDistribution.Take(5))
                                        {
                                            phaseColumn.Item()
                                                .PaddingVertical(4)
                                                .Row(phaseRow =>
                                                {
                                                    phaseRow.ConstantItem(120)
                                                        .Text($"🔹 {phase.PhaseName}")
                                                        .FontSize(10)
                                                        .Bold()
                                                        .FontColor(Colors.Grey.Darken2);
                                                    
                                                    phaseRow.RelativeItem()
                                                        .Column(barColumn =>
                                                        {
                                                            var barWidth = maxCount > 0 ? (phase.NegotiationCount * 100.0 / maxCount) : 0;
                                                            
                                                            barColumn.Item()
                                                                .Row(barRow =>
                                                                {
                                                                    var safeBarWidth = Math.Max(0.1f, (float)barWidth);
                                                                    var safeRemainingWidth = Math.Max(0.1f, (float)(100 - barWidth));
                                                                    
                                                                    barRow.RelativeItem(safeBarWidth)
                                                                        .Height(18)
                                                                        .Background(Colors.Purple.Medium);
                                                                    barRow.RelativeItem(safeRemainingWidth)
                                                                        .Height(18)
                                                                        .Background(Colors.Grey.Lighten4);
                                                                });
                                                            
                                                            barColumn.Item()
                                                                .PaddingTop(2)
                                                                .Text($"{phase.NegotiationCount} pregovora ({phase.Percentage:F1}%)")
                                                                .FontSize(9)
                                                                .FontColor(Colors.Grey.Darken2);
                                                        });
                                                });
                                        }
                                    });
                            }

                            // Live Analytics
                            if (liveAnalytics != null)
                            {
                                column.Item()
                                    .PaddingTop(10)
                                    .Text("⚡ Live Analitika")
                                    .FontSize(16)
                                    .Bold()
                                    .FontColor(Colors.Red.Darken2);
                                
                                column.Item()
                                    .Background(Colors.Red.Lighten5)
                                    .Border(2, Unit.Point)
                                    .BorderColor(Colors.Red.Lighten3)
                                    .Padding(15)
                                    .Column(liveCol =>
                                    {
                                        liveCol.Item()
                                            .Text("🔴 SISTEM U REALNOM VREMENU")
                                            .FontSize(12)
                                            .Bold()
                                            .FontColor(Colors.Red.Darken2);
                                        
                                        liveCol.Item()
                                            .PaddingTop(3)
                                            .Text($"⏰ Vreme generisanja: {DateTime.Now:HH:mm:ss}")
                                            .FontSize(10)
                                            .Bold();
                                        
                                        liveCol.Item()
                                            .Text($"📅 {DateTime.Now:dddd, dd. MMMM yyyy.}")
                                            .FontSize(9);
                                        
                                        liveCol.Item()
                                            .PaddingTop(5)
                                            .Text("🟢 STATUS: AKTIVAN - 💾 Podaci: Ažurni - 🔄 Sinhronizovano")
                                            .FontSize(10)
                                            .FontColor(Colors.Green.Darken2);
                                    });
                            }

                            // Summary
                            column.Item()
                                .PaddingTop(15)
                                .Background(Colors.Blue.Darken3)
                                .Padding(20)
                                .Column(summaryCol =>
                                {
                                    summaryCol.Item()
                                        .Text("📋 ZAKLJUČAK I PREPORUKE")
                                        .FontSize(16)
                                        .Bold()
                                        .FontColor(Colors.White);
                                    
                                    summaryCol.Item()
                                        .PaddingTop(10)
                                        .Text("Ovaj analitički izveštaj predstavlja sveobuhvatan pregled performansi sistema za upravljanje muzičkim događajima. " +
                                               "Podaci pokazuju trenutno stanje organizacije i pružaju osnovu za donošenje informisanih poslovnih odluka.")
                                        .FontSize(12)
                                        .FontColor(Colors.Blue.Lighten4);
                                    
                                    summaryCol.Item()
                                        .PaddingTop(10)
                                        .Text("🎯 Ključne preporuke: Optimizovati proces pregovaranja, uspostaviti automatizovane alerte za kritične pregovore, " +
                                               "redovno ažurirati analitičke kapacitete sistema.")
                                        .FontSize(11)
                                        .FontColor(Colors.Blue.Lighten4);
                                });
                        });

                    // Footer
                    page.Footer()
                        .Height(50)
                        .Background(Colors.Blue.Darken3)
                        .AlignCenter()
                        .AlignMiddle()
                        .Text($"🎵 Music Event Management System - Generisan: {DateTime.Now:dd.MM.yyyy HH:mm}")
                        .FontSize(10)
                        .FontColor(Colors.White);
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> GeneratePerformerReportAsync(int? performerId = null, AnalyticsFilterDto? filters = null)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    page.Header()
                        .Text("Izvođač - Analitički Izveštaj")
                        .FontSize(20)
                        .Bold();
                    
                    page.Content()
                        .Text("Analitika performansi izvođača - Radna verzija");

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.CurrentPageNumber();
                            text.Span(" / ");
                            text.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> GenerateEventReportAsync(int? eventId = null, AnalyticsFilterDto? filters = null)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    page.Header()
                        .Text("Pregovor - Detaljni Izveštaj")
                        .FontSize(20)
                        .Bold();
                    
                    page.Content()
                        .Text($"Detaljni izveštaj za pregovor {eventId ?? 0} - Radna verzija");

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.CurrentPageNumber();
                            text.Span(" / ");
                            text.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }

        public async Task<byte[]> GenerateDashboardReportAsync(AnalyticsFilterDto? filters = null)
        {
            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);

                    page.Header()
                        .Text("Dashboard - Sveobuhvatni Izveštaj")
                        .FontSize(20)
                        .Bold();
                    
                    page.Content()
                        .Text("Kompletna analitika sistema - Radna verzija");

                    page.Footer()
                        .AlignCenter()
                        .Text(text =>
                        {
                            text.CurrentPageNumber();
                            text.Span(" / ");
                            text.TotalPages();
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}