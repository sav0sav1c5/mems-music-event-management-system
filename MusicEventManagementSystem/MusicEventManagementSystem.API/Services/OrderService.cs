using Microsoft.Extensions.Logging;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;
using System.Collections.Generic;
using System.Diagnostics;
using System.Reflection.Metadata;
using Document = QuestPDF.Fluent.Document;

namespace MusicEventManagementSystem.API.Services
{
    public class OrderService : IOrderService
    {
        private readonly ICartService _cartService;
        private readonly IRecordedSaleProxyService _recordedSaleService;
        private readonly ITicketProxyService _ticketService;
        private readonly ITicketTypeProxyService _ticketTypeService;
        private readonly IZoneProxyService _zoneService;
        private readonly IEventProxyService _eventService;
        private readonly ILogger<OrderService> _logger;

        public OrderService(
            ICartService cartService,
            IRecordedSaleProxyService recordedSaleService,
            ITicketProxyService ticketService,
            ITicketTypeProxyService ticketTypeService,
            IZoneProxyService zoneService,
            IEventProxyService eventService,
            ILogger<OrderService> logger)
        {
            _cartService = cartService;
            _recordedSaleService = recordedSaleService;
            _ticketService = ticketService;
            _ticketTypeService = ticketTypeService;
            _zoneService = zoneService;
            _eventService = eventService;
            _logger = logger;
        }

