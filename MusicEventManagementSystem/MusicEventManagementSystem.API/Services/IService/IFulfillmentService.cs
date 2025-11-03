using MusicEventManagementSystem.API.Models;

namespace MusicEventManagementSystem.API.Services.IService
{
    public interface IFulfillmentService
    {
        /// <summary>
        /// Updates the fulfillment status and automatically updates related contract fields if configured
        /// </summary>
        Task<bool> UpdateFulfillmentStatusAsync(int fulfillmentId, bool isFulfilled, string fulfilledBy);

        /// <summary>
        /// Updates multiple fulfillments in a single transaction
        /// </summary>
        Task<bool> UpdateMultipleFulfillmentStatusAsync(
            IEnumerable<(int FulfillmentId, bool IsFulfilled, string FulfilledBy)> updates);

        /// <summary>
        /// Gets fulfillment details with requirement information
        /// </summary>
        Task<NegotiationRequirementFulfillment?> GetFulfillmentWithDetailsAsync(int fulfillmentId);

        /// <summary>
        /// Gets all fulfillments for a negotiation with their requirements
        /// </summary>
        Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationFulfillmentsAsync(int negotiationId);
    }
}