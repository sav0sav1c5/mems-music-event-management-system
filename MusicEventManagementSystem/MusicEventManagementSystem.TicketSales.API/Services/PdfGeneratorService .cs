using MusicEventManagementSystem.Core.Interfaces.Services.ITicketSales;
using MusicEventManagementSystem.Core.Models.DTOs.TicketSales;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Text.Json;

namespace MusicEventManagementSystem.TicketSales.API.Services
{
    public class PdfGeneratorService : IPdfGeneratorService
    {
        private static class Colors
        {
            public static readonly string Primary = "#84cc16"; // Lime green
            public static readonly string Secondary = "#22c55e"; // Green
            public static readonly string Success = "#16a34a"; // Green 600
            public static readonly string Warning = "#f59e0b"; // Amber 500
            public static readonly string Danger = "#dc2626"; // Red 600
            public static readonly string Info = "#0891b2"; // Cyan 600
            public static readonly string Light = "#f3f4f6"; // Gray 100
            public static readonly string LightBorder = "#e5e7eb"; // Gray 200
            public static readonly string TextPrimary = "#1f2937"; // Gray 800
            public static readonly string TextSecondary = "#6b7280"; // Gray 500
        }

        public byte[] GenerateSalesAnalysisPdf(AnalysisReport report)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(1.5f, Unit.Centimetre);
                    page.PageColor(QuestPDF.Helpers.Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontFamily("Calibri").FontColor(Colors.TextPrimary));

                    page.Header().Element(ComposeHeader);
                    page.Content().Element(content => ComposeContent(content, report));
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

        private void ComposeHeader(IContainer container)
        {
            container.Background(Colors.Primary).Padding(15).Row(row =>
            {
                row.RelativeItem().Column(column =>
                {
                    column.Item().Text("TICKET SALES REPORT")
                        .FontSize(20)
                        .Bold()
                        .FontColor(QuestPDF.Helpers.Colors.Black);

                    column.Item().PaddingTop(3).Text("Music Event Management System")
                        .FontSize(11)
                        .FontColor(QuestPDF.Helpers.Colors.Grey.Lighten3);
                });
            });
        }

        private void ComposeContent(IContainer container, AnalysisReport report)
        {
            container.PaddingVertical(10).Column(column =>
            {
                column.Spacing(12);

                column.Item().Element(c => ComposeReportInfo(c, report));
                column.Item().Element(c => ComposeSummary(c, report)); // Promenjeno ovde

                foreach (var section in report.Sections.OrderBy(s => GetSectionOrder(s.Key)))
                {
                    column.Item().Element(c => ComposeSection(c, section.Key, section.Value));
                }

                if (report.Summary.Recommendations?.Any() == true)
                {
                    column.Item().Element(c => ComposeRecommendations(c, report.Summary.Recommendations));
                }
            });
        }

        private void ComposeReportInfo(IContainer container, AnalysisReport report)
        {
            container.Background(Colors.Light).Border(1).BorderColor(Colors.LightBorder)
                .Padding(12).Row(row =>
                {
                    row.RelativeItem().Text($"Generated: {report.GeneratedAt:MM/dd/yyyy HH:mm}")
                        .FontSize(9).FontColor(Colors.TextPrimary);

                    row.RelativeItem().Text($"Period: {report.StartDate:MM/dd/yyyy} - {report.EndDate:MM/dd/yyyy}")
                        .FontSize(9).FontColor(Colors.TextPrimary).AlignCenter();

                    if (report.EventId.HasValue)
                    {
                        row.RelativeItem().Text($"Event ID: {report.EventId.Value}")
                            .FontSize(9).FontColor(Colors.TextPrimary).AlignRight();
                    }
                });
        }

