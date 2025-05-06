using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;
using backend.Data;
using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers
{
    [ApiController]
    [Route("api/[controller]")]
    public class UsersController : ControllerBase
    {
        private readonly AppDbContext _context;

        public UsersController(AppDbContext context)
        {
            _context = context;
        }

        // ADD THIS NEW METHOD: Get all users
        // GET: api/Users
        [HttpGet]
        public async Task<ActionResult<IEnumerable<object>>> GetUsers()
        {
            try
            {
                Console.WriteLine("Fetching all users");
                var users = await _context.Users.ToListAsync();
                Console.WriteLine($"Found {users.Count} users");
                
                var userDtos = users.Select(u => new { 
                    id = u.Id, 
                    email = u.Email, 
                    name = u.Name,
                    image = u.Image ?? "",
                    createdAt = u.CreatedAt,
                    isActive = u.IsActive
                }).ToList();
                
                return Ok(userDtos);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching users: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Failed to retrieve users" });
            }
        }
        
        // ADD THIS NEW METHOD: Get user by ID
        // GET: api/Users/5
        [HttpGet("{id}")]
        public async Task<ActionResult<object>> GetUser(int id)
        {
            try
            {
                Console.WriteLine($"Fetching user with ID: {id}");
                var user = await _context.Users.FindAsync(id);

                if (user == null)
                {
                    Console.WriteLine($"User with ID {id} not found");
                    return NotFound(new { message = "User not found" });
                }

                return Ok(new { 
                    id = user.Id, 
                    email = user.Email, 
                    name = user.Name,
                    image = user.Image ?? "",
                    createdAt = user.CreatedAt,
                    isActive = user.IsActive
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error fetching user {id}: {ex.Message}");
                return StatusCode(500, new { message = "Failed to retrieve user" });
            }
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginModel model)
        {
            try
            {
                Console.WriteLine($"Login attempt for email: {model.Email}");
                
                if (string.IsNullOrEmpty(model.Email) || string.IsNullOrEmpty(model.Password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }

                var user = await _context.Users
                    .AsNoTracking()
                    .FirstOrDefaultAsync(u => u.Email == model.Email);

                if (user == null)
                {
                    Console.WriteLine("User not found with that email");
                    return BadRequest(new { message = "Invalid email or password" });
                }

                Console.WriteLine($"User found: ID={user.Id}, Name={user.Name}");
                
                if (string.IsNullOrEmpty(user.PasswordHash))
                {
                    Console.WriteLine("User has null password hash in database");
                    return BadRequest(new { message = "Account setup incomplete. Please reset your password." });
                }
                
                string hashedInputPassword = HashPassword(model.Password);
                
                Console.WriteLine($"Input password hash: {hashedInputPassword}");
                Console.WriteLine($"Stored password hash: {user.PasswordHash}");
                Console.WriteLine($"Hash comparison result: {user.PasswordHash == hashedInputPassword}");
                
                if (user.PasswordHash != hashedInputPassword)
                {
                    Console.WriteLine("Password mismatch");
                    return BadRequest(new { message = "Invalid email or password" });
                }

                Console.WriteLine("Login successful");
                
                return Ok(new { 
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    image = user.Image ?? ""
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        [HttpGet("create-test-user")]
        public async Task<IActionResult> CreateTestUser(string email, string password, string name)
        {
            try {
                if (string.IsNullOrEmpty(email) || string.IsNullOrEmpty(password))
                {
                    return BadRequest(new { message = "Email and password are required" });
                }
                
                if (await _context.Users.AnyAsync(u => u.Email == email))
                {
                    return BadRequest(new { message = "Email is already registered" });
                }

                var passwordHash = HashPassword(password);

                var user = new User
                {
                    Name = name ?? "Test User",
                    Email = email,
                    PasswordHash = passwordHash,
                    CreatedAt = DateTime.Now,
                    UpdatedAt = DateTime.Now,
                    IsActive = true,
                    Image = null
                };

                _context.Users.Add(user);
                await _context.SaveChangesAsync();

                return Ok(new { message = "Test user created", email = email });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Error creating test user: {ex.Message}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private string HashPassword(string password)
        {
            using (var sha256 = SHA256.Create())
            {
                var bytes = Encoding.UTF8.GetBytes(password);
                var hash = sha256.ComputeHash(bytes);
                return Convert.ToBase64String(hash);
            }
        }
    }
}