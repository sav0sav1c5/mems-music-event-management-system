using Microsoft.Extensions.Logging;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Enums.TicketSales;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using System.Collections.Generic;
using System.Diagnostics;

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

                // Step 2: CREATE ACTUAL TICKETS - OVO FALI!
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

        //public async Task<CheckoutResponseDto> CheckoutAsync(string userId, CheckoutRequestDto checkoutRequest)
        //{
        //    _logger.LogInformation($"=== CHECKOUT START === User: {userId}");

        //    try
        //    {
        //        // Step 1: Get and validate cart
        //        var cart = await _cartService.GetCartAsync(userId);
        //        _logger.LogInformation($"Cart retrieved: {cart.Items.Count} items, Total: {cart.Total}");

        //        if (!cart.Items.Any())
        //        {
        //            throw new InvalidOperationException("Cart is empty");
        //        }

        //        var isValid = await _cartService.ValidateCartAsync(userId);
        //        if (!isValid)
        //        {
        //            throw new InvalidOperationException("Cart contains invalid items");
        //        }

        //        var createdTickets = new List<OrderTicketDto>();
        //        var ticketIds = new List<int>();
        //        int? recordedSaleId = null;

        //        // Step 2: Reserve tickets
        //        _logger.LogInformation("=== STEP 1: Reserving tickets ===");
        //        foreach (var item in cart.Items)
        //        {
        //            _logger.LogInformation($"Attempting to reserve {item.Quantity}x TicketType {item.TicketTypeId} ({item.TicketTypeName})");

        //            var reserved = await _ticketTypeService.ReserveTicketsAsync(item.TicketTypeId, item.Quantity);

        //            if (!reserved)
        //            {
        //                _logger.LogError($"Failed to reserve {item.Quantity}x TicketType {item.TicketTypeId}");
        //                throw new InvalidOperationException($"Failed to reserve {item.Quantity} tickets for {item.TicketTypeName}");
        //            }

        //            _logger.LogInformation($"✅ Reserved {item.Quantity}x TicketType {item.TicketTypeId}");
        //        }

        //        // Step 3: Create RecordedSale
        //        _logger.LogInformation("=== STEP 2: Creating RecordedSale ===");

        //        var recordedSaleDto = new RecordedSaleCreateDto
        //        {
        //            TotalAmount = cart.Total,
        //            SaleDate = DateTime.UtcNow,
        //            TransactionStatus = TransactionStatus.Pending,
        //            PaymentMethod = checkoutRequest.PaymentMethod,
        //            ApplicationUserId = checkoutRequest.ApplicationUserId,
        //            TicketIds = new List<int>() // Empty initially
        //        };

        //        _logger.LogInformation($"RecordedSaleDto prepared:");
        //        _logger.LogInformation($"  - TotalAmount: {recordedSaleDto.TotalAmount}");
        //        _logger.LogInformation($"  - SaleDate: {recordedSaleDto.SaleDate}");
        //        _logger.LogInformation($"  - Status: {recordedSaleDto.TransactionStatus}");
        //        _logger.LogInformation($"  - PaymentMethod: {recordedSaleDto.PaymentMethod}");
        //        _logger.LogInformation($"  - UserId: {recordedSaleDto.ApplicationUserId}");
        //        _logger.LogInformation($"  - TicketIds count: {recordedSaleDto.TicketIds?.Count ?? 0}");

        //        RecordedSaleResponseDto recordedSale;
        //        try
        //        {
        //            _logger.LogInformation("Calling RecordedSaleService.CreateRecordedSaleAsync...");
        //            recordedSale = await _recordedSaleService.CreateRecordedSaleAsync(recordedSaleDto);
        //            recordedSaleId = recordedSale.RecordedSaleId;
        //            _logger.LogInformation($"✅ RecordedSale created with ID: {recordedSaleId}");
        //        }
        //        catch (Exception ex)
        //        {
        //            _logger.LogError(ex, $"❌ Failed to create RecordedSale: {ex.Message}");
        //            _logger.LogError($"Exception type: {ex.GetType().Name}");
        //            _logger.LogError($"Stack trace: {ex.StackTrace}");

        //            if (ex.InnerException != null)
        //            {
        //                _logger.LogError($"Inner exception: {ex.InnerException.Message}");
        //            }

        //            throw;
        //        }

        //        // Step 4: Create tickets
        //        _logger.LogInformation($"=== STEP 3: Creating tickets for RecordedSale {recordedSaleId} ===");

        //        foreach (var item in cart.Items)
        //        {
        //            _logger.LogInformation($"Processing {item.Quantity}x {item.TicketTypeName}");

        //            // Pre-fetch data
        //            var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(item.TicketTypeId);
        //            var zone = await _zoneService.GetZoneByIdAsync(ticketType!.ZoneId);
        //            var evt = await _eventService.GetEventByIdAsync(ticketType.EventId);

        //            for (int i = 0; i < item.Quantity; i++)
        //            {
        //                var ticketDto = new TicketCreateDto
        //                {
        //                    IssueDate = DateTime.UtcNow,
        //                    FinalPrice = item.UnitPrice,
        //                    Status = TicketStatus.Sold,
        //                    TicketTypeId = item.TicketTypeId,
        //                    RecordedSaleId = recordedSaleId
        //                };

        //                _logger.LogInformation($"Creating ticket {i + 1}/{item.Quantity} for TicketType {item.TicketTypeId}");

        //                try
        //                {
        //                    var ticket = await _ticketService.CreateTicketAsync(ticketDto);
        //                    ticketIds.Add(ticket.TicketId);

        //                    _logger.LogInformation($"✅ Created ticket {ticket.TicketId} with code {ticket.UniqueCode}");

        //                    createdTickets.Add(new OrderTicketDto
        //                    {
        //                        TicketId = ticket.TicketId,
        //                        UniqueCode = ticket.UniqueCode,
        //                        QrCode = ticket.QrCode,
        //                        EventName = evt?.Name,
        //                        TicketTypeName = ticketType.Name,
        //                        ZoneName = zone?.Name,
        //                        EventStartDate = evt?.StartDate ?? DateTime.MinValue,
        //                        Price = ticket.FinalPrice,
        //                        Status = ticket.Status.ToString()
        //                    });
        //                }
        //                catch (Exception ex)
        //                {
        //                    _logger.LogError(ex, $"❌ Failed to create ticket {i + 1}: {ex.Message}");
        //                    throw;
        //                }
        //            }
        //        }

        //        _logger.LogInformation($"✅ Created total of {ticketIds.Count} tickets");

        //        // Step 5: Update RecordedSale
        //        _logger.LogInformation($"=== STEP 4: Updating RecordedSale {recordedSaleId} ===");

        //        try
        //        {
        //            await _recordedSaleService.UpdateRecordedSaleAsync(
        //                recordedSaleId.Value,
        //                new RecordedSaleUpdateDto
        //                {
        //                    TicketIds = ticketIds,
        //                    TransactionStatus = TransactionStatus.Completed
        //                });

        //            _logger.LogInformation($"✅ RecordedSale {recordedSaleId} updated with {ticketIds.Count} tickets and marked as Completed");
        //        }
        //        catch (Exception ex)
        //        {
        //            _logger.LogError(ex, $"❌ Failed to update RecordedSale: {ex.Message}");
        //            throw;
        //        }

        //        // Step 6: Clear cart
        //        await _cartService.ClearCartAsync(userId);
        //        _logger.LogInformation($"✅ Cart cleared for user {userId}");

        //        _logger.LogInformation($"=== CHECKOUT COMPLETED SUCCESSFULLY ===");

        //        return new CheckoutResponseDto
        //        {
        //            OrderId = recordedSale.RecordedSaleId,
        //            OrderNumber = $"ORD-{recordedSale.RecordedSaleId:D8}",
        //            TotalAmount = recordedSale.TotalAmount,
        //            OrderDate = recordedSale.SaleDate,
        //            Status = TransactionStatus.Completed.ToString(),
        //            Tickets = createdTickets
        //        };
        //    }
        //    catch (Exception ex)
        //    {
        //        _logger.LogError(ex, $"❌❌❌ CHECKOUT FAILED for user {userId}: {ex.Message}");
        //        _logger.LogError($"Exception type: {ex.GetType().Name}");

        //        // Rollback logic
        //        _logger.LogInformation("=== STARTING ROLLBACK ===");

        //        var cart = await _cartService.GetCartAsync(userId);

        //        foreach (var item in cart.Items)
        //        {
        //            try
        //            {
        //                await _ticketTypeService.ReleaseTicketsAsync(item.TicketTypeId, item.Quantity);
        //                _logger.LogInformation($"✅ Released {item.Quantity} tickets for TicketType {item.TicketTypeId}");
        //            }
        //            catch (Exception releaseEx)
        //            {
        //                _logger.LogError(releaseEx, $"❌ Failed to release tickets for TicketType {item.TicketTypeId}");
        //            }
        //        }

        //        _logger.LogInformation($"=== ROLLBACK COMPLETED ===");
        //        throw;
        //    }
        //}

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
