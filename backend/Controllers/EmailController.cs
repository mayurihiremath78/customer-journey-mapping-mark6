using System;
using System.Net;
using System.Net.Mail;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace backend.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class EmailController : ControllerBase
    {
        private readonly IConfiguration _configuration;
        private readonly ILogger<EmailController> _logger;

        public EmailController(IConfiguration configuration, ILogger<EmailController> logger)
        {
            _configuration = configuration;
            _logger = logger;
        }

        [HttpPost("send-welcome")]
        public async Task<IActionResult> SendWelcomeEmail([FromBody] WelcomeEmailModel model)
        {
            try
            {
                if (string.IsNullOrEmpty(model.Email))
                {
                    return BadRequest(new { message = "Email address is required" });
                }

                if (string.IsNullOrEmpty(model.Name))
                {
                    return BadRequest(new { message = "Name is required" });
                }

                _logger.LogInformation($"Preparing to send welcome email to {model.Email}");
                
                // Get email configuration
                string smtpServer = _configuration["Email:SmtpServer"];
                int smtpPort = int.Parse(_configuration["Email:SmtpPort"]);
                string username = _configuration["Email:Username"];
                string password = _configuration["Email:Password"]; // Keep spaces as-is
                string senderEmail = _configuration["Email:SenderEmail"];
                string senderName = _configuration["Email:SenderName"];

                _logger.LogInformation($"Using SMTP server: {smtpServer}:{smtpPort}");
                _logger.LogInformation($"Sender: {senderName} <{senderEmail}>");
                
                // Create the email message
                var message = new MailMessage
                {
                    From = new MailAddress(senderEmail, senderName),
                    Subject = "Welcome to TuneTravel - Your Account Details",
                    IsBodyHtml = true,
                    Body = $@"
                    <html>
                    <head>
                        <style>
                            body {{ font-family: Arial, sans-serif; line-height: 1.6; color: #333; }}
                            .container {{ max-width: 600px; margin: 0 auto; padding: 20px; }}
                            .header {{ background-color: #4f46e5; padding: 20px; text-align: center; color: white; }}
                            .content {{ padding: 20px; border: 1px solid #ddd; }}
                            .footer {{ text-align: center; margin-top: 20px; font-size: 12px; color: #666; }}
                            .credentials {{ background-color: #f8f9fa; padding: 15px; margin: 15px 0; border-left: 4px solid #4f46e5; }}
                        </style>
                    </head>
                    <body>
                        <div class='container'>
                            <div class='header'>
                                <h1>Welcome to TuneTravel!</h1>
                            </div>
                            <div class='content'>
                                <p>Hello {WebUtility.HtmlEncode(model.Name)},</p>
                                <p>Thank you for registering with TuneTravel. Your account has been created successfully.</p>
                                <p>Here are your login credentials:</p>
                                <div class='credentials'>
                                    <p><strong>Email:</strong> {WebUtility.HtmlEncode(model.Email)}</p>
                                    <p><strong>Password:</strong> {WebUtility.HtmlEncode(model.Password)}</p>
                                </div>
                                <p>Please keep this information secure. We recommend changing your password after your first login.</p>
                                <p>You can log in now at: <a href='http://localhost:5173/login'>TuneTravel Login</a></p>
                                <p>Enjoy exploring music with TuneTravel!</p>
                            </div>
                            <div class='footer'>
                                <p>This email was sent automatically. Please do not reply.</p>
                                <p>&copy; {DateTime.Now.Year} TuneTravel. All rights reserved.</p>
                            </div>
                        </div>
                    </body>
                    </html>"
                };
                
                message.To.Add(new MailAddress(model.Email, model.Name));

                _logger.LogInformation("Email message created, setting up SMTP client");

                // Configure and send using SmtpClient
                using (var client = new SmtpClient())
                {
                    client.Host = smtpServer;
                    client.Port = smtpPort;
                    client.EnableSsl = true;
                    client.DeliveryMethod = SmtpDeliveryMethod.Network;
                    client.UseDefaultCredentials = false; // Must be false for Gmail
                    client.Credentials = new NetworkCredential(username, password);
                    client.Timeout = 30000; // 30 seconds
                    
                    _logger.LogInformation("Sending email...");
                    
                    try
                    {
                        await client.SendMailAsync(message);
                        _logger.LogInformation($"Welcome email sent successfully to {model.Email}");
                        return Ok(new { message = "Welcome email sent successfully" });
                    }
                    catch (SmtpException smtpEx)
                    {
                        _logger.LogError($"SMTP error: {smtpEx.Message}, Status code: {smtpEx.StatusCode}");
                        _logger.LogError($"SMTP error details: {smtpEx.StackTrace}");
                        return StatusCode(500, new { message = "Failed to send email", error = smtpEx.Message });
                    }
                }
            }
            catch (Exception ex)
            {
                _logger.LogError($"Error sending welcome email: {ex.Message}");
                _logger.LogError($"Stack trace: {ex.StackTrace}");
                return StatusCode(500, new { message = "Failed to send welcome email", error = ex.Message });
            }
        }

        // Test endpoint to verify controller is working
        [HttpGet("test")]
        public IActionResult Test()
        {
            return Ok(new { 
                message = "Email controller is working", 
                email = new {
                    server = _configuration["Email:SmtpServer"],
                    port = _configuration["Email:SmtpPort"],
                    username = _configuration["Email:Username"],
                    hasPassword = !string.IsNullOrEmpty(_configuration["Email:Password"]),
                    sender = _configuration["Email:SenderEmail"]
                }
            });
        }
    }

    public class WelcomeEmailModel
    {
        public string Name { get; set; }
        public string Email { get; set; }
        public string Password { get; set; }
    }
}