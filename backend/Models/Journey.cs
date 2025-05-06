using System;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;
using System.ComponentModel;

namespace backend.Models
{
    public class Journey
    {
        [Key]
        [StringLength(36)]
        public string Id { get; set; }
        
        [Required]
        public int UserId { get; set; }
        
        [Required]
        [StringLength(36)]
        public string ProductId { get; set; }
        
        [Column(TypeName = "decimal(3,2)")]
        public decimal? OverallSatisfaction { get; set; }
        
        [Column(TypeName = "text")]
        public string Review { get; set; }
        
        [StringLength(50)]
        [DefaultValue("awareness")]
        public string CurrentStage { get; set; }
        
        [Required]
        public DateTime CreatedAt { get; set; }
        
        public DateTime? UpdatedAt { get; set; }
        
        [StringLength(100)]
        public string AwarenessSource { get; set; }
        
        [StringLength(100)]
        public string InitialImpression { get; set; }
        
        public int? AwarenessRating { get; set; }
        
        [Column(TypeName = "text")]
        public string AlternativesConsidered { get; set; }
        
        [DefaultValue(false)]
        public bool ResearchMethod_YouTube { get; set; }
        
        [DefaultValue(false)]
        public bool ResearchMethod_TechBlogs { get; set; }
        
        [DefaultValue(false)]
        public bool ResearchMethod_SocialMedia { get; set; }
        
        [DefaultValue(false)]
        public bool ResearchMethod_FriendsFamily { get; set; }
        
        [DefaultValue(false)]
        public bool ResearchMethod_InStore { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_SoundQuality { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_NoiseCancellation { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_BatteryLife { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_Comfort { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_Price { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_Brand { get; set; }
        
        [DefaultValue(false)]
        public bool KeyFeature_Design { get; set; }
        
        [StringLength(100)]
        public string PurchaseLocation { get; set; }
        
        [StringLength(100)]
        public string DecisionFactor { get; set; }
        
        [Column(TypeName = "decimal(10,2)")]
        public decimal? PurchasePrice { get; set; }
        
        [StringLength(100)]
        public string UsageFrequency { get; set; }
        
        public int? Satisfaction { get; set; }
        
        public bool? WouldRecommend { get; set; }
        
        [DefaultValue(false)]
        public bool ContactedSupport { get; set; }
        
        [StringLength(100)]
        public string ContactReason { get; set; }
        
        [StringLength(100)]
        public string ResponseTime { get; set; }
        
        public bool? IssueResolved { get; set; }
        
        public int? SupportSatisfaction { get; set; }
        
        [DefaultValue(false)]
        public bool AwarenessCompleted { get; set; }
        
        [DefaultValue(false)]
        public bool ConsiderationCompleted { get; set; }
        
        [DefaultValue(false)]
        public bool PurchaseCompleted { get; set; }
        
        [DefaultValue(false)]
        public bool PostPurchaseCompleted { get; set; }
        
        [DefaultValue(false)]
        public bool SupportCompleted { get; set; }
    }
}