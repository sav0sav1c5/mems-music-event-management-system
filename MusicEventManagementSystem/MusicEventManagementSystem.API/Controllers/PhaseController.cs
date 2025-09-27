using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.API.DTOs;
using System;

namespace MusicEventManagementSystem.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class PhaseController : ControllerBase
    {
        private readonly IPhaseService _phaseService;

        public PhaseController(IPhaseService phaseService)
        {
            _phaseService = phaseService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<PhaseDto>>> GetAllPhases()
        {
            try
            {
                var phases = await _phaseService.GetAllPhasesAsync();
                var phaseDtos = phases.Select(p => new PhaseDto
                {
                    PhaseId = p.PhaseId,
                    PhaseName = p.PhaseName,
                    Description = p.Description,
                    OrderNumber = p.OrderNumber,
                    EstimatedDuration = p.EstimatedDuration,
                    IsGlobal = p.IsGlobal
                });
                return Ok(phaseDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<PhaseDto>> GetPhaseById(int id)
        {
            try
            {
                var existingPhase = await _phaseService.GetPhaseByIdAsync(id);

                if (existingPhase == null)
                {
                    return NotFound($"Phase with ID {id} not found.");
                }

                var phaseDto = new PhaseDto
                {
                    PhaseId = existingPhase.PhaseId,
                    PhaseName = existingPhase.PhaseName,
                    Description = existingPhase.Description,
                    OrderNumber = existingPhase.OrderNumber,
                    EstimatedDuration = existingPhase.EstimatedDuration,
                    IsGlobal = existingPhase.IsGlobal
                };

                return Ok(phaseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/with-requirements")]
        public async Task<ActionResult<PhaseWithRequirementsDto>> GetPhaseWithRequirements(int id)
        {
            try
            {
                var existingPhase = await _phaseService.GetPhaseByIdAsync(id);

                if (existingPhase == null)
                {
                    return NotFound($"Phase with ID {id} not found.");
                }

                var phaseDto = new PhaseWithRequirementsDto
                {
                    PhaseId = existingPhase.PhaseId,
                    PhaseName = existingPhase.PhaseName,
                    Description = existingPhase.Description,
                    OrderNumber = existingPhase.OrderNumber,
                    EstimatedDuration = existingPhase.EstimatedDuration,
                    IsGlobal = existingPhase.IsGlobal,
                    Requirements = existingPhase.Requirements?.Select(r => new RequirementDto
                    {
                        RequirementId = r.RequirementId,
                        Title = r.Title,
                        Description = r.Description,
                        IsRequired = r.IsRequired,
                        CreatedAt = r.CreatedAt,
                        UpdatedAt = r.UpdatedAt,
                        PhaseId = r.PhaseId
                    }).ToList()
                };

                return Ok(phaseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<PhaseDto>> CreatePhase([FromBody] CreatePhaseDto phaseDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                // Convert DTO to entity
                var phase = new Phase
                {
                    PhaseName = phaseDto.PhaseName,
                    Description = phaseDto.Description,
                    OrderNumber = phaseDto.OrderNumber,
                    EstimatedDuration = phaseDto.EstimatedDuration,
                    IsGlobal = phaseDto.IsGlobal
                };

                var createdPhase = await _phaseService.CreatePhaseAsync(phase);

                var resultDto = new PhaseDto
                {
                    PhaseId = createdPhase.PhaseId,
                    PhaseName = createdPhase.PhaseName,
                    Description = createdPhase.Description,
                    OrderNumber = createdPhase.OrderNumber,
                    EstimatedDuration = createdPhase.EstimatedDuration,
                    IsGlobal = createdPhase.IsGlobal
                };

                return CreatedAtAction(nameof(GetPhaseById), new { id = createdPhase.PhaseId }, resultDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<PhaseDto>> UpdatePhase(int id, [FromBody] UpdatePhaseDto phaseDto)
        {
            try
            {
                Console.WriteLine($"=== PHASE UPDATE REQUEST ===");
                Console.WriteLine($"Phase ID: {id}");
                Console.WriteLine($"Phase Name: {phaseDto.PhaseName}");
                Console.WriteLine($"Description: {phaseDto.Description}");
                Console.WriteLine($"Order Number: {phaseDto.OrderNumber}");
                Console.WriteLine($"Estimated Duration: {phaseDto.EstimatedDuration}");
                Console.WriteLine($"Is Global: {phaseDto.IsGlobal}");

                if (!ModelState.IsValid)
                {
                    Console.WriteLine("=== MODEL STATE INVALID ===");
                    return BadRequest(ModelState);
                }

                // Convert DTO to entity
                var phase = new Phase
                {
                    PhaseId = id,
                    PhaseName = phaseDto.PhaseName,
                    Description = phaseDto.Description,
                    OrderNumber = phaseDto.OrderNumber,
                    EstimatedDuration = phaseDto.EstimatedDuration,
                    IsGlobal = phaseDto.IsGlobal
                };

                Console.WriteLine($"=== CALLING PHASE SERVICE UPDATE ===");
                var updatedPhase = await _phaseService.UpdatePhaseAsync(id, phase);
                Console.WriteLine($"=== PHASE SERVICE UPDATE RESULT: {(updatedPhase != null ? "SUCCESS" : "NOT FOUND")} ===");

                if (updatedPhase == null)
                {
                    Console.WriteLine($"=== PHASE NOT FOUND: {id} ===");
                    return NotFound($"Phase with ID {id} not found.");
                }

                var resultDto = new PhaseDto
                {
                    PhaseId = updatedPhase.PhaseId,
                    PhaseName = updatedPhase.PhaseName,
                    Description = updatedPhase.Description,
                    OrderNumber = updatedPhase.OrderNumber,
                    EstimatedDuration = updatedPhase.EstimatedDuration,
                    IsGlobal = updatedPhase.IsGlobal
                };

                Console.WriteLine($"=== PHASE UPDATE SUCCESSFUL ===");
                return Ok(resultDto);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"=== PHASE UPDATE ERROR ===");
                Console.WriteLine($"Exception Type: {ex.GetType().Name}");
                Console.WriteLine($"Message: {ex.Message}");
                Console.WriteLine($"Stack Trace: {ex.StackTrace}");
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeletePhase(int id)
        {
            try
            {
                var isDeleted = await _phaseService.DeletePhaseAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Phase with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #region Global Phase Management

        [HttpGet("global")]
        public async Task<ActionResult<IEnumerable<PhaseDto>>> GetGlobalPhaseTemplates()
        {
            try
            {
                var globalPhases = await _phaseService.GetGlobalPhaseTemplatesAsync();
                var phaseDtos = globalPhases.Select(p => new PhaseDto
                {
                    PhaseId = p.PhaseId,
                    PhaseName = p.PhaseName,
                    Description = p.Description,
                    OrderNumber = p.OrderNumber,
                    EstimatedDuration = p.EstimatedDuration,
                    IsGlobal = p.IsGlobal
                });
                return Ok(phaseDtos);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("by-order/{orderNumber}")]
        public async Task<ActionResult<PhaseDto>> GetPhaseByOrder(int orderNumber)
        {
            try
            {
                var phase = await _phaseService.GetPhaseByOrderAsync(orderNumber);
                if (phase == null)
                {
                    return NotFound($"Phase with order number {orderNumber} not found.");
                }
                var phaseDto = new PhaseDto
                {
                    PhaseId = phase.PhaseId,
                    PhaseName = phase.PhaseName,
                    Description = phase.Description,
                    OrderNumber = phase.OrderNumber,
                    EstimatedDuration = phase.EstimatedDuration,
                    IsGlobal = phase.IsGlobal
                };
                return Ok(phaseDto);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("initialize-global")]
        public async Task<ActionResult> InitializeGlobalPhases()
        {
            try
            {
                await _phaseService.InitializeGlobalPhasesAsync();
                return Ok(new { message = "Global phases initialized successfully." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion

        #region Negotiation Phase Management

        [HttpGet("negotiation/{negotiationId}")]
        public async Task<ActionResult<IEnumerable<NegotiationPhase>>> GetNegotiationPhases(int negotiationId)
        {
            try
            {
                var negotiationPhases = await _phaseService.GetNegotiationPhasesAsync(negotiationId);
                return Ok(negotiationPhases);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("negotiation/{negotiationId}/current")]
        public async Task<ActionResult<NegotiationPhase>> GetCurrentNegotiationPhase(int negotiationId)
        {
            try
            {
                var currentPhase = await _phaseService.GetCurrentNegotiationPhaseAsync(negotiationId);
                if (currentPhase == null)
                {
                    return NotFound($"No current phase found for negotiation {negotiationId}.");
                }
                return Ok(currentPhase);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("negotiation/{negotiationId}/initialize")]
        public async Task<ActionResult> InitializeNegotiationPhases(int negotiationId)
        {
            try
            {
                await _phaseService.InitializeNegotiationPhasesAsync(negotiationId);
                return Ok(new { message = $"Phases initialized for negotiation {negotiationId}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("negotiation/{negotiationId}/advance")]
        public async Task<ActionResult> AdvanceToNextPhase(int negotiationId)
        {
            try
            {
                var canAdvance = await _phaseService.CanAdvanceToNextPhaseAsync(negotiationId);
                if (!canAdvance)
                {
                    return BadRequest(new { message = "Cannot advance to next phase. Requirements not fulfilled or already at final phase." });
                }

                var advanced = await _phaseService.AdvanceToNextPhaseAsync(negotiationId);
                if (!advanced)
                {
                    return BadRequest(new { message = "Failed to advance to next phase." });
                }

                return Ok(new { message = $"Successfully advanced negotiation {negotiationId} to next phase." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("negotiation/{negotiationId}/phase/{phaseId}/complete")]
        public async Task<ActionResult> CompletePhase(int negotiationId, int phaseId)
        {
            try
            {
                var completed = await _phaseService.CompletePhaseAsync(negotiationId, phaseId);
                if (!completed)
                {
                    return NotFound($"Phase {phaseId} not found for negotiation {negotiationId}.");
                }

                return Ok(new { message = $"Phase {phaseId} completed for negotiation {negotiationId}." });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("negotiation/{negotiationId}/can-advance")]
        public async Task<ActionResult<bool>> CanAdvanceToNextPhase(int negotiationId)
        {
            try
            {
                var canAdvance = await _phaseService.CanAdvanceToNextPhaseAsync(negotiationId);
                return Ok(new { canAdvance = canAdvance });
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        #endregion
    }
}
