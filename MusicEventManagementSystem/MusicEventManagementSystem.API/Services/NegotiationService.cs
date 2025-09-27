using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;

namespace MusicEventManagementSystem.API.Services
{
    public class NegotiationService : INegotiationService
    {
        private readonly INegotiationRepository _negotiationRepository;
        private readonly IPhaseService _phaseService;

        public NegotiationService(INegotiationRepository negotiationRepository, IPhaseService phaseService)
        {
            _negotiationRepository = negotiationRepository;
            _phaseService = phaseService;
        }

        public async Task<IEnumerable<Negotiation>> GetAllNegotiationsAsync()
        {
            return await _negotiationRepository.GetAllAsync();
        }

        public async Task<Negotiation?> GetNegotiationByIdAsync(int id)
        {
            return await _negotiationRepository.GetByIdAsync(id);
        }

        public async Task<Negotiation> CreateNegotiationAsync(Negotiation negotiation)
        {
            await _negotiationRepository.AddAsync(negotiation);
            await _negotiationRepository.SaveChangesAsync();
            return negotiation;
        }

        public async Task<Negotiation?> UpdateNegotiationAsync(int id, Negotiation negotiation)
        {
            var existingNegotiation = await _negotiationRepository.GetByIdAsync(id);
            if (existingNegotiation == null)
            {
                return null;
            }

            existingNegotiation.ProposedFee = negotiation.ProposedFee;
            existingNegotiation.Status = negotiation.Status;
            existingNegotiation.StartDate = negotiation.StartDate;
            existingNegotiation.EndDate = negotiation.EndDate;
            existingNegotiation.EventId = negotiation.EventId;
            existingNegotiation.PerformerId = negotiation.PerformerId;

            _negotiationRepository.Update(existingNegotiation);
            await _negotiationRepository.SaveChangesAsync();
            return existingNegotiation;
        }

        public async Task<bool> DeleteNegotiationAsync(int id)
        {
            var negotiation = await _negotiationRepository.GetByIdAsync(id);
            if (negotiation == null)
            {
                return false;
            }

            _negotiationRepository.Delete(negotiation);
            await _negotiationRepository.SaveChangesAsync();
            return true;
        }

        // New methods for handling relationships

        public async Task<NegotiationWithDetailsDto?> GetNegotiationWithDetailsAsync(int id)
        {
            var negotiation = await _negotiationRepository.GetNegotiationWithDetailsAsync(id);
            if (negotiation == null) return null;

            return MapToNegotiationWithDetailsDto(negotiation);
        }

        public async Task<IEnumerable<NegotiationDto>> GetNegotiationsWithBasicDetailsAsync()
        {
            var negotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            return negotiations.Select(MapToNegotiationDto);
        }

        public async Task<IEnumerable<NegotiationDto>> GetNegotiationsByEventIdAsync(int eventId)
        {
            var negotiations = await _negotiationRepository.GetNegotiationsByEventIdAsync(eventId);
            return negotiations.Select(MapToNegotiationDto);
        }

        public async Task<IEnumerable<NegotiationDto>> GetNegotiationsByPerformerIdAsync(int performerId)
        {
            var negotiations = await _negotiationRepository.GetNegotiationsByPerformerIdAsync(performerId);
            return negotiations.Select(MapToNegotiationDto);
        }

        public async Task<bool> AddUserToNegotiationAsync(int negotiationId, string userId)
        {
            var result = await _negotiationRepository.AddUserToNegotiationAsync(negotiationId, userId);
            if (result)
            {
                await _negotiationRepository.SaveChangesAsync();
            }
            return result;
        }

        public async Task<bool> RemoveUserFromNegotiationAsync(int negotiationId, string userId)
        {
            var result = await _negotiationRepository.RemoveUserFromNegotiationAsync(negotiationId, userId);
            if (result)
            {
                await _negotiationRepository.SaveChangesAsync();
            }
            return result;
        }

        public async Task<Negotiation> CreateNegotiationWithRelationshipsAsync(CreateNegotiationDto createDto)
        {
            var negotiation = new Negotiation
            {
                ProposedFee = createDto.ProposedFee,
                Status = createDto.Status,
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                EventId = createDto.EventId,
                PerformerId = createDto.PerformerId,
                CurrentPhaseOrder = 1 // Start at first phase
            };

            await _negotiationRepository.AddAsync(negotiation);
            await _negotiationRepository.SaveChangesAsync();

            // Initialize phases and requirements for the new negotiation
            await _phaseService.InitializeNegotiationPhasesAsync(negotiation.NegotiationId);

            return negotiation;
        }

        public async Task<Negotiation?> UpdateNegotiationWithRelationshipsAsync(int id, UpdateNegotiationDto updateDto)
        {
            var existingNegotiation = await _negotiationRepository.GetByIdAsync(id);
            if (existingNegotiation == null)
            {
                return null;
            }

            existingNegotiation.ProposedFee = updateDto.ProposedFee;
            existingNegotiation.Status = updateDto.Status;
            existingNegotiation.StartDate = updateDto.StartDate;
            existingNegotiation.EndDate = updateDto.EndDate;
            existingNegotiation.EventId = updateDto.EventId;
            existingNegotiation.PerformerId = updateDto.PerformerId;

            _negotiationRepository.Update(existingNegotiation);
            await _negotiationRepository.SaveChangesAsync();
            return existingNegotiation;
        }

