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
    public class ContractController : ControllerBase
    {
        private readonly IContractService _contractService;

        public ContractController(IContractService contractService)
        {
            _contractService = contractService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Contract>>> GetAllContracts()
        {
            try
            {
                var contracts = await _contractService.GetAllContractsAsync();
                return Ok(contracts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Contract>> GetContractById(int id)
        {
            try
            {
                var existingContract = await _contractService.GetContractByIdAsync(id);

                if (existingContract == null)
                {
                    return NotFound($"Contract with ID {id} not found.");
                }

                return Ok(existingContract);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Contract>> CreateContract([FromBody] Contract contract)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdContract = await _contractService.CreateContractAsync(contract);

                return CreatedAtAction(nameof(GetContractById), new { id = createdContract.ContractId }, createdContract);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }



        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteContract(int id)
        {
            try
            {
                var isDeleted = await _contractService.DeleteContractAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Contract with ID {id} not found.");
                }

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost("draft/{negotiationId}")]
        public async Task<ActionResult<ContractDto>> CreateContractDraft(int negotiationId)
        {
            try
            {
                var contract = await _contractService.CreateContractDraftFromNegotiationAsync(negotiationId);
                return CreatedAtAction(nameof(GetContractWithDetails), new { id = contract.ContractId }, contract);
            }
            catch (ArgumentException ex)
            {
                return NotFound(ex.Message);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}/details")]
        public async Task<ActionResult<ContractDto>> GetContractWithDetails(int id)
        {
            try
            {
                var contract = await _contractService.GetContractWithDetailsAsync(id);
                if (contract == null)
                {
                    return NotFound($"Contract with ID {id} not found.");
                }
                return Ok(contract);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("negotiation/{negotiationId}")]
        public async Task<ActionResult<IEnumerable<ContractDto>>> GetContractsByNegotiation(int negotiationId)
        {
            try
            {
                var contracts = await _contractService.GetContractsByNegotiationAsync(negotiationId);
                return Ok(contracts);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<ContractDto>> UpdateContract(int id, [FromBody] UpdateContractDto updateDto)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedContract = await _contractService.UpdateContractAsync(id, updateDto);
                if (updatedContract == null)
                {
                    return NotFound($"Contract with ID {id} not found.");
                }

                return Ok(updatedContract);
            }
            catch (InvalidOperationException ex)
            {
                return BadRequest(ex.Message);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }
    }
}
