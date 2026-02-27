using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStatusToCandidate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            //migrationBuilder.AddColumn<decimal>(
            //    name: "SalaryMax",
            //    table: "JobPostings",
            //    type: "decimal(18,2)",
            //    nullable: true);

            //migrationBuilder.AddColumn<decimal>(
            //    name: "SalaryMin",
            //    table: "JobPostings",
            //    type: "decimal(18,2)",
            //    nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Candidates",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "Candidates",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "Candidates",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_JobPostings_UserAccounts_CreatedBy",
                table: "JobPostings",
                column: "CreatedBy",
                principalTable: "UserAccounts",
                principalColumn: "AccountID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_JobPostings_UserAccounts_CreatedBy",
                table: "JobPostings");

            //migrationBuilder.DropColumn(
            //    name: "SalaryMax",
            //    table: "JobPostings");

            //migrationBuilder.DropColumn(
            //    name: "SalaryMin",
            //    table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "Candidates");
        }
    }
}
