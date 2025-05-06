using System;
using System.ComponentModel.DataAnnotations;

namespace backend.Models
{
    public class Brand
    {
        [Key]
        [Required]
        public string Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        public string? Description { get; set; }
        
        public string? LogoUrl { get; set; }
        
        public int? YearFounded { get; set; }
        
        public string? CountryOfOrigin { get; set; }
        
        public string? Website { get; set; }
    }
}