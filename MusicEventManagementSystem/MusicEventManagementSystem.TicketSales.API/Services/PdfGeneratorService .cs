using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.DTOs.TicketSales;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class PdfGeneratorService : IPdfGeneratorService
    {
        public byte[] GenerateSalesAnalysisPdf(AnalysisReport report)
        {
            // QuestPDF licenca (community license za nekomercijalnu upotrebu)
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(10).FontFamily("Calibri"));

                    // Header
                    page.Header().Element(ComposeHeader);

                    // Content
                    page.Content().Element(content => ComposeContent(content, report));

                    // Footer
                    page.Footer().AlignCenter().Text(text =>
                    {
                        text.CurrentPageNumber();
                        text.Span(" / ");
                        text.TotalPages();
                    });
                });
            });

            return document.GeneratePdf();
        }

        // ============================================
        // HEADER
        // ============================================
        private void ComposeHeader(IContainer container)
        {
            container.Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("IZVEŠTAJ O PRODAJI KARATA")
                        .FontSize(20)
                        .SemiBold()
                        .FontColor(Colors.Blue.Darken3);

                    column.Item().Text("Music Event Management System")
                        .FontSize(12)
                        .FontColor(Colors.Grey.Darken2);
                });

                row.ConstantItem(100).Height(50).Placeholder();
            });
        }

        // ============================================
        // CONTENT
        // ============================================
        private void ComposeContent(IContainer container, AnalysisReport report)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Spacing(10);

                // Report Info
                column.Item().Element(c => ComposeReportInfo(c, report));

                // Summary
                column.Item().Element(c => ComposeSummary(c, report.Summary));

                // Sections
                foreach (var section in report.Sections)
                {
                    column.Item().Element(c => ComposeSection(c, section.Key, section.Value));
                }

                // Recommendations
                if (report.Summary.Recommendations?.Any() == true)
                {
                    column.Item().Element(c => ComposeRecommendations(c, report.Summary.Recommendations));
                }
            });
        }

        // ============================================
        // REPORT INFO
        // ============================================
        private void ComposeReportInfo(IContainer container, AnalysisReport report)
        {
            container.Background(Colors.Grey.Lighten3).Padding(10).Column(column =>
            {
                column.Spacing(5);

                column.Item().Row(row =>
                {
                    row.RelativeItem().Text($"Datum generisanja: {report.GeneratedAt:dd.MM.yyyy HH:mm}");
                    if (report.EventId.HasValue)
                    {
                        row.RelativeItem().Text($"Event ID: {report.EventId.Value}").AlignRight();
                    }
                });

                column.Item().Text($"Period: {report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}");
            });
        }

        // ============================================
        // SUMMARY
        // ============================================
        private void ComposeSummary(IContainer container, AnalysisSummary summary)
        {
            container.Column(column =>
            {
                column.Spacing(5);

                column.Item().Text("SUMARNI PREGLED")
                    .FontSize(16)
                    .SemiBold()
                    .FontColor(Colors.Blue.Darken2);

                column.Item().PaddingTop(10).Row(row =>
                {
                    row.Spacing(10);

                    // Total Revenue Card
                    row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1)
                        .Padding(15).Column(col =>
                        {
                            col.Item().Text("Ukupan Prihod").FontSize(12).FontColor(Colors.Grey.Darken1);
                            col.Item().PaddingTop(5).Text($"{summary.TotalRevenue:N2} RSD")
                                .FontSize(18)
                                .SemiBold()
                                .FontColor(Colors.Green.Darken2);
                        });

                    // Total Tickets Card
                    row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1)
                        .Padding(15).Column(col =>
                        {
                            col.Item().Text("Prodato Karata").FontSize(12).FontColor(Colors.Grey.Darken1);
                            col.Item().PaddingTop(5).Text($"{summary.TotalTicketsSold:N0}")
                                .FontSize(18)
                                .SemiBold()
                                .FontColor(Colors.Blue.Darken2);
                        });

                    // Average Price Card
                    row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1)
                        .Padding(15).Column(col =>
                        {
                            col.Item().Text("Prosečna Cena").FontSize(12).FontColor(Colors.Grey.Darken1);
                            col.Item().PaddingTop(5).Text($"{summary.AverageTicketPrice:N2} RSD")
                                .FontSize(18)
                                .SemiBold()
                                .FontColor(Colors.Orange.Darken2);
                        });
                });

                // Top Performers
                if (!string.IsNullOrEmpty(summary.TopPerformingZone) || !string.IsNullOrEmpty(summary.TopPerformingOffer))
                {
                    column.Item().PaddingTop(10).Row(row =>
                    {
                        row.Spacing(10);

                        if (!string.IsNullOrEmpty(summary.TopPerformingZone))
                        {
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1)
                                .Padding(10).Column(col =>
                                {
                                    col.Item().Text("Najbolja Zona").FontSize(10).FontColor(Colors.Grey.Darken1);
                                    col.Item().Text(summary.TopPerformingZone).FontSize(12).SemiBold();
                                });
                        }

                        if (!string.IsNullOrEmpty(summary.TopPerformingOffer))
                        {
                            row.RelativeItem().Border(1).BorderColor(Colors.Grey.Lighten1)
                                .Padding(10).Column(col =>
                                {
                                    col.Item().Text("Najbolja Ponuda").FontSize(10).FontColor(Colors.Grey.Darken1);
                                    col.Item().Text(summary.TopPerformingOffer).FontSize(12).SemiBold();
                                });
                        }
                    });
                }
            });
        }

        // ============================================
        // SECTION
        // ============================================
        private void ComposeSection(IContainer container, string sectionName, List<SalesAnalysisResult> results)
        {
            if (!results.Any()) return;

            container.Column(column =>
            {
                column.Spacing(5);

                // Section Title
                column.Item().PaddingTop(10).Text(FormatSectionName(sectionName))
                    .FontSize(14)
                    .SemiBold()
                    .FontColor(Colors.Blue.Darken2);

                // Section Table
                column.Item().Table(table =>
                {
                    table.ColumnsDefinition(columns =>
                    {
                        columns.RelativeColumn(3); // Metric Name
                        columns.RelativeColumn(2); // Value
                        columns.RelativeColumn(1); // Unit
                    });

                    // Header
                    table.Header(header =>
                    {
                        header.Cell().Element(CellStyle).Text("Metrika").SemiBold();
                        header.Cell().Element(CellStyle).Text("Vrednost").SemiBold();
                        header.Cell().Element(CellStyle).Text("Jedinica").SemiBold();

                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .Border(1)
                                .BorderColor(Colors.Grey.Lighten1)
                                .Background(Colors.Grey.Lighten3)
                                .Padding(5);
                        }
                    });

                    // Rows
                    foreach (var result in results)
                    {
                        table.Cell().Element(CellStyle).Text(result.MetricName);
                        table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}");
                        table.Cell().Element(CellStyle).Text(result.MetricUnit);

                        static IContainer CellStyle(IContainer container)
                        {
                            return container
                                .Border(1)
                                .BorderColor(Colors.Grey.Lighten2)
                                .Padding(5);
                        }
                    }
                });

                // Additional Info (if present)
                var itemsWithInfo = results.Where(r => r.AdditionalInfo != null).ToList();
                if (itemsWithInfo.Any())
                {
                    column.Item().PaddingTop(5).Column(detailColumn =>
                    {
                        foreach (var item in itemsWithInfo.Take(3)) // Top 3
                        {
                            if (item.AdditionalInfo != null)
                            {
                                detailColumn.Item().PaddingBottom(5)
                                    .Border(1)
                                    .BorderColor(Colors.Grey.Lighten2)
                                    .Background(Colors.Grey.Lighten4)
                                    .Padding(8)
                                    .Text(text =>
                                    {
                                        text.Span($"{item.MetricName}: ").SemiBold();
                                        text.Span(item.AdditionalInfo.RootElement.ToString());
                                    });
                            }
                        }
                    });
                }
            });
        }

        // ============================================
        // RECOMMENDATIONS
        // ============================================
        private void ComposeRecommendations(IContainer container, List<string> recommendations)
        {
            container.Column(column =>
            {
                column.Spacing(5);

                column.Item().PaddingTop(10).Text("PREPORUKE")
                    .FontSize(14)
                    .SemiBold()
                    .FontColor(Colors.Orange.Darken2);

                column.Item().Border(1).BorderColor(Colors.Orange.Lighten2)
                    .Background(Colors.Orange.Lighten4)
                    .Padding(10)
                    .Column(recColumn =>
                    {
                        recColumn.Spacing(5);
                        foreach (var recommendation in recommendations)
                        {
                            recColumn.Item().Row(row =>
                            {
                                row.ConstantItem(15).Text("•");
                                row.RelativeItem().Text(recommendation);
                            });
                        }
                    });
            });
        }

        // ============================================
        // HELPER METHODS
        // ============================================
        private string FormatSectionName(string sectionName)
        {
            return sectionName switch
            {
                "OSNOVNE_METRIKE" => "Osnovne Metrike",
                "ANALIZA_PO_ZONAMA" => "Analiza po Zonama",
                "PRICING_RULES_EFIKASNOST" => "Efikasnost Pricing Pravila",
                "SPECIAL_OFFERS_PERFORMANCE" => "Performanse Specijalnih Ponuda",
                "TREND_ANALIZA" => "Trend Analiza",
                "EVENT_COMPARISON" => "Poređenje Event-ova",
                "REVENUE_OPTIMIZATION" => "Optimizacija Prihoda",
                _ => sectionName
            };
        }
    }
}
