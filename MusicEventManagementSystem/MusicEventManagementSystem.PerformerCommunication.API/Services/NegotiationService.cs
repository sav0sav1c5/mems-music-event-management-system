using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Services
{
    public class NegotiationService : INegotiationService
    {
        private readonly INegotiationRepository _negotiationRepository;

        public NegotiationService(INegotiationRepository negotiationRepository)
        {
            _negotiationRepository = negotiationRepository;
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
                PerformerId = createDto.PerformerId
            };

            await _negotiationRepository.AddAsync(negotiation);
            await _negotiationRepository.SaveChangesAsync();
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
                Phases = negotiation.Phases?.Select(p => new PhaseDto
                {
                    PhaseId = p.PhaseId,
                    PhaseName = p.PhaseName,
                    OrderNumber = p.OrderNumber,
                    EstimatedDuration = p.EstimatedDuration,
                    NegotiationId = p.NegotiationId,
                    ContractId = p.ContractId
                }).ToList(),
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
                Performer = negotiation.Performer != null ? new PerformerResponseDto
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
    }
}
