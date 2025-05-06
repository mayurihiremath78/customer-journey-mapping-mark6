using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddJourneysTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "Journeys",
                columns: table => new
                {
                    Id = table.Column<string>(type: "varchar(36)", maxLength: 36, nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    ProductId = table.Column<string>(type: "varchar(36)", maxLength: 36, nullable: false),
                    OverallSatisfaction = table.Column<decimal>(type: "decimal(3,2)", nullable: true),
                    Review = table.Column<string>(type: "text", nullable: false),
                    CurrentStage = table.Column<string>(type: "varchar(50)", maxLength: 50, nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: false),
                    UpdatedAt = table.Column<DateTime>(type: "datetime(6)", nullable: true),
                    AwarenessSource = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    InitialImpression = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    AwarenessRating = table.Column<int>(type: "int", nullable: true),
                    AlternativesConsidered = table.Column<string>(type: "text", nullable: false),
                    ResearchMethod_YouTube = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ResearchMethod_TechBlogs = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ResearchMethod_SocialMedia = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ResearchMethod_FriendsFamily = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ResearchMethod_InStore = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_SoundQuality = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_NoiseCancellation = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_BatteryLife = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_Comfort = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_Price = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_Brand = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    KeyFeature_Design = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PurchaseLocation = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    DecisionFactor = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    PurchasePrice = table.Column<decimal>(type: "decimal(10,2)", nullable: true),
                    UsageFrequency = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    Satisfaction = table.Column<int>(type: "int", nullable: true),
                    WouldRecommend = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    UserReview = table.Column<string>(type: "text", nullable: false),
                    ContactedSupport = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ContactReason = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    ResponseTime = table.Column<string>(type: "varchar(100)", maxLength: 100, nullable: false),
                    IssueResolved = table.Column<bool>(type: "tinyint(1)", nullable: true),
                    SupportSatisfaction = table.Column<int>(type: "int", nullable: true),
                    AwarenessCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    ConsiderationCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PurchaseCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    PostPurchaseCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false),
                    SupportCompleted = table.Column<bool>(type: "tinyint(1)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Journeys", x => x.Id);
                })
                .Annotation("MySQL:Charset", "utf8mb4");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Journeys");
        }
    }
}
