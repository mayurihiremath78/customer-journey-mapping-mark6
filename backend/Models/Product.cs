using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel;

namespace backend.Models
{
    public class Product
    {
        [Key]
        [Required]
        [StringLength(255)]
        public string Id { get; set; }
        
        [Required]
        public string Name { get; set; }
        
        [Required]
        public string Brand { get; set; }
        
        [Required]
        public string ImageUrl { get; set; }
        
        [Required]
        [Column(TypeName = "decimal(18,2)")]
        public decimal Price { get; set; }
        
        [Required]
        public double AverageRating { get; set; }
        
        [Required]
        public string Type { get; set; }
        
        [StringLength(50)]
        public string SoundQuality { get; set; }
        
        public int? ComfortRating { get; set; }
        
        [StringLength(50)]
        public string Design { get; set; }
        
        [DefaultValue(false)]
        public bool WaterResistance { get; set; }
        
        [DefaultValue(false)]
        public bool Microphone { get; set; }
        
        [Column(TypeName = "decimal(5,2)")]
        public decimal? WeightGrams { get; set; }
    }
}