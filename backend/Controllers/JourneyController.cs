using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Models;
using backend.Data;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class JourneyController : ControllerBase
    {
        private readonly AppDbContext _context;

        public JourneyController(AppDbContext context)
        {
            _context = context ?? throw new ArgumentNullException(nameof(context));
        }

        // Required fields based on your controller
        // required fields: {
        //   "id": "string", // (optional on POST, generated on backend)
        //   "productId": "string", // required
        //   "userId": number, // likely required
        //   "currentStage": "string", // required
        //   // Other fields like timestamps are set server-side
        // }

        // GET: api/Journey
        [HttpGet]
        public async Task<ActionResult<IEnumerable<Journey>>> GetJourneys()
        {
            try
            {
                // Verify Journeys DbSet exists before using it
                if (_context.GetType().GetProperty("Journeys") == null)
                {
                    return StatusCode(500, "The Journeys DbSet is not defined in the AppDbContext");
                }
                
                return await _context.Journeys.ToListAsync();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving journeys: {ex.Message}");
            }
        }

        // GET: api/Journey/5
        [HttpGet("{id}")]
        public async Task<ActionResult<Journey>> GetJourney(string id)
        {
            try
            {
                if (string.IsNullOrEmpty(id))
                {
                    return BadRequest("Journey ID is required");
                }

                var journey = await _context.Journeys.FindAsync(id);

                if (journey == null)
                {
                    return NotFound("Journey not found");
                }

                return journey;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving journey: {ex.Message}");
            }
        }
        
        // GET: api/Journey/user/1/product/abc-123
        [HttpGet("user/{userId}/product/{productId}")]
        public async Task<ActionResult<Journey>> GetJourneyByUserAndProduct(int userId, string productId)
        {
            try
            {
                var journey = await _context.Journeys
                    .Where(j => j.UserId == userId && j.ProductId == productId)
                    .FirstOrDefaultAsync();

                if (journey == null)
                {
                    return NotFound("No journey found for this user and product");
                }

                return journey;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving journey: {ex.Message}");
            }
        }

        // GET: api/Journey/product/{productId}/stats
        [HttpGet("product/{productId}/stats")]
        public async Task<ActionResult<object>> GetJourneyStatsByProduct(string productId)
        {
            try
            {
                // Check if product exists - Modified to handle potential missing Product table
                bool productExists = false;
                try
                {
                    productExists = await _context.Products.AnyAsync(p => p.Id == productId);
                }
                catch
                {
                    // If Products table doesn't exist or can't be queried, skip this check
                    productExists = true;
                }

                if (!productExists)
                {
                    return NotFound("Product not found");
                }

                var journeys = await _context.Journeys
                    .Where(j => j.ProductId == productId)
                    .ToListAsync();

                if (journeys == null || !journeys.Any())
                {
                    return NotFound("No journey data found for this product");
                }

                // Calculate averages and statistics safely
                var stats = new
                {
                    TotalJourneys = journeys.Count,
                    AverageOverallSatisfaction = journeys
                        .Where(j => j.OverallSatisfaction.HasValue)
                        .Select(j => (double?)j.OverallSatisfaction)
                        .DefaultIfEmpty(0)
                        .Average() ?? 0,
                    StageBreakdown = new
                    {
                        Awareness = journeys.Count(j => j.CurrentStage == "awareness"),
                        Consideration = journeys.Count(j => j.CurrentStage == "consideration"),
                        Purchase = journeys.Count(j => j.CurrentStage == "purchase"),
                        PostPurchase = journeys.Count(j => j.CurrentStage == "postPurchase"),
                        Support = journeys.Count(j => j.CurrentStage == "support")
                    },
                    RecommendationRate = journeys.Any(j => j.WouldRecommend.HasValue) 
                        ? (double)journeys.Count(j => j.WouldRecommend == true) / 
                          journeys.Count(j => j.WouldRecommend.HasValue) * 100
                        : 0,
                    KeyFeatures = new
                    {
                        SoundQuality = journeys.Count(j => j.KeyFeature_SoundQuality),
                        NoiseCancellation = journeys.Count(j => j.KeyFeature_NoiseCancellation),
                        BatteryLife = journeys.Count(j => j.KeyFeature_BatteryLife),
                        Comfort = journeys.Count(j => j.KeyFeature_Comfort),
                        Price = journeys.Count(j => j.KeyFeature_Price),
                        Brand = journeys.Count(j => j.KeyFeature_Brand),
                        Design = journeys.Count(j => j.KeyFeature_Design)
                    }
                };

                return Ok(stats);
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Error retrieving journey statistics: {ex.Message}");
            }
        }

        // PUT: api/Journey/5
        [HttpPut("{id}")]
        public async Task<IActionResult> PutJourney(string id, Journey journey)
        {
            if (id != journey.Id)
            {
                return BadRequest("Journey ID mismatch");
            }

            // Update the timestamp
            journey.UpdatedAt = DateTime.Now;

            _context.Entry(journey).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
                return NoContent();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!JourneyExists(id))
                {
                    return NotFound("Journey not found");
                }
                throw;
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Internal server error: {ex.Message}");
            }
        }

        // POST: api/Journey
        [HttpPost]
        public async Task<ActionResult<Journey>> PostJourney(Journey journey)
        {
            try
            {
                Console.WriteLine("Received POST request to create journey");
                
                if (journey == null)
                {
                    Console.WriteLine("Journey data is null");
                    return BadRequest("Journey data is required");
                }

                // Log all the properties to help diagnose issues
                Console.WriteLine($"Journey Details:");
                Console.WriteLine($"- ProductId: {journey.ProductId}");
                Console.WriteLine($"- UserId: {journey.UserId}");
                Console.WriteLine($"- CurrentStage: {journey.CurrentStage}");
                Console.WriteLine($"- Review: {journey.Review}");
                Console.WriteLine($"- OverallSatisfaction: {journey.OverallSatisfaction}");
                
                // Validation
                if (string.IsNullOrEmpty(journey.ProductId))
                {
                    Console.WriteLine("Product ID is missing");
                    return BadRequest("Product ID is required");
                }
                
                // Generate a new ID if one wasn't provided
                if (string.IsNullOrEmpty(journey.Id))
                {
                    journey.Id = Guid.NewGuid().ToString();
                    Console.WriteLine($"Generated new journey ID: {journey.Id}");
                }
                
                if (string.IsNullOrEmpty(journey.CurrentStage))
                {
                    journey.CurrentStage = "awareness";
                    Console.WriteLine("Set default current stage to 'awareness'");
                }
                
                // Set current date if not provided
                if (journey.CreatedAt == default)
                {
                    journey.CreatedAt = DateTime.Now;
                    Console.WriteLine($"Set CreatedAt to: {journey.CreatedAt}");
                }
                
                journey.UpdatedAt = DateTime.Now;
                Console.WriteLine($"Set UpdatedAt to: {journey.UpdatedAt}");
                
                // Add the entity to the context
                _context.Journeys.Add(journey);
                Console.WriteLine("Added journey to context");
                
                // Save changes to the database
                Console.WriteLine("Attempting to save changes to database...");
                int rowsAffected = await _context.SaveChangesAsync();
                Console.WriteLine($"SaveChangesAsync completed with {rowsAffected} rows affected");
                
                // Log successful save
                Console.WriteLine($"Journey saved successfully with ID: {journey.Id}");
                Console.WriteLine($"Review saved: {journey.Review}");
                
                // Return the created journey
                return CreatedAtAction("GetJourney", new { id = journey.Id }, journey);
            }
            catch (DbUpdateException ex)
            {
                // Log the details of the exception
                Console.WriteLine($"DbUpdateException: {ex.Message}");
                Console.WriteLine($"Inner exception: {ex.InnerException?.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                
                // If there are validation errors, log them
                if (ex.InnerException?.Message.Contains("constraint") == true)
                {
                    Console.WriteLine("Possible constraint violation");
                }
                
                if (JourneyExists(journey.Id))
                {
                    return Conflict("A journey with this ID already exists");
                }
                
                return StatusCode(500, $"Failed to create journey: {ex.Message}");
            }
            catch (Exception ex)
            {
                // Log the general exception
                Console.WriteLine($"Exception saving journey: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, $"Error creating journey: {ex.Message}");
            }
        }

        // DELETE: api/Journey/5
        [HttpDelete("{id}")]
        public async Task<IActionResult> DeleteJourney(string id)
        {
            if (string.IsNullOrEmpty(id))
            {
                return BadRequest("Journey ID is required");
            }

            try
            {
                var journey = await _context.Journeys.FindAsync(id);
                if (journey == null)
                {
                    return NotFound("Journey not found");
                }

                _context.Journeys.Remove(journey);
                await _context.SaveChangesAsync();

                return NoContent();
            }
            catch (Exception ex)
            {
                return StatusCode(500, $"Failed to delete journey: {ex.Message}");
            }
        }

        private bool JourneyExists(string id)
        {
            try
            {
                return id != null && _context.Journeys.Any(e => e.Id == id);
            }
            catch
            {
                // Log error but return false to avoid crashing
                Console.WriteLine("Error checking if journey exists");
                return false;
            }
        }
    }
}