        // OrderService.cs - DODAJTE KREIRANJE TICKETOVA
        public async Task<CheckoutResponseDto> CheckoutAsync(string userId, CheckoutRequestDto checkoutRequest)
        {
            // Koristite cart items iz request-a
            if (!checkoutRequest.CartItems.Any())
            {
                throw new InvalidOperationException("Cart is empty");
            }

            var createdTickets = new List<OrderTicketDto>();
            var ticketIds = new List<int>();

            try
            {
                // Step 1: Reserve tickets first
                foreach (var item in checkoutRequest.CartItems)
                {
                    Console.WriteLine($"🔒 Reserving {item.Quantity}x TicketType {item.TicketTypeId} ({item.TicketTypeName})");
                    var reserved = await _ticketTypeService.ReserveTicketsAsync(item.TicketTypeId, item.Quantity);
                    if (!reserved)
                    {
                        throw new InvalidOperationException($"Failed to reserve tickets for {item.TicketTypeName}");
                    }
                    Console.WriteLine($"✅ Reserved {item.Quantity}x TicketType {item.TicketTypeId}");
                }

                // Step 2: CREATE ACTUAL TICKETS
                Console.WriteLine("=== STEP 2: Creating actual tickets ===");
                foreach (var item in checkoutRequest.CartItems)
                {
                    Console.WriteLine($"🎫 Creating {item.Quantity} tickets for TicketType {item.TicketTypeId}");

                    for (int i = 0; i < item.Quantity; i++)
                    {
                        var ticketCreateDto = new TicketCreateDto
                        {
                            IssueDate = DateTime.UtcNow,
                            FinalPrice = item.UnitPrice,
                            Status = TicketStatus.Reserved,
                            TicketTypeId = item.TicketTypeId,
                            RecordedSaleId = null // Set later
                        };

                        var createdTicket = await _ticketService.CreateTicketAsync(ticketCreateDto);
                        ticketIds.Add(createdTicket.TicketId);

                        Console.WriteLine($"✅ Created Ticket ID: {createdTicket.TicketId}");

                        // Build response DTO
                        var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(item.TicketTypeId);
                        var zone = ticketType != null ? await _zoneService.GetZoneByIdAsync(ticketType.ZoneId) : null;
                        var evt = ticketType != null ? await _eventService.GetEventByIdAsync(ticketType.EventId) : null;

                        createdTickets.Add(new OrderTicketDto
                        {
                            TicketId = createdTicket.TicketId,
                            UniqueCode = createdTicket.UniqueCode,
                            QrCode = createdTicket.QrCode,
                            EventName = evt?.Name,
                            TicketTypeName = ticketType?.Name,
                            ZoneName = zone?.Name,
                            EventStartDate = evt?.StartDate ?? DateTime.MinValue,
                            Price = createdTicket.FinalPrice,
                            Status = createdTicket.Status.ToString()
                        });
                    }
                }

                Console.WriteLine($"🎯 Created {ticketIds.Count} tickets total: {string.Join(", ", ticketIds)}");

                // Step 3: Create RecordedSale WITH ticket IDs
                Console.WriteLine("=== STEP 3: Creating RecordedSale ===");
                var totalAmount = checkoutRequest.CartItems.Sum(item => item.Subtotal);

                var recordedSaleDto = new RecordedSaleCreateDto
                {
                    TotalAmount = totalAmount,
                    SaleDate = DateTime.UtcNow,
                    TransactionStatus = TransactionStatus.Pending,
                    PaymentMethod = checkoutRequest.PaymentMethod,
                    ApplicationUserId = checkoutRequest.ApplicationUserId,
                    TicketIds = ticketIds // SADA ĆE BITI POPUNJENA
                };

                Console.WriteLine($"📦 RecordedSaleDto:");
                Console.WriteLine($"   TotalAmount: {recordedSaleDto.TotalAmount}");
                Console.WriteLine($"   TicketIds: {string.Join(", ", recordedSaleDto.TicketIds)}");
                Console.WriteLine($"   TicketIds Count: {recordedSaleDto.TicketIds.Count}");

                var recordedSale = await _recordedSaleService.CreateRecordedSaleAsync(recordedSaleDto);
                Console.WriteLine($"✅ Created RecordedSale ID: {recordedSale.RecordedSaleId}");

                // Step 4: Update tickets with RecordedSaleId
                Console.WriteLine("=== STEP 4: Updating tickets with RecordedSaleId ===");
                foreach (var ticketId in ticketIds)
                {
                    await _ticketService.UpdateTicketAsync(ticketId, new TicketUpdateDto
                    {
                        RecordedSaleId = recordedSale.RecordedSaleId,
                        Status = TicketStatus.Sold
                    });
                    Console.WriteLine($"✅ Updated Ticket {ticketId} with RecordedSaleId");
                }

                // Step 5: Update RecordedSale status
                await _recordedSaleService.UpdateRecordedSaleAsync(
                    recordedSale.RecordedSaleId,
                    new RecordedSaleUpdateDto
                    {
                        TransactionStatus = TransactionStatus.Completed
                    });

                // Clear cart
                await _cartService.ClearCartAsync(userId);

                return new CheckoutResponseDto
                {
                    OrderId = recordedSale.RecordedSaleId,
                    OrderNumber = $"ORD-{recordedSale.RecordedSaleId:D8}",
                    TotalAmount = recordedSale.TotalAmount,
                    OrderDate = recordedSale.SaleDate,
                    Status = TransactionStatus.Completed.ToString(),
                    Tickets = createdTickets
                };
            }
            catch (Exception ex)
            {
                Console.WriteLine($"❌ Checkout failed: {ex.Message}");

                // Rollback: release reserved tickets
                foreach (var item in checkoutRequest.CartItems)
                {
                    await _ticketTypeService.ReleaseTicketsAsync(item.TicketTypeId, item.Quantity);
                }

                // Rollback: delete created tickets if any
                foreach (var ticketId in ticketIds)
                {
                    try
                    {
                        await _ticketService.DeleteTicketAsync(ticketId);
                    }
                    catch
                    {
                        // Ignore deletion errors during rollback
                    }
                }

                throw;
            }
        }

