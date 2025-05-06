using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace backend.Migrations
{
    /// <inheritdoc />
    public partial class AddProductsTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            // Skip creating Users table since it already exists
            // Instead, use raw SQL to create the Products table safely
            migrationBuilder.Sql(@"
                CREATE TABLE IF NOT EXISTS `Products` (
                    `Id` varchar(255) NOT NULL,
                    `Name` longtext NOT NULL,
                    `Brand` longtext NOT NULL,
                    `ImageUrl` longtext NOT NULL,
                    `Price` decimal(18,2) NOT NULL,
                    `AverageRating` double NOT NULL,
                    `Type` longtext NOT NULL,
                    PRIMARY KEY (`Id`)
                );
            ");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.Sql("DROP TABLE IF EXISTS `Products`;");
        }
    }
}
