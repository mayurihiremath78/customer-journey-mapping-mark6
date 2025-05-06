using Microsoft.AspNetCore.Mvc;
using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class SetupController : ControllerBase
    {
        private readonly AppDbContext _context;

        public SetupController(AppDbContext context)
        {
            _context = context;
        }

        [HttpGet("diagnostic")]
        public async Task<IActionResult> GetDiagnostic()
        {
            var productCount = await _context.Products.CountAsync();
            
            return Ok(new { 
                message = "Diagnostic information",
                productCount = productCount,
                databaseConnectionWorking = true
            });
        }

        [HttpGet("seed")]
        public async Task<IActionResult> SeedData()
        {
            try
            {
                // Check if products already exist
                if (await _context.Products.AnyAsync())
                {
                    return Ok(new { 
                        message = "Products already exist", 
                        count = await _context.Products.CountAsync()
                    });
                }

                // Add products
                var products = new List<Product>
                {
                    new Product
                    {
                        Id = "1",
                        Name = "AirPods Pro",
                        Brand = "Apple",
                        ImageUrl = "https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg",
                        Price = 249.00M,
                        AverageRating = 4.7,
                        Type = "In-ear"
                    },
                    new Product
                    {
                        Id = "2",
                        Name = "WH-1000XM4",
                        Brand = "Sony",
                        ImageUrl = "https://images.pexels.com/photos/577769/pexels-photo-577769.jpeg",
                        Price = 348.00M,
                        AverageRating = 4.8,
                        Type = "Over-ear"
                    },
                    new Product
                    {
                        Id = "3",
                        Name = "QuietComfort 45",
                        Brand = "Bose",
                        ImageUrl = "https://images.pexels.com/photos/3394660/pexels-photo-3394660.jpeg",
                        Price = 329.00M,
                        AverageRating = 4.6,
                        Type = "Over-ear"
                    },
                    new Product
                    {
                        Id = "4",
                        Name = "Momentum True Wireless 3",
                        Brand = "Sennheiser",
                        ImageUrl = "https://images.pexels.com/photos/6033978/pexels-photo-6033978.jpeg",
                        Price = 249.95M,
                        AverageRating = 4.4,
                        Type = "In-ear"
                    }
                };

                await _context.Products.AddRangeAsync(products);
                await _context.SaveChangesAsync();

                return Ok(new { 
                    message = "Database seeded with product data",
                    count = products.Count
                });
            }
            catch (Exception ex)
            {
                return StatusCode(500, new { 
                    message = "An error occurred while seeding the database", 
                    error = ex.Message 
                });
            }
        }
    }
}