        public async Task<IEnumerable<OrderDto>> GetUserOrdersAsync(string userId)
        {
            var sales = await _recordedSaleService.GetSalesByUserAsync(userId);
            var orders = new List<OrderDto>();

            foreach (var sale in sales)
            {
                var orderItems = new List<OrderItemDto>();

                // Get all tickets for this sale
                if (sale.TicketIds != null && sale.TicketIds.Any())
                {
                    var ticketsByType = new Dictionary<int, List<TicketResponseDto>>();

                    foreach (var ticketId in sale.TicketIds)
                    {
                        var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
                        if (ticket != null)
                        {
                            if (!ticketsByType.ContainsKey(ticket.TicketTypeId))
                            {
                                ticketsByType[ticket.TicketTypeId] = new List<TicketResponseDto>();
                            }
                            ticketsByType[ticket.TicketTypeId].Add(ticket);
                        }
                    }

                    // Build order items
                    foreach (var group in ticketsByType)
                    {
                        var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(group.Key);
                        var evt = ticketType != null
                            ? await _eventService.GetEventByIdAsync(ticketType.EventId)
                            : null;

                        var tickets = group.Value;
                        var unitPrice = tickets.FirstOrDefault()?.FinalPrice ?? 0;

                        orderItems.Add(new OrderItemDto
                        {
                            EventName = evt?.Name,
                            TicketTypeName = ticketType?.Name,
                            Quantity = tickets.Count,
                            UnitPrice = unitPrice,
                            Subtotal = unitPrice * tickets.Count
                        });
                    }
                }

                orders.Add(new OrderDto
                {
                    OrderId = sale.RecordedSaleId,
                    OrderNumber = $"ORD-{sale.RecordedSaleId:D8}",
                    OrderDate = sale.SaleDate,
                    TotalAmount = sale.TotalAmount,
                    Status = sale.TransactionStatus.ToString(),
                    PaymentMethod = sale.PaymentMethod.ToString(),
                    TotalTickets = sale.TicketIds?.Count ?? 0,
                    Items = orderItems
                });
            }

            return orders.OrderByDescending(o => o.OrderDate);
        }

        public async Task<OrderDetailsDto?> GetOrderDetailsAsync(int orderId, string userId)
        {
            var sale = await _recordedSaleService.GetRecordedSaleByIdAsync(orderId);

            if (sale == null || sale.ApplicationUserId != userId)
            {
                return null;
            }

            var tickets = new List<OrderTicketDto>();

            if (sale.TicketIds != null)
            {
                foreach (var ticketId in sale.TicketIds)
                {
                    var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
                    if (ticket != null)
                    {
                        var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(ticket.TicketTypeId);
                        var zone = ticketType != null
                            ? await _zoneService.GetZoneByIdAsync(ticketType.ZoneId)
                            : null;
                        var evt = ticketType != null
                            ? await _eventService.GetEventByIdAsync(ticketType.EventId)
                            : null;

                        tickets.Add(new OrderTicketDto
                        {
                            TicketId = ticket.TicketId,
                            UniqueCode = ticket.UniqueCode,
                            QrCode = ticket.QrCode,
                            EventName = evt?.Name,
                            TicketTypeName = ticketType?.Name,
                            ZoneName = zone?.Name,
                            EventStartDate = evt?.StartDate ?? DateTime.MinValue,
                            Price = ticket.FinalPrice,
                            Status = ticket.Status.ToString()
                        });
                    }
                }
            }

            return new OrderDetailsDto
            {
                OrderId = sale.RecordedSaleId,
                OrderNumber = $"ORD-{sale.RecordedSaleId:D8}",
                OrderDate = sale.SaleDate,
                TotalAmount = sale.TotalAmount,
                Status = sale.TransactionStatus.ToString(),
                PaymentMethod = sale.PaymentMethod.ToString(),
                Tickets = tickets,
                AppliedOffers = new List<AppliedOfferDto>()
            };
        }

        public async Task<bool> CancelOrderAsync(int orderId, string userId)
        {
            var sale = await _recordedSaleService.GetRecordedSaleByIdAsync(orderId);

            if (sale == null || sale.ApplicationUserId != userId)
            {
                return false;
            }

            // Check if order can be cancelled (not already cancelled or completed long ago)
            if (sale.TransactionStatus == TransactionStatus.Cancelled)
            {
                return false;
            }

            // Cancel all tickets
            if (sale.TicketIds != null)
            {
                foreach (var ticketId in sale.TicketIds)
                {
                    await _ticketService.CancelTicketAsync(ticketId);
                }
            }

            // Update sale status
            await _recordedSaleService.UpdateRecordedSaleAsync(orderId, new RecordedSaleUpdateDto
            {
                TransactionStatus = TransactionStatus.Cancelled
            });

            return true;
        }

