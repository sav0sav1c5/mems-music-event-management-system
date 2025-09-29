using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
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

        [HttpPut("{id}")]
        public async Task<ActionResult<Contract>> UpdateContract(int id, [FromBody] Contract contract)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedContract = await _contractService.UpdateContractAsync(id, contract);

                if (updatedContract == null)
                {
                    return NotFound($"Contract with ID {id} not found.");
                }

                return Ok(updatedContract);
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
    }
}
