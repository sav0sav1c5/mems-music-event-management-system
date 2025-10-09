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
        private readonly string _limeGreen = "#9ACD32";
        private readonly string _darkBg = "#1a1a1a";
        private readonly string _lightGray = "#e5e5e5";
        private readonly string _mediumGray = "#6b7280";

        public byte[] GenerateSalesAnalysisPdf(AnalysisReport report)
        {
            QuestPDF.Settings.License = LicenseType.Community;

            byte[] logoBytes;
            try
            {
                var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "TicketLogo.png");
                logoBytes = File.ReadAllBytes(logoPath);
            }
            catch
            {
                logoBytes = null;
            }

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A4);
                    page.Margin(0);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Black));

                    page.Header().Element(c => ComposeHeader(c, logoBytes));
                    page.Content().Element(content => ComposeContent(content, report));
                    page.Footer().Element(ComposeFooter);
                });
            });

            return document.GeneratePdf();
        }

        private void ComposeHeader(IContainer container, byte[] logoBytes)
        {
            container.Height(100)
                .Background(_darkBg)
                .Padding(15)
                .Row(row =>
                {
                    row.RelativeItem()
                        .AlignLeft()
                        .AlignMiddle()
                        .Column(column =>
                        {
                            column.Item().Text("MEMS")
                                .FontSize(28)
                                .Bold()
                                .FontColor(_limeGreen);
                            column.Item().Text("Sales Analysis Report")
                                .FontSize(14)
                                .FontColor(Colors.Grey.Lighten2);
                        });

                    if (logoBytes != null)
                    {
                        row.ConstantItem(65)
                            .AlignRight()
                            .AlignMiddle()
                            .Width(60)
                            .Height(60)
                            .Image(logoBytes);
                    }
                    else
                    {
                        row.ConstantItem(65)
                            .AlignRight()
                            .AlignMiddle()
                            .Width(60)
                            .Height(60)
                            .Background(_limeGreen)
                            .AlignCenter()
                            .AlignMiddle()
                            .Text("MEMS")
                            .FontSize(14)
                            .Bold()
                            .FontColor(Colors.White);
                    }
                });
        }

        private void ComposeFooter(IContainer container)
        {
            container.Height(40)
                .Background(_darkBg)
                .Padding(10)
                .AlignCenter()
                .AlignMiddle()
                .Column(column =>
                {
                    column.Spacing(3);

                    column.Item().AlignCenter().Text("Generated:")
                        .FontSize(7)
                        .FontColor(Colors.Grey.Lighten2);

                    column.Item().AlignCenter().Text($"{DateTime.Now:dd.MM.yyyy HH:mm}")
                        .FontSize(7)
                        .FontColor(_limeGreen);
                });
        }

        private void ComposeContent(IContainer container, AnalysisReport report)
        {
            container.PaddingVertical(20)
                .PaddingHorizontal(25)
                .Column(column =>
                {
                    column.Spacing(15);

                    column.Item().Element(c => ComposeReportInfo(c, report));
                    column.Item().Element(c => ComposeSummary(c, report));

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
            container.BorderBottom(2)
                .BorderColor(_limeGreen)
                .PaddingBottom(10)
                .Column(column =>
                {
                    column.Item().Row(row =>
                    {
                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Report Period:")
                                .FontSize(8)
                                .FontColor(_mediumGray);
                            col.Item().Text($"{report.StartDate:dd.MM.yyyy} - {report.EndDate:dd.MM.yyyy}")
                                .FontSize(10)
                                .SemiBold();
                        });

                        row.RelativeItem().Column(col =>
                        {
                            col.Item().Text("Generated:")
                                .FontSize(8)
                                .FontColor(_mediumGray);
                            col.Item().Text($"{report.GeneratedAt:dd.MM.yyyy HH:mm}")
                                .FontSize(10)
                                .SemiBold();
                        });

                        if (report.EventId.HasValue)
                        {
                            row.RelativeItem().Column(col =>
                            {
                                col.Item().Text("Event ID:")
                                    .FontSize(8)
                                    .FontColor(_mediumGray);
                                col.Item().Text($"{report.EventId.Value}")
                                    .FontSize(10)
                                    .SemiBold();
                            });
                        }
                    });
                });
        }

        private void ComposeSummary(IContainer container, AnalysisReport report)
        {
            var summary = report.Summary;
            var sections = report.Sections;

            container.Column(column =>
            {
                column.Spacing(10);

                column.Item().Text("Summary Overview")
                    .FontSize(14)
                    .Bold()
                    .FontColor(_limeGreen);

                var basicMetrics = sections.ContainsKey("BASIC_METRICS")
                    ? sections["BASIC_METRICS"]
                    : new List<SalesAnalysisResult>();

                var totalRevenueMetric = basicMetrics.FirstOrDefault(m => m.MetricName == "Total Revenue");
                var ticketsSoldMetric = basicMetrics.FirstOrDefault(m => m.MetricName == "Total Tickets Sold");
                var avgPriceMetric = basicMetrics.FirstOrDefault(m => m.MetricName == "Average Ticket Price");

                column.Item().PaddingTop(8).Row(row =>
                {
                    row.Spacing(10);

                    row.RelativeItem().Border(1)
                        .BorderColor(_lightGray)
                        .Padding(12)
                        .Column(col =>
                        {
                            col.Item().Text("Total Revenue")
                                .FontSize(8)
                                .FontColor(_mediumGray);
                            col.Item().PaddingTop(5).Text($"{(totalRevenueMetric?.MetricValue ?? 0):N2} RSD")
                                .FontSize(14)
                                .Bold()
                                .FontColor(_limeGreen);
                        });

                    row.RelativeItem().Border(1)
                        .BorderColor(_lightGray)
                        .Padding(12)
                        .Column(col =>
                        {
                            col.Item().Text("Tickets Sold")
                                .FontSize(8)
                                .FontColor(_mediumGray);
                            col.Item().PaddingTop(5).Text($"{(ticketsSoldMetric?.MetricValue ?? 0):N0}")
                                .FontSize(14)
                                .Bold()
                                .FontColor(_limeGreen);
                        });

                    row.RelativeItem().Border(1)
                        .BorderColor(_lightGray)
                        .Padding(12)
                        .Column(col =>
                        {
                            col.Item().Text("Average Price")
                                .FontSize(8)
                                .FontColor(_mediumGray);
                            col.Item().PaddingTop(5).Text($"{(avgPriceMetric?.MetricValue ?? 0):N2} RSD")
                                .FontSize(14)
                                .Bold()
                                .FontColor(_limeGreen);
                        });
                });

                if (!string.IsNullOrEmpty(summary.TopPerformingZone) || !string.IsNullOrEmpty(summary.TopPerformingOffer))
                {
                    column.Item().PaddingTop(10).Row(row =>
                    {
                        row.Spacing(10);

                        if (!string.IsNullOrEmpty(summary.TopPerformingZone))
                        {
                            row.RelativeItem().Border(1)
                                .BorderColor(_limeGreen)
                                .Background(_lightGray)
                                .Padding(10)
                                .Column(col =>
                                {
                                    col.Item().Text("Top Performing Zone")
                                        .FontSize(7)
                                        .FontColor(_mediumGray);
                                    col.Item().PaddingTop(3).Text(summary.TopPerformingZone)
                                        .FontSize(10)
                                        .SemiBold()
                                        .FontColor(_limeGreen);
                                });
                        }

                        if (!string.IsNullOrEmpty(summary.TopPerformingOffer))
                        {
                            row.RelativeItem().Border(1)
                                .BorderColor(_limeGreen)
                                .Background(_lightGray)
                                .Padding(10)
                                .Column(col =>
                                {
                                    col.Item().Text("Top Performing Offer")
                                        .FontSize(7)
                                        .FontColor(_mediumGray);
                                    col.Item().PaddingTop(3).Text(summary.TopPerformingOffer)
                                        .FontSize(10)
                                        .SemiBold()
                                        .FontColor(_limeGreen);
                                });
                        }
                    });
                }
            });
        }

        private void ComposeSection(IContainer container, string sectionName, List<SalesAnalysisResult> results)
        {
            if (!results.Any()) return;

            container.Column(column =>
            {
                column.Spacing(10);

                column.Item()
                    .BorderBottom(1.5f)
                    .BorderColor(_limeGreen)
                    .PaddingBottom(8)
                    .Text(FormatSectionName(sectionName))
                    .FontSize(13)
                    .Bold()
                    .FontColor(Colors.Black);

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
            foreach (var result in results)
            {
                column.Item().PaddingVertical(3).Row(row =>
                {
                    row.RelativeItem().Text(result.MetricName)
                        .FontSize(9)
                        .FontColor(_mediumGray);

                    row.RelativeItem().AlignRight().Text($"{result.MetricValue:N2} {result.MetricUnit}")
                        .FontSize(9)
                        .SemiBold();
                });

                column.Item().LineHorizontal(0.5f).LineColor(_lightGray);
            }
        }

        private void ComposeZonesSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_lightGray)
                    .Padding(10)
                    .Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text(result.MetricName.Replace("Zone: ", ""))
                                .FontSize(10)
                                .SemiBold();

                            row.AutoItem().Text($"{result.MetricValue:N2} {result.MetricUnit}")
                                .FontSize(10)
                                .Bold()
                                .FontColor(_limeGreen);
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
                                        t.Span("Tickets Sold: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "tickets_sold")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Price: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "avg_price")} RSD").FontSize(8).SemiBold();
                                    });
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Base Price: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "base_price")} RSD").FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Occupancy: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "occupancy_rate")}%").FontSize(8).SemiBold();
                                    });
                                });
                            });
                        }
                    });
            }
        }

        private void ComposePricingRulesSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_lightGray)
                    .Padding(10)
                    .Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text(result.MetricName.Replace("Rule: ", ""))
                                .FontSize(10)
                                .SemiBold();

                            row.AutoItem().Text($"{result.MetricValue:N2} {result.MetricUnit}")
                                .FontSize(10)
                                .Bold()
                                .FontColor(_limeGreen);
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
                                        t.Span("Tickets: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "tickets_affected")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Rev/Ticket: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "revenue_per_ticket")} RSD").FontSize(8).SemiBold();
                                    });
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Change: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "avg_price_change_pct")}%").FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Rank: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"#{GetValue(info, "rule_rank")}").FontSize(8).SemiBold();
                                    });
                                });
                            });
                        }
                    });
            }
        }

        private void ComposeSpecialOffersSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_lightGray)
                    .Padding(10)
                    .Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text(result.MetricName.Replace("Offer: ", ""))
                                .FontSize(10)
                                .SemiBold();

                            row.AutoItem().Text($"{result.MetricValue:N2} {result.MetricUnit}")
                                .FontSize(10)
                                .Bold()
                                .FontColor(_limeGreen);
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
                                        t.Span("Tickets: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "tickets_sold")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Discount: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "discount_value")}%").FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Price: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "avg_ticket_price")} RSD").FontSize(8).SemiBold();
                                    });
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Sales: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "sales_count")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Total Discount: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "total_discount_given")} RSD").FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("ROI: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "roi")}%").FontSize(8).SemiBold();
                                    });
                                });
                            });
                        }
                    });
            }
        }

        private void ComposeTrendSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_lightGray)
                    .Padding(10)
                    .Column(col =>
                    {
                        col.Item().Text(result.MetricName)
                            .FontSize(10)
                            .SemiBold();

                        col.Item().PaddingTop(5).Text($"{result.MetricValue:N2} {result.MetricUnit}")
                            .FontSize(13)
                            .Bold()
                            .FontColor(_limeGreen);

                        if (result.AdditionalInfo != null)
                        {
                            var info = ParseJsonInfo(result.AdditionalInfo);
                            col.Item().PaddingTop(8).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Std. Dev: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "stddev")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Peak: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "peak")).FontSize(8).SemiBold();
                                    });
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Min: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "min")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Daily: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "avg_revenue_per_day")} RSD").FontSize(8).SemiBold();
                                    });
                                });
                            });
                        }
                    });
            }
        }

        private void ComposeEventsSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_lightGray)
                    .Padding(10)
                    .Column(col =>
                    {
                        col.Item().Row(row =>
                        {
                            row.RelativeItem().Text(result.MetricName.Replace("Event: ", ""))
                                .FontSize(10)
                                .SemiBold();

                            row.AutoItem().Text($"{result.MetricValue:N2} {result.MetricUnit}")
                                .FontSize(10)
                                .Bold()
                                .FontColor(_limeGreen);
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
                                        t.Span("Tickets: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "tickets_sold")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Rev/Ticket: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "revenue_per_ticket")} RSD").FontSize(8).SemiBold();
                                    });
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Occupancy: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "occupancy_rate")}%").FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Capacity: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "total_capacity")).FontSize(8).SemiBold();
                                    });
                                });
                            });
                        }
                    });
            }
        }

        private void ComposeOptimizationSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_limeGreen)
                    .Background(_lightGray)
                    .Padding(12)
                    .Column(col =>
                    {
                        col.Item().Text(result.MetricName)
                            .FontSize(10)
                            .SemiBold();

                        col.Item().PaddingTop(5).Text($"{result.MetricValue:N2} {result.MetricUnit}")
                            .FontSize(14)
                            .Bold()
                            .FontColor(_limeGreen);

                        if (result.AdditionalInfo != null)
                        {
                            var info = ParseJsonInfo(result.AdditionalInfo);
                            col.Item().PaddingTop(8).Row(row =>
                            {
                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Available: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "available_tickets")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Sold: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "sold_tickets")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Sell-through: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "sell_through_rate")}%").FontSize(8).SemiBold();
                                    });
                                });

                                row.RelativeItem().Column(c =>
                                {
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Discounted: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span(GetValue(info, "discounted_tickets")).FontSize(8).SemiBold();
                                    });
                                    c.Item().Text(t =>
                                    {
                                        t.Span("Avg. Discount Price: ").FontSize(7).FontColor(_mediumGray);
                                        t.Span($"{GetValue(info, "avg_discount_price")} RSD").FontSize(8).SemiBold();
                                    });
                                });
                            });

                            var recommendation = GetValue(info, "recommendation");
                            if (!string.IsNullOrEmpty(recommendation) && recommendation != "N/A")
                            {
                                col.Item().PaddingTop(8).Border(1)
                                    .BorderColor(_limeGreen)
                                    .Background(Colors.White)
                                    .Padding(8)
                                    .Text(recommendation)
                                    .FontSize(8)
                                    .FontColor(Colors.Black);
                            }
                        }
                    });
            }
        }

        private void ComposeCursorStatsSection(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().Border(1)
                    .BorderColor(_lightGray)
                    .Padding(10)
                    .Column(col =>
                    {
                        col.Item().Text(result.MetricName)
                            .FontSize(10)
                            .SemiBold();

                        col.Item().PaddingTop(5).Text($"{result.MetricValue:N0} {result.MetricUnit}")
                            .FontSize(12)
                            .Bold()
                            .FontColor(_limeGreen);

                        if (result.AdditionalInfo != null)
                        {
                            var info = ParseJsonInfo(result.AdditionalInfo);
                            col.Item().PaddingTop(6).Row(row =>
                            {
                                row.RelativeItem().Text(t =>
                                {
                                    t.Span("Zones: ").FontSize(7).FontColor(_mediumGray);
                                    t.Span(GetValue(info, "zones_processed")).FontSize(8).SemiBold();
                                });

                                row.RelativeItem().Text(t =>
                                {
                                    t.Span("Rules: ").FontSize(7).FontColor(_mediumGray);
                                    t.Span(GetValue(info, "pricing_rules_processed")).FontSize(8).SemiBold();
                                });
                            });

                            col.Item().PaddingTop(3).Text(t =>
                            {
                                t.Span("Method: ").FontSize(7).FontColor(_mediumGray);
                                t.Span(GetValue(info, "cursor_method")).FontSize(8).Italic();
                            });
                        }
                    });
            }
        }

        private void ComposeGenericTable(ColumnDescriptor column, List<SalesAnalysisResult> results)
        {
            foreach (var result in results)
            {
                column.Item().PaddingVertical(3).Row(row =>
                {
                    row.RelativeItem().Text(result.MetricName)
                        .FontSize(9)
                        .FontColor(_mediumGray);

                    row.RelativeItem().AlignRight().Text($"{result.MetricValue:N2} {result.MetricUnit}")
                        .FontSize(9)
                        .SemiBold();
                });

                column.Item().LineHorizontal(0.5f).LineColor(_lightGray);
            }
        }

        private void ComposeRecommendations(IContainer container, List<string> recommendations)
        {
            container.Column(column =>
            {
                column.Spacing(8);

                column.Item()
                    .BorderBottom(1.5f)
                    .BorderColor(_limeGreen)
                    .PaddingBottom(8)
                    .Text("Recommendations")
                    .FontSize(13)
                    .Bold()
                    .FontColor(Colors.Black);

                column.Item().Border(1)
                    .BorderColor(_limeGreen)
                    .Background(_lightGray)
                    .Padding(12)
                    .Column(recColumn =>
                    {
                        recColumn.Spacing(6);
                        foreach (var recommendation in recommendations)
                        {
                            recColumn.Item().Row(row =>
                            {
                                row.ConstantItem(12).Text("•")
                                    .FontColor(_limeGreen)
                                    .FontSize(11)
                                    .Bold();
                                row.RelativeItem().PaddingLeft(5).Text(recommendation)
                                    .FontSize(9)
                                    .FontColor(Colors.Black);
                            });
                        }
                    });
            });
        }

        // Helper Methods
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