        public async Task<OrderTicketDto?> GetTicketDetailsAsync(int ticketId, string userId)
        {
            var ticket = await _ticketService.GetTicketByIdAsync(ticketId);
            if (ticket == null)
            {
                return null;
            }

            // Verify user owns this ticket
            if (ticket.RecordedSaleId.HasValue)
            {
                var sale = await _recordedSaleService.GetRecordedSaleByIdAsync(ticket.RecordedSaleId.Value);
                if (sale == null || sale.ApplicationUserId != userId)
                {
                    return null;
                }
            }

            var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(ticket.TicketTypeId);
            var zone = ticketType != null
                ? await _zoneService.GetZoneByIdAsync(ticketType.ZoneId)
                : null;
            var evt = ticketType != null
                ? await _eventService.GetEventByIdAsync(ticketType.EventId)
                : null;

            return new OrderTicketDto
            {
                TicketId = ticket.TicketId,
                UniqueCode = ticket.UniqueCode,
                QrCode = ticket.QrCode,
                EventName = evt?.Name,
                TicketTypeName = ticketType?.Name,
                ZoneName = zone?.Name,
                EventStartDate = evt?.StartDate ?? DateTime.MinValue,
                Price = ticket.FinalPrice,
                Status = ticket.Status.ToString()
            };
        }

        public async Task<byte[]> GenerateTicketPdfAsync(int ticketId, string userId)
        {
            var ticket = await GetTicketDetailsAsync(ticketId, userId);

            if (ticket == null)
            {
                throw new InvalidOperationException("Ticket not found");
            }

            QuestPDF.Settings.License = LicenseType.Community;

            byte[] logoBytes;
            try
            {
                var logoPath = Path.Combine(Directory.GetCurrentDirectory(), "wwwroot", "images", "TicketLogo.png");
                logoBytes = await File.ReadAllBytesAsync(logoPath);
            }
            catch
            {
                logoBytes = null;
            }

            var limeGreen = "#9ACD32";
            var darkBg = "#1a1a1a";
            var lightGray = "#e5e5e5";

            var document = Document.Create(container =>
            {
                container.Page(page =>
                {
                    page.Size(PageSizes.A6);
                    page.Margin(0);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(9).FontColor(Colors.Black));

                    // HEADER
                    page.Header()
                        .Height(90)
                        .Background(darkBg)
                        .Padding(15)
                        .Row(row =>
                        {
                            // Leva strana - MEMS branding
                            row.RelativeItem()
                                .AlignLeft()
                                .AlignMiddle()
                                .Column(column =>
                                {
                                    column.Item().Text("MEMS")
                                        .FontSize(24) // 16pt → 28pt
                                        .Bold()
                                        .FontColor(limeGreen);
                                    column.Item().Text("Event Ticket")
                                        .FontSize(12) // 8pt → 14pt
                                        .FontColor(Colors.Grey.Lighten2);
                                });

                            // Desna strana - Logo
                            if (logoBytes != null)
                            {
                                row.ConstantItem(60)
                                    .AlignRight()
                                    .AlignMiddle()
                                    .Width(50)
                                    .Height(50)
                                    .Image(logoBytes);
                            }
                            else
                            {
                                // Fallback placeholder
                                row.ConstantItem(70)
                                    .AlignRight()
                                    .AlignMiddle()
                                    .Width(60)
                                    .Height(60)
                                    .Background(limeGreen)
                                    .AlignCenter()
                                    .AlignMiddle()
                                    .Text("MEMS")
                                    .FontSize(10)
                                    .Bold()
                                    .FontColor(Colors.White);
                            }
                        });

                    // CONTENT
                    page.Content()
                        .PaddingHorizontal(35)
                        .PaddingVertical(10)
                        .Column(column =>
                        {
                            column.Spacing(6);

                            // Event Name
                            column.Item()
                                .BorderBottom(1f)
                                .BorderColor(limeGreen)
                                .PaddingBottom(6)
                                .Column(col =>
                                {
                                    col.Item().Text("Event Name:")
                                        .FontSize(8)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"{ticket.EventName}")
                                        .FontSize(13)
                                        .Bold()
                                        .FontColor(Colors.Black);
                                });

                            // Ticket Type i Zone
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Ticket Type:")
                                        .FontSize(7)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"{ticket.TicketTypeName}")
                                        .FontSize(9)
                                        .SemiBold();
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Zone:")
                                        .FontSize(7)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"{ticket.ZoneName}")
                                        .FontSize(9)
                                        .SemiBold();
                                });
                            });

