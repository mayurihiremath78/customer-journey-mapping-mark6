using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Review
    {
        [Key]
        public int Id { get; set; }
        
        [Required]
        public string UserEmail { get; set; } = string.Empty;
        
        [Required]
        public string Body { get; set; } = string.Empty;
        
        public string UserImage { get; set; } = string.Empty;
        
        public int Rating { get; set; } = 4;
        
        public DateTime Date { get; set; } = DateTime.Now;
        
        public string ProductId { get; set; } = string.Empty;
    }
}