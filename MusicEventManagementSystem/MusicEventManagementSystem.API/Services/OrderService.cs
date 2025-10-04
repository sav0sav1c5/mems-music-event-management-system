using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;

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

        public OrderService(
            ICartService cartService,
            IRecordedSaleProxyService recordedSaleService,
            ITicketProxyService ticketService,
            ITicketTypeProxyService ticketTypeService,
            IZoneProxyService zoneService,
            IEventProxyService eventService)
        {
            _cartService = cartService;
            _recordedSaleService = recordedSaleService;
            _ticketService = ticketService;
            _ticketTypeService = ticketTypeService;
            _zoneService = zoneService;
            _eventService = eventService;
        }

        public async Task<CheckoutResponseDto> CheckoutAsync(string userId, CheckoutRequestDto checkoutRequest)
        {
            // Get and validate cart
            var cart = await _cartService.GetCartAsync(userId);
            if (!cart.Items.Any())
            {
                throw new InvalidOperationException("Cart is empty");
            }

            var isValid = await _cartService.ValidateCartAsync(userId);
            if (!isValid)
            {
                throw new InvalidOperationException("Cart contains invalid items");
            }

            // Create RecordedSale
            var recordedSaleDto = new RecordedSaleCreateDto
            {
                TotalAmount = cart.Total,
                SaleDate = DateTime.UtcNow,
                TransactionStatus = TransactionStatus.Pending,
                PaymentMethod = checkoutRequest.PaymentMethod,
                ApplicationUserId = checkoutRequest.ApplicationUserId
            };

            var recordedSale = await _recordedSaleService.CreateRecordedSaleAsync(recordedSaleDto);
            var createdTickets = new List<OrderTicketDto>();

            try
            {
                // Process each cart item
                foreach (var item in cart.Items)
                {
                    // Reserve tickets
                    var reserved = await _ticketTypeService.ReserveTicketsAsync(
                        item.TicketTypeId, item.Quantity);

                    if (!reserved)
                    {
                        throw new InvalidOperationException(
                            $"Failed to reserve tickets for {item.TicketTypeName}");
                    }

                    // Create individual tickets
                    for (int i = 0; i < item.Quantity; i++)
                    {
                        var ticketDto = new TicketCreateDto
                        {
                            IssueDate = DateTime.UtcNow,
                            FinalPrice = item.UnitPrice,
                            Status = TicketStatus.Sold,
                            TicketTypeId = item.TicketTypeId,
                            RecordedSaleId = recordedSale.RecordedSaleId
                        };

                        var ticket = await _ticketService.CreateTicketAsync(ticketDto);

                        // Build ticket response
                        var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(item.TicketTypeId);
                        var zone = await _zoneService.GetZoneByIdAsync(ticketType!.ZoneId);
                        var evt = await _eventService.GetEventByIdAsync(ticketType.EventId);

                        createdTickets.Add(new OrderTicketDto
                        {
                            TicketId = ticket.TicketId,
                            UniqueCode = ticket.UniqueCode,
                            QrCode = ticket.QrCode,
                            EventName = evt?.Name,
                            TicketTypeName = ticketType.Name,
                            ZoneName = zone?.Name,
                            EventStartDate = evt?.StartDate ?? DateTime.MinValue,
                            Price = ticket.FinalPrice,
                            Status = ticket.Status.ToString()
                        });
                    }
                }

                // Mark transaction as completed
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
            catch (Exception)
            {
                // Rollback: mark as failed
                await _recordedSaleService.UpdateRecordedSaleAsync(
                    recordedSale.RecordedSaleId,
                    new RecordedSaleUpdateDto
                    {
                        TransactionStatus = TransactionStatus.Failed
                    });

                // Release reserved tickets
                foreach (var item in cart.Items)
                {
                    await _ticketTypeService.ReleaseTicketsAsync(
                        item.TicketTypeId, item.Quantity);
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
            // This is a placeholder - implement actual PDF generation
            var ticket = await GetTicketDetailsAsync(ticketId, userId);

            if (ticket == null)
            {
                throw new InvalidOperationException("Ticket not found");
            }

            // TODO: Implement PDF generation using a library like QuestPDF or iTextSharp
            // For now, return empty byte array
            return Array.Empty<byte>();
        }
    }
}