                            // Start Date i Start Time
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Start Date:")
                                        .FontSize(7)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"{ticket.EventStartDate:dd.MM.yyyy}")
                                        .FontSize(9)
                                        .SemiBold();
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Start Time:")
                                        .FontSize(7)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"{ticket.EventStartDate:HH:mm}")
                                        .FontSize(9)
                                        .SemiBold();
                                });
                            });

                            // Separator
                            column.Item().PaddingVertical(6).LineHorizontal(1).LineColor(lightGray);

                            // Ticket ID and Unique Code
                            column.Item().Row(row =>
                            {
                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Ticket ID:")
                                        .FontSize(7)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"#{ticket.TicketId}")
                                        .FontSize(9)
                                        .SemiBold();
                                });

                                row.RelativeItem().Column(col =>
                                {
                                    col.Item().Text("Unique Code:")
                                        .FontSize(7)
                                        .FontColor(Colors.Grey.Darken1);
                                    col.Item().Text($"{ticket.UniqueCode}")
                                        .FontSize(8)
                                        .FontFamily("Courier New");
                                });
                            });

                            // Ticket Price
                            column.Item()
                                .PaddingTop(4)
                                .AlignCenter()
                                .Row(row =>
                                {
                                    row.AutoItem().AlignRight().AlignMiddle().Text("Ticket Price:")
                                        .FontSize(9)
                                        .FontColor(Colors.Grey.Darken1);

                                    row.ConstantItem(10); // Razmak između teksta i cene

                                    row.AutoItem().AlignLeft().AlignMiddle().Text($"{ticket.Price:C}")
                                        .FontSize(16)
                                        .Bold()
                                        .FontColor(limeGreen);
                                });

                            // QR Code - malo smanjen da stane sa novim paddingom
                            column.Item().PaddingTop(5).AlignCenter().Element(qrContainer =>
                            {
                                if (!string.IsNullOrEmpty(ticket.QrCode))
                                {
                                    try
                                    {
                                        var qrBytes = Convert.FromBase64String(ticket.QrCode);
                                        qrContainer.Width(100).Height(100).Image(qrBytes);
                                    }
                                    catch
                                    {
                                        qrContainer.Width(85).Height(85)
                                            .Border(1)
                                            .BorderColor(Colors.Grey.Lighten1)
                                            .AlignCenter()
                                            .AlignMiddle()
                                            .Text("QR CODE")
                                            .FontSize(8);
                                    }
                                }
                                else
                                {
                                    qrContainer.Width(85).Height(85)
                                        .Border(1)
                                        .BorderColor(Colors.Grey.Lighten1)
                                        .AlignCenter()
                                        .AlignMiddle()
                                        .Text("QR CODE")
                                        .FontSize(8);
                                }
                            });
                        });

                    // FOOTER
                    page.Footer()
                        .Height(40)
                        .Background(darkBg)
                        .Padding(8)
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
                                .FontColor(limeGreen);
                        });
                });
            });

            return document.GeneratePdf();
        }
    }
}
