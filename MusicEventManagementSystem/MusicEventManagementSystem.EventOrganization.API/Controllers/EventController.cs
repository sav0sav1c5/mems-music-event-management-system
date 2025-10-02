using Microsoft.AspNetCore.Mvc;
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs
using MusicEventManagementSystem.API.DTOs;
using MusicEventManagementSystem.API.Services.IService;
using Microsoft.AspNetCore.Authorization;
=======
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.DTOs.EventOrganization;
using MusicEventManagementSystem.Core.Models.Entities.EventOrganization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs

namespace MusicEventManagementSystem.EventOrganization.API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EventController : ControllerBase
    {
        private readonly IEventService _eventService;

        public EventController(IEventService eventService)
        {
            _eventService = eventService ?? throw new ArgumentNullException(nameof(eventService));
        }

        [HttpGet]
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs
        [AllowAnonymous] 
=======
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs
        public async Task<ActionResult<IEnumerable<EventResponseDto>>> GetAllEvents()
        {
            try
            {
                var events = await _eventService.GetAllEventsAsync();
                return Ok(events);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpGet("{id}")]
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs
        [AllowAnonymous] 
=======
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs
        public async Task<ActionResult<EventResponseDto>> GetEventById(int id)
        {
            try
            {
                var existingEvent = await _eventService.GetEventByIdAsync(id);
                if (existingEvent == null)
                {
                    return NotFound($"Event with ID {id} not found.");
                }
                return Ok(existingEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPost]
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs
        public async Task<ActionResult<EventResponseDto>> CreateEvent([FromBody] EventCreateDto dto)
=======
        public async Task<ActionResult<EventResponseDto>> CreateEvent([FromBody] EventCreateDto eventDto)
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs

                var createdEvent = await _eventService.CreateEventAsync(dto);
=======
                var createdEvent = await _eventService.CreateEventAsync(eventDto);
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs
                return CreatedAtAction(nameof(GetEventById), new { id = createdEvent.Id }, createdEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpPut("{id}")]
<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs
        public async Task<ActionResult<EventResponseDto>> UpdateEvent(int id, [FromBody] EventUpdateDto dto)
=======
        public async Task<ActionResult<EventResponseDto>> UpdateEvent(int id, [FromBody] EventUpdateDto eventDto)
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs
        {
            try
            {
                if (!ModelState.IsValid)
                {
                    return BadRequest(ModelState);
                }

<<<<<<< HEAD:MusicEventManagementSystem/MusicEventManagementSystem.API/Controllers/EventsController.cs
                var updatedEvent = await _eventService.UpdateEventAsync(id, dto);
=======
                var updatedEvent = await _eventService.UpdateEventAsync(id, eventDto);
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543:MusicEventManagementSystem/MusicEventManagementSystem.EventOrganization.API/Controllers/EventController.cs
                if (updatedEvent == null)
                {
                    return NotFound($"Event with ID {id} not found.");
                }
                return Ok(updatedEvent);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        [HttpDelete("{id}")]
        public async Task<ActionResult> DeleteEvent(int id)
        {
            try
            {
                var isDeleted = await _eventService.DeleteEventAsync(id);
                if (!isDeleted)
                {
                    return NotFound($"Event with ID {id} not found.");
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