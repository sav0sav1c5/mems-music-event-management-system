using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.Client;
using System.Collections.Concurrent;

namespace MusicEventManagementSystem.API.Services
{
    public class CartService : ICartService
    {
        // In-memory cart storage
        // NOTE: In production will be used Redis/distributed cache
        private static readonly ConcurrentDictionary<string, List<CartItemDto>> _carts = new();

        private readonly ITicketTypeProxyService _ticketTypeService;
        private readonly IZoneProxyService _zoneService;
        private readonly IEventProxyService _eventService;
        private readonly ISpecialOfferProxyService _specialOfferService;

        public CartService(
            ITicketTypeProxyService ticketTypeService,
            IZoneProxyService zoneService,
            IEventProxyService eventService,
            ISpecialOfferProxyService specialOfferService)
        {
            _ticketTypeService = ticketTypeService;
            _zoneService = zoneService;
            _eventService = eventService;
            _specialOfferService = specialOfferService;
        }

        public async Task<CartDto> GetCartAsync(string userId)
        {
            if (!_carts.TryGetValue(userId, out var items))
            {
                items = new List<CartItemDto>();
            }

            return await BuildCartDtoAsync(items);
        }

        public async Task<CartDto> AddToCartAsync(string userId, AddToCartDto addToCartDto)
        {
            // Validate ticket type exists
            var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(addToCartDto.TicketTypeId);
            if (ticketType == null)
            {
                throw new InvalidOperationException("Ticket type not found");
            }

            // Check availability
            if (ticketType.AvailableQuantity < addToCartDto.Quantity)
            {
                throw new InvalidOperationException($"Only {ticketType.AvailableQuantity} tickets available");
            }

            // Get zone and event information
            var zone = await _zoneService.GetZoneByIdAsync(ticketType.ZoneId);
            var evt = await _eventService.GetEventByIdAsync(ticketType.EventId);

            if (zone == null || evt == null)
            {
                throw new InvalidOperationException("Invalid ticket configuration");
            }

            // Get or create cart
            if (!_carts.TryGetValue(userId, out var items))
            {
                items = new List<CartItemDto>();
                _carts[userId] = items;
            }

            // Check for active special offers
            var activeOffers = await _specialOfferService.GetActiveOffersAsync(DateTime.UtcNow);
            var applicableOffer = activeOffers.FirstOrDefault(o =>
                o.TicketTypeIds?.Contains(addToCartDto.TicketTypeId) == true);

            var unitPrice = zone.BasePrice;
            var discountAmount = 0m;

            if (applicableOffer != null)
            {
                discountAmount = unitPrice * (applicableOffer.DiscountValue / 100);
            }

            var finalUnitPrice = unitPrice - discountAmount;

            // Check if item already exists in cart
            var existingItem = items.FirstOrDefault(i => i.TicketTypeId == addToCartDto.TicketTypeId);

            if (existingItem != null)
            {
                // Update existing item
                var newQuantity = existingItem.Quantity + addToCartDto.Quantity;

                // Validate total quantity
                if (ticketType.AvailableQuantity < newQuantity)
                {
                    throw new InvalidOperationException($"Cannot add {addToCartDto.Quantity} more tickets. Only {ticketType.AvailableQuantity - existingItem.Quantity} available");
                }

                existingItem.Quantity = newQuantity;
                existingItem.Subtotal = existingItem.Quantity * finalUnitPrice;
                existingItem.DiscountAmount = existingItem.Quantity * discountAmount;
            }
            else
            {
                // Add new item to cart
                items.Add(new CartItemDto
                {
                    TicketTypeId = addToCartDto.TicketTypeId,
                    TicketTypeName = ticketType.Name,
                    EventName = evt.Name,
                    ZoneName = zone.Name,
                    Quantity = addToCartDto.Quantity,
                    UnitPrice = finalUnitPrice,
                    Subtotal = addToCartDto.Quantity * finalUnitPrice,
                    SpecialOfferId = applicableOffer?.SpecialOfferId,
                    SpecialOfferName = applicableOffer?.Name,
                    DiscountAmount = addToCartDto.Quantity * discountAmount
                });
            }

            return await BuildCartDtoAsync(items);
        }

        public async Task<CartDto> UpdateCartItemAsync(string userId, UpdateCartItemDto updateDto)
        {
            if (!_carts.TryGetValue(userId, out var items))
            {
                throw new InvalidOperationException("Cart not found");
            }

            var item = items.FirstOrDefault(i => i.TicketTypeId == updateDto.TicketTypeId);
            if (item == null)
            {
                throw new InvalidOperationException("Item not found in cart");
            }

            // If quantity is 0 or negative, remove item
            if (updateDto.Quantity <= 0)
            {
                items.Remove(item);
                return await BuildCartDtoAsync(items);
            }

            // Validate availability
            var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(updateDto.TicketTypeId);
            if (ticketType == null)
            {
                throw new InvalidOperationException("Ticket type no longer available");
            }

            if (ticketType.AvailableQuantity < updateDto.Quantity)
            {
                throw new InvalidOperationException($"Only {ticketType.AvailableQuantity} tickets available");
            }

            // Update quantity
            var discountPerItem = item.DiscountAmount / item.Quantity;
            item.Quantity = updateDto.Quantity;
            item.Subtotal = item.Quantity * item.UnitPrice;
            item.DiscountAmount = item.Quantity * discountPerItem;

            return await BuildCartDtoAsync(items);
        }

        public async Task<CartDto> RemoveFromCartAsync(string userId, int ticketTypeId)
        {
            if (!_carts.TryGetValue(userId, out var items))
            {
                throw new InvalidOperationException("Cart not found");
            }

            var item = items.FirstOrDefault(i => i.TicketTypeId == ticketTypeId);
            if (item != null)
            {
                items.Remove(item);
            }

            return await BuildCartDtoAsync(items);
        }

        public Task<bool> ClearCartAsync(string userId)
        {
            _carts.TryRemove(userId, out _);
            return Task.FromResult(true);
        }

        public async Task<bool> ValidateCartAsync(string userId)
        {
            if (!_carts.TryGetValue(userId, out var items))
            {
                return true; // Empty cart is valid
            }

            foreach (var item in items)
            {
                var ticketType = await _ticketTypeService.GetTicketTypeByIdAsync(item.TicketTypeId);

                // Check if ticket type still exists and has enough quantity
                if (ticketType == null || ticketType.AvailableQuantity < item.Quantity)
                {
                    return false;
                }

                // Check if event is still available
                var evt = await _eventService.GetEventByIdAsync(ticketType.EventId);
                if (evt == null || evt.StartDate <= DateTime.UtcNow)
                {
                    return false;
                }
            }

            return true;
        }

        public async Task<decimal> CalculateCartTotalAsync(string userId)
        {
            var cart = await GetCartAsync(userId);
            return cart.Total;
        }

        // Helper method to build CartDto with calculations
        private Task<CartDto> BuildCartDtoAsync(List<CartItemDto> items)
        {
            var subtotal = items.Sum(i => i.Subtotal + i.DiscountAmount);
            var totalDiscount = items.Sum(i => i.DiscountAmount);
            var total = items.Sum(i => i.Subtotal);

            return Task.FromResult(new CartDto
            {
                Items = items,
                Subtotal = subtotal,
                TotalDiscount = totalDiscount,
                Total = total,
                TotalItems = items.Sum(i => i.Quantity)
            });
        }
    }
}