        private void ComposeSummary(IContainer container, AnalysisReport report)
        {
            var summary = report.Summary;
            var sections = report.Sections;

            container.Column(column =>
            {
                column.Spacing(8);

                column.Item().Text("SUMMARY OVERVIEW")
                    .FontSize(15)
                    .Bold()
                    .FontColor(Colors.Primary);

                // Get basic metrics from sections instead of summary
                var basicMetrics = sections.ContainsKey("BASIC_METRICS")
                    ? sections["BASIC_METRICS"]
                    : new List<SalesAnalysisResult>();

                var totalRevenueMetric = basicMetrics.FirstOrDefault(m => m.MetricName == "Total Revenue");
                var ticketsSoldMetric = basicMetrics.FirstOrDefault(m => m.MetricName == "Total Tickets Sold");
                var avgPriceMetric = basicMetrics.FirstOrDefault(m => m.MetricName == "Average Ticket Price");

                column.Item().PaddingTop(5).Row(row =>
                {
                    row.Spacing(10);

                    row.RelativeItem().Element(c => CreateSummaryCard(c,
                        "Total Revenue",
                        $"{(totalRevenueMetric?.MetricValue ?? 0):N2}",
                        "RSD",
                        Colors.Success));

                    row.RelativeItem().Element(c => CreateSummaryCard(c,
                        "Tickets Sold",
                        $"{(ticketsSoldMetric?.MetricValue ?? 0):N0}",
                        "pcs",
                        Colors.Secondary));

                    row.RelativeItem().Element(c => CreateSummaryCard(c,
                        "Average Price",
                        $"{(avgPriceMetric?.MetricValue ?? 0):N2}",
                        "RSD",
                        Colors.Warning));
                });

                if (!string.IsNullOrEmpty(summary.TopPerformingZone) || !string.IsNullOrEmpty(summary.TopPerformingOffer))
                {
                    column.Item().PaddingTop(8).Row(row =>
                    {
                        row.Spacing(10);

                        if (!string.IsNullOrEmpty(summary.TopPerformingZone))
                        {
                            row.RelativeItem().Element(c => CreateHighlightCard(c,
                                "Top Zone",
                                summary.TopPerformingZone,
                                Colors.Info));
                        }

                        if (!string.IsNullOrEmpty(summary.TopPerformingOffer))
                        {
                            row.RelativeItem().Element(c => CreateHighlightCard(c,
                                "Top Offer",
                                summary.TopPerformingOffer,
                                Colors.Info));
                        }
                    });
                }
            });
        }

        private void CreateSummaryCard(IContainer container, string label, string value, string unit, string color)
        {
            container.Border(1).BorderColor(Colors.LightBorder).Padding(12).Column(col =>
            {
                col.Item().Text(label).FontSize(9).FontColor(Colors.TextSecondary);
                col.Item().PaddingTop(5).Row(row =>
                {
                    row.AutoItem().Text(value).FontSize(16).Bold().FontColor(color);
                    row.AutoItem().PaddingLeft(5).Text(unit).FontSize(10).FontColor(Colors.TextSecondary);
                });
            });
        }

        private void CreateHighlightCard(IContainer container, string label, string value, string color)
        {
            container.Border(1).BorderColor(color).Background(Colors.Light).Padding(10).Column(col =>
            {
                col.Item().Text(label).FontSize(8).FontColor(Colors.TextSecondary);
                col.Item().PaddingTop(3).Text(value).FontSize(10).SemiBold().FontColor(color);
            });
        }

        private void ComposeSection(IContainer container, string sectionName, List<SalesAnalysisResult> results)
        {
            if (!results.Any()) return;

            container.Column(column =>
            {
                column.Spacing(8);

                column.Item().Border(1).BorderColor(Colors.Primary).Background(Colors.Primary)
                    .Padding(8).Text(FormatSectionName(sectionName))
                    .FontSize(12)
                    .Bold()
                    .FontColor(QuestPDF.Helpers.Colors.Black);

                switch (sectionName)
                {
                    case "BASIC_METRICS":
                        ComposeBasicMetricsSection(column, results);
                        break;
                    case "ZONE_ANALYSIS":
                        ComposeZonesSection(column, results);
                        break;
                    case "PRICING_RULES_EFFICIENCY":
                        ComposePricingRulesSection(column, results);
                        break;
                    case "SPECIAL_OFFERS_PERFORMANCE":
                        ComposeSpecialOffersSection(column, results);
                        break;
                    case "TREND_ANALYSIS":
                        ComposeTrendSection(column, results);
                        break;
                    case "EVENT_COMPARISON":
                        ComposeEventsSection(column, results);
                        break;
                    case "REVENUE_OPTIMIZATION":
                        ComposeOptimizationSection(column, results);
                        break;
                    case "CURSOR_STATISTICS":
                        ComposeCursorStatsSection(column, results);
                        break;
                    default:
                        ComposeGenericTable(column, results);
                        break;
                }
            });
        }

