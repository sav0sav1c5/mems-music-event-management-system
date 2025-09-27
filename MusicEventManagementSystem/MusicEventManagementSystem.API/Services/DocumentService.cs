using MusicEventManagementSystem.API.Models;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services.IService;

namespace MusicEventManagementSystem.API.Services
{
    public class DocumentService : IDocumentService
    {
        private readonly IDocumentRepository _documentRepository;

        public DocumentService(IDocumentRepository documentRepository)
        {
            _documentRepository = documentRepository;
        }

        public async Task<IEnumerable<Document>> GetAllDocumentsAsync()
        {
            return await _documentRepository.GetAllAsync();
        }

        public async Task<Document?> GetDocumentByIdAsync(int id)
        {
            return await _documentRepository.GetByIdAsync(id);
        }

        public async Task<Document> CreateDocumentAsync(Document document)
        {
            document.UpdatedAt = DateTime.UtcNow;
            await _documentRepository.AddAsync(document);
            await _documentRepository.SaveChangesAsync();
            return document;
        }

        public async Task<Document?> UpdateDocumentAsync(int id, Document document)
        {
            var existingDocument = await _documentRepository.GetByIdAsync(id);
            if (existingDocument == null)
            {
                return null;
            }

            existingDocument.Title = document.Title;
            existingDocument.Type = document.Type;
            existingDocument.Path = document.Path;
            existingDocument.Version = document.Version;
            existingDocument.UpdatedAt = DateTime.UtcNow;

            _documentRepository.Update(existingDocument);
            await _documentRepository.SaveChangesAsync();
            return existingDocument;
        }

        public async Task<bool> DeleteDocumentAsync(int id)
        {
            var document = await _documentRepository.GetByIdAsync(id);
            if (document == null)
            {
                return false;
            }

            _documentRepository.Delete(document);
            await _documentRepository.SaveChangesAsync();
            return true;
        }
    }
}
