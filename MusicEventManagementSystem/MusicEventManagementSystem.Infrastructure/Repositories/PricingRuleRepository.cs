using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Models.Entities.TicketSales;
using MusicEventManagementSystem.Infrastructure.Database;

namespace MusicEventManagementSystem.Infrastructure.Repositories
{
    public class PricingRuleRepository : Repository<PricingRule>, IPricingRuleRepository
    {
        public PricingRuleRepository(ApplicationDbContext context) : base(context)
        {
        }

        public override async Task<IEnumerable<PricingRule>> GetAllAsync()
        {
            return await _context.PricingRules.Include(pr => pr.TicketTypes).Include(pr => pr.Events).ToListAsync();
        }

        public override async Task<PricingRule?> GetByIdAsync(int id)
        {
            return await _context.PricingRules.Include(pr => pr.TicketTypes).Include(pr => pr.Events).FirstOrDefaultAsync(pr => pr.PricingRuleId == id);
        }

        public async Task<IEnumerable<PricingRule>> GetActivePricingRulesAsync()
        {
            // Need to define what "active" means in this context - add missing field in PricingRule
            return await _context.PricingRules.Include(pr => pr.TicketTypes).Include(pr => pr.Events).Where(pr => pr.MinimumPrice >= 0 && pr.MaximumPrice > pr.MinimumPrice).ToListAsync();
        }

        public async Task<IEnumerable<PricingRule>> GetPricingRulesByEventAsync(int eventId)
        {
            return await _context.PricingRules.Include(pr => pr.TicketTypes).Include(pr => pr.Events).Where(pr => pr.Events.Any(e => e.Id == eventId)).ToListAsync();
        }

        public async Task<IEnumerable<PricingRule>> GetPricingRulesByTicketTypeAsync(int ticketTypeId)
        {
            return await _context.PricingRules.Include(pr => pr.TicketTypes).Include(pr => pr.Events).Where(pr => pr.TicketTypes.Any(tt => tt.TicketTypeId == ticketTypeId)).ToListAsync();
        }

        public async Task<decimal> CalculatePriceAsync(int pricingRuleId, decimal basePrice, decimal occupancyRate, bool isEarlyBird = false)
        {
            var pricingRule = await GetByIdAsync(pricingRuleId);
            if (pricingRule == null)
            {
                return basePrice;
            }

            decimal calculatedPrice = basePrice;

            // Apply occupancy-based pricing
            if (occupancyRate >= pricingRule.OccupancyThreshold2)
            {
                calculatedPrice += basePrice * (pricingRule.OccupancyPercentage2 / 100);
            }
            else if (occupancyRate >= pricingRule.OccupancyThreshold1)
            {
                calculatedPrice += basePrice * (pricingRule.OccupancyPercentage1 / 100);
            }

            // Apply early bird discount
            if (isEarlyBird && pricingRule.EarlyBirdPercentage > 0)
            {
                calculatedPrice -= basePrice * (pricingRule.EarlyBirdPercentage / 100);
            }

            // Apply modifier
            calculatedPrice += pricingRule.Modifier;

            // Ensure price is within bounds
            if (pricingRule.MinimumPrice > 0)
                calculatedPrice = Math.Max(calculatedPrice, pricingRule.MinimumPrice);

            if (pricingRule.MaximumPrice > 0)
                calculatedPrice = Math.Min(calculatedPrice, pricingRule.MaximumPrice);

            return Math.Round(calculatedPrice, 2);
        }
    }
}