        private void ComposeBasicMetricsSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Metric").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Value").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Unit").SemiBold();
                });

                foreach (var result in results)
                {
                    table.Cell().Element(CellStyle).Text(result.MetricName);
                    table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}").SemiBold();
                    table.Cell().Element(CellStyle).Text(result.MetricUnit);
                }
            });
        }

        private void ComposeZonesSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Zone").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Revenue").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Unit").SemiBold();
                });

                foreach (var result in results)
                {
                    table.Cell().Element(CellStyle).Text(result.MetricName.Replace("Zone: ", ""));
                    table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}").SemiBold().FontColor(Colors.Success);
                    table.Cell().Element(CellStyle).Text(result.MetricUnit);
                }
            });

            var topZones = results.Take(3).ToList();
            if (topZones.Any())
            {
                column.Item().PaddingTop(6).Text("Top 3 Zones - Details").FontSize(10).SemiBold().FontColor(QuestPDF.Helpers.Colors.Black);

                foreach (var zone in topZones)
                {
                    if (zone.AdditionalInfo != null)
                    {
                        var info = ParseJsonInfo(zone.AdditionalInfo);
                        column.Item().PaddingTop(4).Border(1).BorderColor(Colors.LightBorder)
                            .Background(Colors.Light).Padding(8).Column(col =>
                            {
                                col.Item().Text(zone.MetricName.Replace("Zone: ", "")).FontSize(10).Bold().FontColor(QuestPDF.Helpers.Colors.Black);
                                col.Item().PaddingTop(3).Row(row =>
                                {
                                    row.RelativeItem().Column(c =>
                                    {
                                        c.Item().Text(t =>
                                        {
                                            t.Span("Sold: ").FontSize(8).FontColor(Colors.TextSecondary);
                                            t.Span(GetValue(info, "tickets_sold")).FontSize(9).SemiBold();
                                        });
                                        c.Item().Text(t =>
                                        {
                                            t.Span("Avg. Price: ").FontSize(8).FontColor(Colors.TextSecondary);
                                            t.Span($"{GetValue(info, "avg_price")} RSD").FontSize(9).SemiBold();
                                        });
                                    });
                                    row.RelativeItem().Column(c =>
                                    {
                                        c.Item().Text(t =>
                                        {
                                            t.Span("Base Price: ").FontSize(8).FontColor(Colors.TextSecondary);
                                            t.Span($"{GetValue(info, "base_price")} RSD").FontSize(9).SemiBold();
                                        });
                                        c.Item().Text(t =>
                                        {
                                            t.Span("Occupancy: ").FontSize(8).FontColor(Colors.TextSecondary);
                                            t.Span($"{GetValue(info, "occupancy_rate")}%").FontSize(9).SemiBold();
                                        });
                                    });
                                });
                            });
                    }
                }
            }
        }

        private void ComposePricingRulesSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Rule").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Revenue").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Unit").SemiBold();
                });

                foreach (var result in results)
                {
                    table.Cell().Element(CellStyle).Text(result.MetricName.Replace("Rule: ", ""));
                    table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}").SemiBold().FontColor(Colors.Success);
                    table.Cell().Element(CellStyle).Text(result.MetricUnit);
                }
            });

            column.Item().PaddingTop(6).Text("Detailed Rules Analysis").FontSize(10).SemiBold().FontColor(QuestPDF.Helpers.Colors.Black);

            foreach (var rule in results)
            {
                if (rule.AdditionalInfo != null)
                {
                    var info = ParseJsonInfo(rule.AdditionalInfo);
                    column.Item().PaddingTop(4).Border(1).BorderColor(Colors.LightBorder)
                        .Background(Colors.Light).Padding(8).Column(col =>
                        {
                            col.Item().Text(rule.MetricName.Replace("Rule: ", "")).FontSize(10).Bold().FontColor(QuestPDF.Helpers.Colors.Black);
                            col.Item().PaddingTop(3).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Tickets: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span(GetValue(info, "tickets_affected")).FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Revenue per Ticket: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "revenue_per_ticket")} RSD").FontSize(9).SemiBold();
                                    });
                                });
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Price Change: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "avg_price_change_pct")}%").FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Rank: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"#{GetValue(info, "rule_rank")}").FontSize(9).SemiBold().FontColor(Colors.Warning);
                                    });
                                });
                            });
                        });
                }
            }
        }

        private void ComposeSpecialOffersSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Offer").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Revenue").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Unit").SemiBold();
                });

                foreach (var result in results)
                {
                    table.Cell().Element(CellStyle).Text(result.MetricName.Replace("Offer: ", ""));
                    table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}").SemiBold().FontColor(Colors.Success);
                    table.Cell().Element(CellStyle).Text(result.MetricUnit);
                }
            });

            foreach (var offer in results)
            {
                if (offer.AdditionalInfo != null)
                {
                    var info = ParseJsonInfo(offer.AdditionalInfo);
                    column.Item().PaddingTop(4).Border(1).BorderColor(Colors.LightBorder)
                        .Background(Colors.Light).Padding(8).Column(col =>
                        {
                            col.Item().Text(offer.MetricName.Replace("Offer: ", "")).FontSize(10).Bold().FontColor(QuestPDF.Helpers.Colors.Black);
                            col.Item().PaddingTop(3).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Tickets Sold: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span(GetValue(info, "tickets_sold")).FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Discount: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "discount_value")}%").FontSize(9).SemiBold().FontColor(Colors.Danger);
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Price: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "avg_ticket_price")} RSD").FontSize(9).SemiBold();
                                    });
                                });
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Sales Count: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span(GetValue(info, "sales_count")).FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Total Discount: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "total_discount_given")} RSD").FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("ROI: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "roi")}%").FontSize(9).SemiBold().FontColor(Colors.Success);
                                    });
                                });
                            });
                        });
                }
            }
        }

        private void ComposeTrendSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1).BorderColor(Colors.LightBorder).Padding(10).Column(col =>
                {
                    col.Item().Text(result.MetricName).FontSize(10).SemiBold().FontColor(Colors.Primary);
                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.AutoItem().Text($"{result.MetricValue:N2}").FontSize(14).Bold().FontColor(Colors.Secondary);
                        row.AutoItem().PaddingLeft(5).Text(result.MetricUnit).FontSize(10).FontColor(Colors.TextSecondary);
                    });

                    if (result.AdditionalInfo != null)
                    {
                        var info = ParseJsonInfo(result.AdditionalInfo);
                        col.Item().PaddingTop(8).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text(t =>
                                {
                                    t.Span("Std. Dev: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span(GetValue(info, "stddev")).FontSize(9).SemiBold();
                                });
                                c.Item().Text(t =>
                                {
                                    t.Span("Peak: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span(GetValue(info, "peak")).FontSize(9).SemiBold().FontColor(Colors.Success);
                                });
                            });
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text(t =>
                                {
                                    t.Span("Min: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span(GetValue(info, "min")).FontSize(9).SemiBold();
                                });
                                c.Item().Text(t =>
                                {
                                    t.Span("Avg. Daily Revenue: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span($"{GetValue(info, "avg_revenue_per_day")} RSD").FontSize(9).SemiBold();
                                });
                            });
                        });
                    }
                });
            }
        }

        private void ComposeEventsSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Event").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Revenue").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Unit").SemiBold();
                });

                foreach (var result in results)
                {
                    table.Cell().Element(CellStyle).Text(result.MetricName.Replace("Event: ", ""));
                    table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}").SemiBold().FontColor(Colors.Success);
                    table.Cell().Element(CellStyle).Text(result.MetricUnit);
                }
            });

            foreach (var evt in results)
            {
                if (evt.AdditionalInfo != null)
                {
                    var info = ParseJsonInfo(evt.AdditionalInfo);
                    column.Item().PaddingTop(4).Border(1).BorderColor(Colors.LightBorder)
                        .Background(Colors.Light).Padding(8).Column(col =>
                        {
                            col.Item().Text(evt.MetricName.Replace("Event: ", "")).FontSize(10).Bold().FontColor(QuestPDF.Helpers.Colors.Black);
                            col.Item().PaddingTop(3).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Tickets Sold: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span(GetValue(info, "tickets_sold")).FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Revenue per Ticket: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "revenue_per_ticket")} RSD").FontSize(9).SemiBold();
                                    });
                                });
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Occupancy: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span($"{GetValue(info, "occupancy_rate")}%").FontSize(9).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Capacity: ").FontSize(8).FontColor(Colors.TextSecondary);
                                        t.Span(GetValue(info, "total_capacity")).FontSize(9).SemiBold();
                                    });
                                });
                            });
                        });
                }
            }
        }

        private void ComposeOptimizationSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1).BorderColor(Colors.Warning).Background("#fef3c7").Padding(12).Column(col =>
                {
                    col.Item().Text(result.MetricName).FontSize(10).SemiBold().FontColor(Colors.Primary);
                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.AutoItem().Text($"{result.MetricValue:N2}").FontSize(16).Bold().FontColor(Colors.Danger);
                        row.AutoItem().PaddingLeft(5).Text(result.MetricUnit).FontSize(11).FontColor(Colors.TextSecondary);
                    });

                    if (result.AdditionalInfo != null)
                    {
                        var info = ParseJsonInfo(result.AdditionalInfo);
                        col.Item().PaddingTop(8).Row(row =>
                        {
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text(t =>
                                {
                                    t.Span("Available Tickets: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span(GetValue(info, "available_tickets")).FontSize(9).SemiBold();
                                });
                                c.Item().Text(t =>
                                {
                                    t.Span("Sold: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span(GetValue(info, "sold_tickets")).FontSize(9).SemiBold();
                                });
                                c.Item().Text(t =>
                                {
                                    t.Span("Sell-through: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span($"{GetValue(info, "sell_through_rate")}%").FontSize(9).SemiBold().FontColor(Colors.Info);
                                });
                            });
                            row.RelativeItem().Column(c =>
                            {
                                c.Item().Text(t =>
                                {
                                    t.Span("Discounted: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span(GetValue(info, "discounted_tickets")).FontSize(9).SemiBold();
                                });
                                c.Item().Text(t =>
                                {
                                    t.Span("Avg. Discount Price: ").FontSize(8).FontColor(Colors.TextSecondary);
                                    t.Span($"{GetValue(info, "avg_discount_price")} RSD").FontSize(9).SemiBold();
                                });
                            });
                        });

                        var recommendation = GetValue(info, "recommendation");
                        if (!string.IsNullOrEmpty(recommendation))
                        {
                            col.Item().PaddingTop(8).Border(1).BorderColor(Colors.Warning)
                                .Background(QuestPDF.Helpers.Colors.White).Padding(8).Text(text =>
                                {
                                    text.Span("Recommendation: ").FontSize(9).SemiBold().FontColor(Colors.Warning);
                                    text.Span(recommendation).FontSize(9).FontColor(Colors.TextPrimary);
                                });
                        }
                    }
                });
            }
        }

        private void ComposeCursorStatsSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1).BorderColor(Colors.Info).Background("#cffafe").Padding(10).Column(col =>
                {
                    col.Item().Text(result.MetricName).FontSize(10).SemiBold().FontColor(Colors.Primary);
                    col.Item().PaddingTop(5).Row(row =>
                    {
                        row.AutoItem().Text($"{result.MetricValue:N0}").FontSize(14).Bold().FontColor(Colors.Info);
                        row.AutoItem().PaddingLeft(5).Text(result.MetricUnit).FontSize(10).FontColor(Colors.TextSecondary);
                    });

                    if (result.AdditionalInfo != null)
                    {
                        var info = ParseJsonInfo(result.AdditionalInfo);
                        col.Item().PaddingTop(6).Row(row =>
                        {
                            row.RelativeItem().Text(t =>
                            {
                                t.Span("Zones Processed: ").FontSize(8).FontColor(Colors.TextSecondary);
                                t.Span(GetValue(info, "zones_processed")).FontSize(9).SemiBold();
                            });
                            row.RelativeItem().Text(t =>
                            {
                                t.Span("Pricing Rules: ").FontSize(8).FontColor(Colors.TextSecondary);
                                t.Span(GetValue(info, "pricing_rules_processed")).FontSize(9).SemiBold();
                            });
                        });
                        col.Item().PaddingTop(3).Text(t =>
                        {
                            t.Span("Method: ").FontSize(8).FontColor(Colors.TextSecondary);
                            t.Span(GetValue(info, "cursor_method")).FontSize(9).Italic();
                        });
                    }
                });
            }
        }

        private void ComposeGenericTable(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            column.Item().Table(table =>
            {
                table.ColumnsDefinition(columns =>
                {
                    columns.RelativeColumn(3);
                    columns.RelativeColumn(2);
                    columns.RelativeColumn(1);
                });

                table.Header(header =>
                {
                    header.Cell().Element(HeaderCellStyle).Text("Metric").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Value").SemiBold();
                    header.Cell().Element(HeaderCellStyle).Text("Unit").SemiBold();
                });

                foreach (var result in results)
                {
                    table.Cell().Element(CellStyle).Text(result.MetricName);
                    table.Cell().Element(CellStyle).AlignRight().Text($"{result.MetricValue:N2}");
                    table.Cell().Element(CellStyle).Text(result.MetricUnit);
                }
            });
        }

        private void ComposeRecommendations(IContainer container, List<string> recommendations)
        {
            container.Column(column =>
            {
                column.Spacing(6);

                column.Item().Border(1).BorderColor(Colors.Warning).Background(Colors.Light)
                    .Padding(8).Text("RECOMMENDATIONS")
                    .FontSize(12)
                    .Bold()
                    .FontColor(Colors.Warning);

                column.Item().Border(1).BorderColor(Colors.Warning)
                    .Background("#fef3c7")
                    .Padding(10)
                    .Column(recColumn =>
                    {
                        recColumn.Spacing(5);
                        foreach (var recommendation in recommendations)
                        {
                            recColumn.Item().Row(row =>
                            {
                                row.ConstantItem(12).Text("•").FontColor(Colors.Warning).FontSize(12).Bold();
                                row.RelativeItem().PaddingLeft(5).Text(recommendation).FontSize(9).FontColor(Colors.TextPrimary);
                            });
                        }
                    });
            });
        }

        // Helper Methods
        private IContainer HeaderCellStyle(IContainer container)
        {
            return container
                .Border(1)
                .BorderColor(Colors.Primary)
                .Background(Colors.Primary)
                .Padding(6)
                .DefaultTextStyle(x => x.FontColor(QuestPDF.Helpers.Colors.White).FontSize(9));
        }

        private IContainer CellStyle(IContainer container)
        {
            return container
                .Border(1)
                .BorderColor(QuestPDF.Helpers.Colors.Grey.Lighten1)
                .Background(Colors.LightBorder)
                .Padding(6);
        }

        private Dictionary<string, string> ParseJsonInfo(JsonDocument jsonDoc)
        {
            var result = new Dictionary<string, string>();
            try
            {
                foreach (var property in jsonDoc.RootElement.EnumerateObject())
                {
                    result[property.Name] = property.Value.ToString();
                }
            }
            catch { }
            return result;
        }

        private string GetValue(Dictionary<string, string> info, string key)
        {
            return info.TryGetValue(key, out var value) ? value : "N/A";
        }

        private int GetSectionOrder(string sectionName)
        {
            return sectionName switch
            {
                "BASIC_METRICS" => 1,
                "ZONE_ANALYSIS" => 2,
                "PRICING_RULES_EFFICIENCY" => 3,
                "SPECIAL_OFFERS_PERFORMANCE" => 4,
                "TREND_ANALYSIS" => 5,
                "EVENT_COMPARISON" => 6,
                "REVENUE_OPTIMIZATION" => 7,
                "CURSOR_STATISTICS" => 8,
                _ => 99
            };
        }

        private string FormatSectionName(string sectionName)
        {
            return sectionName switch
            {
                "BASIC_METRICS" => "Basic Metrics",
                "ZONE_ANALYSIS" => "Zone Analysis",
                "PRICING_RULES_EFFICIENCY" => "Pricing Rules Efficiency",
                "SPECIAL_OFFERS_PERFORMANCE" => "Special Offers Performance",
                "TREND_ANALYSIS" => "Trend Analysis",
                "EVENT_COMPARISON" => "Event Comparison",
                "REVENUE_OPTIMIZATION" => "Revenue Optimization",
                "CURSOR_STATISTICS" => "Cursor Statistics",
                _ => sectionName
            };
        }
    }
}