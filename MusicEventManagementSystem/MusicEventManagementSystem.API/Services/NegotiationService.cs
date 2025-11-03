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
        private readonly INegotiationPhaseRepository _negotiationPhaseRepository;
        private readonly INegotiationRequirementFulfillmentRepository _requirementFulfillmentRepository;
        private readonly ICommunicationRepository _communicationRepository;
        private readonly IPhaseRepository _phaseRepository;
        private readonly IRequirementRepository _requirementRepository;

        public NegotiationService(
            INegotiationRepository negotiationRepository, 
            IPhaseService phaseService,
            INegotiationPhaseRepository negotiationPhaseRepository,
            INegotiationRequirementFulfillmentRepository requirementFulfillmentRepository,
            ICommunicationRepository communicationRepository,
            IPhaseRepository phaseRepository,
            IRequirementRepository requirementRepository)
        {
            _negotiationRepository = negotiationRepository;
            _phaseService = phaseService;
            _negotiationPhaseRepository = negotiationPhaseRepository;
            _requirementFulfillmentRepository = requirementFulfillmentRepository;
            _communicationRepository = communicationRepository;
            _phaseRepository = phaseRepository;
            _requirementRepository = requirementRepository;
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
            
            // Initialize phases and requirement fulfillments for the new negotiation
            await _phaseService.InitializeNegotiationPhasesAsync(negotiation.NegotiationId);
            
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
                Status = "InProgress",
                StartDate = createDto.StartDate,
                EndDate = createDto.EndDate,
                EventId = createDto.EventId,
                PerformerId = createDto.PerformerId,
                CurrentPhaseOrder = 1 // Start at first phase
            };

            await _negotiationRepository.AddAsync(negotiation);
            await _negotiationRepository.SaveChangesAsync();

            // Initialize the complete negotiation workflow
            await InitializeNegotiationWorkflowAsync(negotiation.NegotiationId);

            return negotiation;
        }

        public async Task<Negotiation?> UpdateNegotiationWithRelationshipsAsync(int id, UpdateNegotiationDto updateDto)
        {
            var existingNegotiation = await _negotiationRepository.GetByIdAsync(id);
            if (existingNegotiation == null)
            {
                return null;
            }

            // Check if ProposedFee is being updated and validate phase
            if (existingNegotiation.ProposedFee != updateDto.ProposedFee)
            {
                var currentPhase = await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(id);
                if (currentPhase != null && !IsPhaseAllowedForFeeUpdate(currentPhase.PhaseId))
                {
                    throw new InvalidOperationException($"ProposedFee can only be updated in phases 3, 4, or 5. Current phase: {currentPhase.PhaseId}");
                }
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

        private static bool IsPhaseAllowedForFeeUpdate(int phaseId)
        {
            return phaseId == 3 || phaseId == 4 || phaseId == 5;
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
            try
            {
                // Check if we can advance to the next phase
                if (!await CanAdvanceToNextPhaseAsync(negotiationId))
                {
                    return false;
                }

                // Get current phase
                var currentPhase = await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(negotiationId);
                if (currentPhase == null) return false;

                // Complete current phase
                await _negotiationPhaseRepository.CompletePhaseAsync(negotiationId, currentPhase.PhaseId);

                // Get all phases for this negotiation ordered by phase order
                var allPhases = await _negotiationPhaseRepository.GetNegotiationPhasesAsync(negotiationId);
                var orderedPhases = allPhases.OrderBy(p => p.Phase.OrderNumber).ToList();

                // Find next phase
                var currentPhaseIndex = orderedPhases.FindIndex(p => p.PhaseId == currentPhase.PhaseId);
                if (currentPhaseIndex >= 0 && currentPhaseIndex < orderedPhases.Count - 1)
                {
                    var nextPhase = orderedPhases[currentPhaseIndex + 1];
                    
                    // Activate next phase
                    await _negotiationPhaseRepository.SetPhaseActiveAsync(negotiationId, nextPhase.PhaseId, true);
                    
                    // Update negotiation's current phase order
                    var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId);
                    if (negotiation != null)
                    {
                        negotiation.CurrentPhaseOrder = nextPhase.Phase.OrderNumber;
                        _negotiationRepository.Update(negotiation);
                        await _negotiationRepository.SaveChangesAsync();
                    }
                }
                else
                {
                    // All phases completed - complete the negotiation
                    await CompleteNegotiationAsync(negotiationId);
                }

                await _negotiationPhaseRepository.SaveChangesAsync();
                return true;
            }
            catch (Exception)
            {
                return false;
            }
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
            return await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(negotiationId);
        }

        public async Task<IEnumerable<NegotiationPhase>> GetNegotiationPhaseHistoryAsync(int negotiationId)
        {
            return await _negotiationPhaseRepository.GetNegotiationPhasesAsync(negotiationId);
        }

        #endregion

        #region Requirement Fulfillment Methods

        public async Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsAsync(int negotiationId)
        {
            return await _requirementFulfillmentRepository.GetNegotiationRequirementsAsync(negotiationId);
        }

        public async Task<IEnumerable<NegotiationRequirementFulfillment>> GetNegotiationRequirementsByPhaseAsync(int negotiationId, int phaseId)
        {
            return await _requirementFulfillmentRepository.GetNegotiationRequirementsByPhaseAsync(negotiationId, phaseId);
        }

        public async Task<bool> FulfillRequirementAsync(int negotiationId, int requirementId, bool isFulfilled = true, string? fulfilledBy = null, string? notes = null, string? evidence = null)
        {
            var result = await _requirementFulfillmentRepository.UpdateFulfillmentStatusAsync(negotiationId, requirementId, isFulfilled, fulfilledBy, notes, evidence);
            if (result)
            {
                await _requirementFulfillmentRepository.SaveChangesAsync();
            }
            return result;
        }

        public async Task<bool> AreAllRequirementsFulfilledForPhaseAsync(int negotiationId, int phaseId)
        {
            return await _requirementFulfillmentRepository.AreAllRequirementsFulfilledForPhaseAsync(negotiationId, phaseId);
        }

        public async Task<decimal> GetPhaseCompletionPercentageAsync(int negotiationId, int phaseId)
        {
            return await _requirementFulfillmentRepository.GetPhaseCompletionPercentageAsync(negotiationId, phaseId);
        }

        #endregion

        #region Communication Methods

        public async Task<bool> AddCommunicationToNegotiationAsync(int negotiationId, string type, string direction, string content)
        {
            var existingCommunication = await _communicationRepository.GetByNegotiationIdAsync(negotiationId);
            
            if (existingCommunication != null)
            {
                // Update existing communication with new content
                existingCommunication.Content += $"\n\n[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] ({type} - {direction}): {content}";
                _communicationRepository.Update(existingCommunication);
            }
            else
            {
                // Create new communication
                var communication = new Communication
                {
                    NegotiationId = negotiationId,
                    Type = type,
                    Direction = direction,
                    Content = $"[{DateTime.UtcNow:yyyy-MM-dd HH:mm}] ({type} - {direction}): {content}",
                    SentAt = DateTime.UtcNow
                };
                await _communicationRepository.AddAsync(communication);
            }

            await _communicationRepository.SaveChangesAsync();
            return true;
        }

        public async Task<Communication?> GetNegotiationCommunicationAsync(int negotiationId)
        {
            return await _communicationRepository.GetByNegotiationIdAsync(negotiationId);
        }

        #endregion

        #region Enhanced Workflow Methods

        public async Task<bool> InitializeNegotiationWorkflowAsync(int negotiationId)
        {
            try
            {
                // Get all global phases (1-5: Initial Outreach, Preliminary Negotiations, Contract Negotiations, Contract Draft, Final Agreement)
                var globalPhases = await _phaseRepository.GetAllAsync();
                var orderedPhases = globalPhases.Where(p => p.IsGlobal).OrderBy(p => p.OrderNumber).ToList();

                if (!orderedPhases.Any())
                {
                    throw new InvalidOperationException("No global phases found. Please ensure phases are seeded.");
                }

                // Create NegotiationPhase entities for each global phase
                foreach (var phase in orderedPhases)
                {
                    var negotiationPhase = new NegotiationPhase
                    {
                        NegotiationId = negotiationId,
                        PhaseId = phase.PhaseId,
                        Status = phase.OrderNumber == 1 ? "InProgress" : "NotStarted",
                        IsActive = phase.OrderNumber == 1,
                        StartDate = phase.OrderNumber == 1 ? DateTime.UtcNow : null
                    };

                    await _negotiationPhaseRepository.AddAsync(negotiationPhase);

                    // Create NegotiationRequirementFulfillment for each requirement in this phase
                    var phaseWithRequirements = await _phaseRepository.GetPhaseWithRequirementsAsync(phase.PhaseId);
                    if (phaseWithRequirements?.Requirements != null)
                    {
                        foreach (var requirement in phaseWithRequirements.Requirements)
                        {
                            var fulfillment = new NegotiationRequirementFulfillment
                            {
                                NegotiationId = negotiationId,
                                PhaseId = phase.PhaseId,
                                RequirementId = requirement.RequirementId,
                                IsFulfilled = false
                            };

                            await _requirementFulfillmentRepository.AddAsync(fulfillment);
                        }
                    }
                }

                await _negotiationPhaseRepository.SaveChangesAsync();
                await _requirementFulfillmentRepository.SaveChangesAsync();

                return true;
            }
            catch (Exception)
            {
                return false;
            }
        }

        public async Task<bool> CanAdvanceToNextPhaseAsync(int negotiationId)
        {
            var currentPhase = await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(negotiationId);
            if (currentPhase == null) return false;

            return await _requirementFulfillmentRepository.AreAllRequirementsFulfilledForPhaseAsync(negotiationId, currentPhase.PhaseId);
        }

        public async Task<bool> CompleteNegotiationAsync(int negotiationId)
        {
            var negotiation = await _negotiationRepository.GetByIdAsync(negotiationId);
            if (negotiation == null) return false;

            // Check if all phases are completed
            var phases = await _negotiationPhaseRepository.GetNegotiationPhasesAsync(negotiationId);
            var allPhasesCompleted = phases.All(p => p.Status == "Completed");

            if (allPhasesCompleted)
            {
                negotiation.Status = "Completed";
                _negotiationRepository.Update(negotiation);
                await _negotiationRepository.SaveChangesAsync();
                return true;
            }

            return false;
        }

        public async Task<NegotiationWorkflowDto?> GetNegotiationWorkflowAsync(int negotiationId)
        {
            var negotiation = await _negotiationRepository.GetNegotiationWithDetailsAsync(negotiationId);
            if (negotiation == null) return null;

            var phases = await _negotiationPhaseRepository.GetNegotiationPhasesAsync(negotiationId);
            var currentPhase = await _negotiationPhaseRepository.GetCurrentNegotiationPhaseAsync(negotiationId);
            var communication = await _communicationRepository.GetByNegotiationIdAsync(negotiationId);
            var canAdvance = await CanAdvanceToNextPhaseAsync(negotiationId);

            var phaseDtos = new List<NegotiationPhaseDto>();
            decimal totalCompletion = 0;

            foreach (var phase in phases.OrderBy(p => p.Phase.OrderNumber))
            {
                var requirements = await _requirementFulfillmentRepository.GetNegotiationRequirementsByPhaseAsync(negotiationId, phase.PhaseId);
                var completionPercentage = await _requirementFulfillmentRepository.GetPhaseCompletionPercentageAsync(negotiationId, phase.PhaseId);
                var fulfilledCount = await _requirementFulfillmentRepository.GetFulfilledRequirementsCountForPhaseAsync(negotiationId, phase.PhaseId);
                var totalCount = await _requirementFulfillmentRepository.GetTotalRequirementsCountForPhaseAsync(negotiationId, phase.PhaseId);

                var phaseDto = new NegotiationPhaseDto
                {
                    NegotiationId = phase.NegotiationId,
                    PhaseId = phase.PhaseId,
                    PhaseName = phase.Phase.PhaseName,
                    PhaseDescription = phase.Phase.Description,
                    OrderNumber = phase.Phase.OrderNumber,
                    Status = phase.Status,
                    StartDate = phase.StartDate,
                    CompletedDate = phase.CompletedDate,
                    IsActive = phase.IsActive,
                    CompletionPercentage = completionPercentage,
                    FulfilledRequirementsCount = fulfilledCount,
                    TotalRequirementsCount = totalCount,
                    RequirementFulfillments = requirements.Select(r => new NegotiationRequirementFulfillmentDto
                    {
                        FulfillmentId = r.FulfillmentId,
                        NegotiationId = r.NegotiationId,
                        PhaseId = r.PhaseId,
                        RequirementId = r.RequirementId,
                        RequirementTitle = r.Requirement.Title,
                        RequirementDescription = r.Requirement.Description,
                        IsRequired = r.Requirement.IsRequired,
                        IsFulfilled = r.IsFulfilled,
                        Evidence = r.Evidence,
                        Notes = r.Notes,
                        FulfilledDate = r.FulfilledDate,
                        FulfilledBy = r.FulfilledBy
                    }).ToList()
                };

                phaseDtos.Add(phaseDto);
                totalCompletion += completionPercentage;
            }

            var overallCompletion = phaseDtos.Any() ? totalCompletion / phaseDtos.Count : 0;

            return new NegotiationWorkflowDto
            {
                NegotiationId = negotiation.NegotiationId,
                ProposedFee = negotiation.ProposedFee,
                Status = negotiation.Status,
                StartDate = negotiation.StartDate,
                EndDate = negotiation.EndDate,
                CurrentPhaseOrder = negotiation.CurrentPhaseOrder,
                EventId = negotiation.EventId,
                EventName = negotiation.Event?.Name,
                PerformerId = negotiation.PerformerId,
                PerformerName = negotiation.Performer?.Name,
                Phases = phaseDtos,
                CurrentPhase = phaseDtos.FirstOrDefault(p => p.IsActive),
                Communication = communication != null ? new CommunicationDto
                {
                    CommunicationId = communication.CommunicationId,
                    Type = communication.Type,
                    Direction = communication.Direction,
                    Content = communication.Content,
                    SentAt = communication.SentAt,
                    RepliedAt = communication.RepliedAt,
                    NegotiationId = communication.NegotiationId
                } : null,
                CanAdvanceToNextPhase = canAdvance,
                OverallCompletionPercentage = Math.Round(overallCompletion, 2)
            };
        }

        // TEMPORARY DEBUG METHOD - REMOVE IN PRODUCTION
        public async Task<int> FixActivePhases()
        {
            int fixedCount = 0;
            
            // Get all negotiations
            var allNegotiations = await _negotiationRepository.GetAllAsync();
            
            foreach (var negotiation in allNegotiations)
            {
                // Check if this negotiation has any active phase
                var hasActivePhase = false;
                var negotiationPhases = await _negotiationPhaseRepository.GetNegotiationPhasesAsync(negotiation.NegotiationId);
                
                foreach (var phase in negotiationPhases)
                {
                    if (phase.IsActive)
                    {
                        hasActivePhase = true;
                        break;
                    }
                }
                
                // If no active phase, find the first phase (order 1) and make it active
                if (!hasActivePhase)
                {
                    var globalPhases = await _phaseRepository.GetAllAsync();
                    var firstPhase = globalPhases.Where(p => p.IsGlobal && p.OrderNumber == 1).FirstOrDefault();
                    
                    if (firstPhase != null)
                    {
                        var firstNegotiationPhase = negotiationPhases.FirstOrDefault(np => np.PhaseId == firstPhase.PhaseId);
                        if (firstNegotiationPhase != null)
                        {
                            firstNegotiationPhase.IsActive = true;
                            firstNegotiationPhase.Status = "Active";
                            firstNegotiationPhase.StartDate = DateTime.UtcNow;
                            
                            _negotiationPhaseRepository.Update(firstNegotiationPhase);
                            fixedCount++;
                        }
                    }
                }
            }
            
            if (fixedCount > 0)
            {
                await _negotiationPhaseRepository.SaveChangesAsync();
            }
            
            return fixedCount;
        }

        #endregion

        #region Analytics Methods

        public async Task<object> GetAnalyticsSummaryAsync(string timeRange)
        {
            var dateFilter = GetDateFromTimeRange(timeRange);
            var allNegotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            
            var filteredNegotiations = allNegotiations.Where(n => n.StartDate >= dateFilter).ToList();
            var totalNegotiations = filteredNegotiations.Count;
            var activeNegotiations = filteredNegotiations.Count(n => n.Status != "Completed" && n.Status != "Cancelled");
            var completedNegotiations = filteredNegotiations.Count(n => n.Status == "Completed");
            var totalValue = filteredNegotiations.Where(n => n.Status == "Completed").Sum(n => n.ProposedFee);
            var averageValue = completedNegotiations > 0 ? totalValue / completedNegotiations : 0;
            var successRate = totalNegotiations > 0 ? (double)completedNegotiations / totalNegotiations * 100 : 0;
            
            // Calculate average duration for completed negotiations
            var completedWithDuration = filteredNegotiations
                .Where(n => n.Status == "Completed" && n.EndDate > n.StartDate)
                .ToList();
            var averageDuration = completedWithDuration.Any() 
                ? completedWithDuration.Average(n => (n.EndDate - n.StartDate).TotalDays) 
                : 0;

            return new
            {
                totalNegotiations,
                activeNegotiations,
                completedNegotiations,
                totalValue,
                averageValue,
                successRate = Math.Round(successRate, 1),
                averageDuration = Math.Round(averageDuration, 1),
                conversionRate = Math.Round(successRate, 1) // Using success rate as conversion rate
            };
        }

        public async Task<IEnumerable<object>> GetPhaseDistributionAsync(string timeRange)
        {
            var dateFilter = GetDateFromTimeRange(timeRange);
            var negotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            var filteredNegotiations = negotiations.Where(n => n.StartDate >= dateFilter).ToList();

            // Get all phases to get proper names
            var phases = await _phaseRepository.GetAllAsync();
            var phaseDict = phases.ToDictionary(p => p.OrderNumber, p => p.PhaseName);

            var phaseDistribution = filteredNegotiations
                .GroupBy(n => n.CurrentPhaseOrder)
                .Select(g => new
                {
                    name = phaseDict.ContainsKey(g.Key) ? phaseDict[g.Key] : $"Phase {g.Key}",
                    value = g.Count(),
                    color = GetPhaseColor(g.Key)
                })
                .OrderBy(p => p.value)
                .ToList();

            return phaseDistribution;
        }

        public async Task<IEnumerable<object>> GetNegotiationTrendsAsync(string timeRange)
        {
            var dateFilter = GetDateFromTimeRange(timeRange);
            var negotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            var filteredNegotiations = negotiations.Where(n => n.StartDate >= dateFilter).ToList();

            var trends = filteredNegotiations
                .GroupBy(n => new { Year = n.StartDate.Year, Month = n.StartDate.Month })
                .OrderBy(g => g.Key.Year).ThenBy(g => g.Key.Month)
                .Select(g => new
                {
                    date = $"{g.Key.Year}-{g.Key.Month:D2}",
                    started = g.Count(),
                    completed = g.Count(n => n.Status == "Completed"),
                    revenue = g.Where(n => n.Status == "Completed").Sum(n => n.ProposedFee),
                    avgDuration = g.Where(n => n.Status == "Completed" && n.EndDate > n.StartDate)
                                   .Select(n => (n.EndDate - n.StartDate).TotalDays)
                                   .DefaultIfEmpty(0)
                                   .Average()
                })
                .ToList();

            return trends;
        }

        public async Task<IEnumerable<object>> GetPerformerAnalyticsAsync(string timeRange)
        {
            var dateFilter = GetDateFromTimeRange(timeRange);
            var negotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            var filteredNegotiations = negotiations.Where(n => n.StartDate >= dateFilter).ToList();

            var performerAnalytics = filteredNegotiations
                .GroupBy(n => new { n.PerformerId, n.Performer.Name })
                .Select(g => new
                {
                    name = g.Key.Name,
                    negotiations = g.Count(),
                    success = g.Count(n => n.Status == "Completed"),
                    revenue = g.Where(n => n.Status == "Completed").Sum(n => n.ProposedFee),
                    avgDuration = g.Where(n => n.Status == "Completed" && n.EndDate > n.StartDate)
                                   .Select(n => (n.EndDate - n.StartDate).TotalDays)
                                   .DefaultIfEmpty(0)
                                   .Average()
                })
                .OrderByDescending(p => p.revenue)
                .Take(10)
                .ToList();

            return performerAnalytics;
        }

        public async Task<IEnumerable<object>> GetRevenueByEventAsync(string timeRange)
        {
            var dateFilter = GetDateFromTimeRange(timeRange);
            var negotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            var filteredNegotiations = negotiations.Where(n => n.StartDate >= dateFilter).ToList();

            var revenueByEvent = filteredNegotiations
                .Where(n => n.Status == "Completed")
                .GroupBy(n => new { n.EventId, n.Event.Name })
                .Select(g => new
                {
                    @event = g.Key.Name,
                    revenue = g.Sum(n => n.ProposedFee),
                    negotiations = g.Count(),
                    avgValue = g.Average(n => n.ProposedFee)
                })
                .OrderByDescending(e => e.revenue)
                .Take(10)
                .ToList();

            return revenueByEvent;
        }

        public async Task<IEnumerable<object>> GetPhaseDurationAnalysisAsync(string timeRange)
        {
            var dateFilter = GetDateFromTimeRange(timeRange);
            var phases = await _phaseRepository.GetAllAsync();
            var negotiationPhases = await _negotiationPhaseRepository.GetAllAsync();

            var phaseDurations = phases
                .Select(p => new
                {
                    phase = p.PhaseName,
                    avgDays = negotiationPhases
                        .Where(np => np.PhaseId == p.PhaseId && 
                                   np.StartDate.HasValue && np.CompletedDate.HasValue &&
                                   np.StartDate >= dateFilter)
                        .Select(np => (np.CompletedDate!.Value - np.StartDate!.Value).TotalDays)
                        .DefaultIfEmpty(0)
                        .Average(),
                    minDays = negotiationPhases
                        .Where(np => np.PhaseId == p.PhaseId && 
                                   np.StartDate.HasValue && np.CompletedDate.HasValue &&
                                   np.StartDate >= dateFilter)
                        .Select(np => (np.CompletedDate!.Value - np.StartDate!.Value).TotalDays)
                        .DefaultIfEmpty(0)
                        .Min(),
                    maxDays = negotiationPhases
                        .Where(np => np.PhaseId == p.PhaseId && 
                                   np.StartDate.HasValue && np.CompletedDate.HasValue &&
                                   np.StartDate >= dateFilter)
                        .Select(np => (np.CompletedDate!.Value - np.StartDate!.Value).TotalDays)
                        .DefaultIfEmpty(0)
                        .Max()
                })
                .Where(p => p.avgDays > 0)
                .OrderBy(p => p.avgDays)
                .ToList();

            return phaseDurations;
        }

        public async Task<IEnumerable<object>> GetRecentActivityAsync(int limit)
        {
            var negotiations = await _negotiationRepository.GetNegotiationsWithBasicDetailsAsync();
            var recentNegotiations = negotiations
                .OrderByDescending(n => n.StartDate)
                .Take(limit)
                .ToList();

            var activities = new List<object>();

            foreach (var negotiation in recentNegotiations)
            {
                // Add negotiation started activity
                activities.Add(new
                {
                    id = negotiation.NegotiationId,
                    type = "negotiation_started",
                    description = $"New negotiation started with {negotiation.Performer?.Name ?? "Unknown Performer"}",
                    time = GetRelativeTime(negotiation.StartDate),
                    value = negotiation.ProposedFee
                });

                // Add completed activity if applicable
                if (negotiation.Status == "Completed")
                {
                    activities.Add(new
                    {
                        id = negotiation.NegotiationId,
                        type = "contract_signed",
                        description = $"Contract finalized for {negotiation.Event?.Name ?? "Unknown Event"}",
                        time = GetRelativeTime(negotiation.EndDate),
                        value = negotiation.ProposedFee
                    });
                }
            }

            return activities.OrderByDescending(a => a.GetType().GetProperty("time")?.GetValue(a))
                           .Take(limit);
        }

        private DateTime GetDateFromTimeRange(string timeRange)
        {
            return timeRange switch
            {
                "7d" => DateTime.Now.AddDays(-7),
                "30d" => DateTime.Now.AddDays(-30),
                "90d" => DateTime.Now.AddDays(-90),
                "1y" => DateTime.Now.AddYears(-1),
                _ => DateTime.Now.AddDays(-30)
            };
        }

        private string GetPhaseColor(int phaseOrder)
        {
            return phaseOrder switch
            {
                1 => "#8b5cf6", // Purple
                2 => "#06b6d4", // Cyan
                3 => "#10b981", // Emerald
                4 => "#f59e0b", // Amber
                _ => "#6b7280"  // Gray
            };
        }

        private string GetRelativeTime(DateTime dateTime)
        {
            var timeSpan = DateTime.Now - dateTime;
            
            if (timeSpan.TotalDays >= 1)
                return $"{(int)timeSpan.TotalDays} day{(timeSpan.TotalDays >= 2 ? "s" : "")} ago";
            if (timeSpan.TotalHours >= 1)
                return $"{(int)timeSpan.TotalHours} hour{(timeSpan.TotalHours >= 2 ? "s" : "")} ago";
            if (timeSpan.TotalMinutes >= 1)
                return $"{(int)timeSpan.TotalMinutes} minute{(timeSpan.TotalMinutes >= 2 ? "s" : "")} ago";
            
            return "Just now";
        }

        #endregion
    }
}
