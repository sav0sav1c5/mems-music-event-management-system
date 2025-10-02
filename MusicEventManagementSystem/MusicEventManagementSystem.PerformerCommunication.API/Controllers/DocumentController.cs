using Microsoft.AspNetCore.Mvc;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.PerformerCommunication;

namespace MusicEventManagementSystem.PerformerCommunication.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DocumentController : ControllerBase
    {
        private readonly IDocumentService _documentService;

        public DocumentController(IDocumentService documentService)
        {
            _documentService = documentService;
        }

        [HttpGet]
        public async Task<ActionResult<IEnumerable<Document>>> GetAllDocuments()
        {
            try
            {
                var documents = await _documentService.GetAllDocumentsAsync();
                return Ok(documents);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
        public async Task<ActionResult<Document>> GetDocumentById(int id)
        {
            try
            {
                var existingDocument = await _documentService.GetDocumentByIdAsync(id);

                if (existingDocument == null)
                {
                    return NotFound($"Document with ID {id} not found.");
                }

                return Ok(existingDocument);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
        public async Task<ActionResult<Document>> CreateDocument([FromBody] Document document)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var createdDocument = await _documentService.CreateDocumentAsync(document);

                return CreatedAtAction(nameof(GetDocumentById), new { id = createdDocument.DocumentId }, createdDocument);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
        public async Task<ActionResult<Document>> UpdateDocument(int id, [FromBody] Document document)
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

                var updatedDocument = await _documentService.UpdateDocumentAsync(id, document);

                if (updatedDocument == null)
                {
                    return NotFound($"Document with ID {id} not found.");
                }

                return Ok(updatedDocument);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteDocument(int id)
        {
            try
            {
                var isDeleted = await _documentService.DeleteDocumentAsync(id);

                if (isDeleted == false)
                {
                    return NotFound($"Document with ID {id} not found.");
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