        // Helper mapping methods
        private static NegotiationDto MapToNegotiationDto(Negotiation negotiation)
        {
            return new NegotiationDto
            {
                NegotiationId = negotiation.NegotiationId,
                ProposedFee = negotiation.ProposedFee,
                Status = negotiation.Status,
                StartDate = negotiation.StartDate,
                EndDate = negotiation.EndDate,
                EventId = negotiation.EventId,
                EventName = negotiation.Event?.Name,
                PerformerId = negotiation.PerformerId,
                PerformerName = negotiation.Performer?.Name,
                // TODO: Update to use NegotiationPhases instead of direct Phases
                Phases = new List<PhaseDto>(),
                Documents = negotiation.Documents?.Select(d => new DocumentDto
                {
                    DocumentId = d.DocumentId,
                    Title = d.Title,
                    Type = d.Type,
                    Path = d.Path,
                    Version = d.Version,
                    UpdatedAt = d.UpdatedAt,
                    NegotiationId = d.NegotiationId
                }).ToList(),
                Communication = negotiation.Communication != null ? new CommunicationDto
                {
                    CommunicationId = negotiation.Communication.CommunicationId,
                    Type = negotiation.Communication.Type,
                    Direction = negotiation.Communication.Direction,
                    Content = negotiation.Communication.Content,
                    SentAt = negotiation.Communication.SentAt,
                    RepliedAt = negotiation.Communication.RepliedAt,
                    NegotiationId = negotiation.Communication.NegotiationId
                } : null
            };
        }

        private static NegotiationWithDetailsDto MapToNegotiationWithDetailsDto(Negotiation negotiation)
        {
            var baseDto = MapToNegotiationDto(negotiation);
            return new NegotiationWithDetailsDto
            {
                NegotiationId = baseDto.NegotiationId,
                ProposedFee = baseDto.ProposedFee,
                Status = baseDto.Status,
                StartDate = baseDto.StartDate,
                EndDate = baseDto.EndDate,
                EventId = baseDto.EventId,
                EventName = baseDto.EventName,
                PerformerId = baseDto.PerformerId,
                PerformerName = baseDto.PerformerName,
                Phases = baseDto.Phases,
                Documents = baseDto.Documents,
                Communication = baseDto.Communication,
                Performer = negotiation.Performer != null ? new PerformerDto
                {
                    PerformerId = negotiation.Performer.PerformerId,
                    Name = negotiation.Performer.Name,
                    Email = negotiation.Performer.Email,
                    Contact = negotiation.Performer.Contact ?? string.Empty,
                    Genre = negotiation.Performer.Genre,
                    Popularity = negotiation.Performer.Popularity,
                    TechnicalRequirements = negotiation.Performer.TechnicalRequirements,
                    MinPrice = negotiation.Performer.MinPrice,
                    MaxPrice = negotiation.Performer.MaxPrice,
                    AverageResponseTime = negotiation.Performer.AverageResponseTime,
                    Status = negotiation.Performer.Status
                } : null,
                UserEmails = negotiation.Users?.Select(nu => nu.User.Email ?? string.Empty).ToList()
            };
        }

        #region Phase Management Methods

        public async Task<int> GetCurrentPhaseOrderAsync(int negotiationId)
        {
            var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId);
            return negotiation?.CurrentPhaseOrder ?? 1;
        }

        public async Task<bool> AdvanceNegotiationPhaseAsync(int negotiationId)
        {
            return await _phaseService.AdvanceToNextPhaseAsync(negotiationId);
        }

        public async Task<bool> UpdateNegotiationPhaseOrderAsync(int negotiationId, int newPhaseOrder)
        {
            var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId);
            if (negotiation == null)
            {
                return false;
            }

            negotiation.CurrentPhaseOrder = newPhaseOrder;

            _negotiationRepository.Update(negotiation);
            await _negotiationRepository.SaveChangesAsync();
            return true;
        }

        public async Task<NegotiationPhase?> GetCurrentPhaseAsync(int negotiationId)
        {
            return await _phaseService.GetCurrentNegotiationPhaseAsync(negotiationId);
        }

        public async Task<IEnumerable<NegotiationPhase>> GetNegotiationPhaseHistoryAsync(int negotiationId)
        {
            return await _phaseService.GetNegotiationPhasesAsync(negotiationId);
        }

        #endregion

        #region Requirement Fulfillment Methods

        public Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsAsync(int negotiationId)
        {
            // This method will need to be implemented when the repository interface is updated
            // For now, return empty list
            return Task.FromResult<IEnumerable<NegotiationRequirementFulfillment>>(new List<NegotiationRequirementFulfillment>());
        }

        public Task<bool> FulfillRequirementAsync(int negotiationId, int requirementId, bool isFulfilled = true)
        {
            // This method will need to be implemented when the repository interface is updated
            // For now, return true as placeholder
            return Task.FromResult(true);
        }

        public Task<bool> AreAllRequirementsFulfilledForPhaseAsync(int negotiationId, int phaseId)
        {
            // This method will need to be implemented when the repository interface is updated
            // For now, return true as placeholder
            return Task.FromResult(true);
        }

        public Task<decimal> GetPhaseCompletionPercentageAsync(int negotiationId, int phaseId)
        {
            // This method will need to be implemented when the repository interface is updated
            // For now, return 0 as placeholder
            return Task.FromResult(0m);
        }

        #endregion
    }
}
