using System;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using backend.Data;
using System.Security.Cryptography;
using System.Text;
using backend.Models;  // Add this import

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class AuthController : ControllerBase
    {
        private readonly AppDbContext _context;

        public AuthController(AppDbContext context)
        {
            _context = context;
        }

        [HttpPost("register")]
        public async Task<IActionResult> Register(RegisterModel model)
        {
            // Check if user already exists
            if (await _context.Users.AnyAsync(u => u.Email == model.Email))
            {
                return BadRequest(new { message = "Email is already registered" });
            }

            // Create password hash
            var passwordHash = HashPassword(model.Password);

            // Create user
            var user = new User
            {
                Name = model.Name,
                Email = model.Email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.Now,
                UpdatedAt = DateTime.Now,
                IsActive = true
            };

            _context.Users.Add(user);
            await _context.SaveChangesAsync();

            return Ok(new { message = "Registration successful" });
        }

        [HttpPost("login")]
        public async Task<IActionResult> Login(LoginModel model)
        {
            try
            {
                Console.WriteLine($"Login attempt for email: {model.Email}");
                
                var user = await _context.Users
                    .FirstOrDefaultAsync(u => u.Email == model.Email);

                if (user == null)
                {
                    Console.WriteLine("User not found with that email");
                    return BadRequest(new { message = "Invalid email or password" });
                }

                Console.WriteLine($"User found: ID={user.Id}, Name={user.Name}");
                
                // Hash the provided password for comparison
                string hashedInputPassword = HashPassword(model.Password);
                
                // Debug logging
                Console.WriteLine($"Input password (first few chars): {model.Password.Substring(0, Math.Min(3, model.Password.Length))}...");
                Console.WriteLine($"Input password hash: {hashedInputPassword}");
                Console.WriteLine($"Stored password hash: {user.PasswordHash}");
                Console.WriteLine($"Hash comparison result: {user.PasswordHash == hashedInputPassword}");

                // Compare the hashed password with the stored hash
                if (user.PasswordHash != hashedInputPassword)
                {
                    Console.WriteLine("Password mismatch");
                    return BadRequest(new { message = "Invalid email or password" });
                }

                Console.WriteLine("Login successful");
                
                // Return user data
                return Ok(new { 
                    id = user.Id,
                    name = user.Name,
                    email = user.Email,
                    image = user.Image
                });
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Login error: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Internal server error" });
            }
        }

        private string HashPassword(string password)
        {
            using var sha256 = SHA256.Create();
            var hashedBytes = sha256.ComputeHash(Encoding.UTF8.GetBytes(password));
            return Convert.ToBase64String(hashedBytes);
        }

        private bool VerifyPassword(string password, string storedHash)
        {
            var hashOfInput = HashPassword(password);
            return storedHash == hashOfInput;
        }

        [HttpPost("forgot-password")]
        public async Task<IActionResult> ForgotPassword(ForgotPasswordModel model)
        {
            // In a real app, this would send an email with reset link
            // For demo purposes, we'll just check if the user exists
            var user = await _context.Users.FirstOrDefaultAsync(u => u.Email == model.Email);
            
            if (user == null)
            {
                // Don't reveal that the user doesn't exist
                return Ok(new { message = "If your email is registered, you will receive a password reset link" });
            }

            // Generate token
            var token = Guid.NewGuid().ToString();
            
            // Save token to database
            var resetToken = new PasswordResetToken
            {
                UserId = user.Id,
                Token = token,
                ExpiresAt = DateTime.Now.AddHours(24),
                IsUsed = false,
                CreatedAt = DateTime.Now
            };

            _context.PasswordResetTokens.Add(resetToken);
            await _context.SaveChangesAsync();

            // In a real app, send email with reset link
            // For demo, just return success
            return Ok(new { message = "Password reset link has been sent to your email" });
        }

        [HttpGet("test-hash")]
        public IActionResult TestHash(string input)
        {
            if (string.IsNullOrEmpty(input))
            {
                return BadRequest("Input string is required");
            }
            
            string hash1 = HashPassword(input);
            string hash2 = HashPassword(input);
            
            return Ok(new {
                input = input,
                hash1 = hash1,
                hash2 = hash2,
                areEqual = hash1 == hash2
            });
        }
    }

    public class RegisterModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class LoginModel
    {
        public string Email { get; set; }
        public string Password { get; set; }
    }

    public class ForgotPasswordModel
    {
        public string Email { get; set; }
    }
}
