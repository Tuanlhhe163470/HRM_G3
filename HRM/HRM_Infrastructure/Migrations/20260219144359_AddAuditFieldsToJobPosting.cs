using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddAuditFieldsToJobPosting : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceGoals_Employees_EmployeeID",
                table: "PerformanceGoals");

            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceGoals_ReviewCycles_CycleID",
                table: "PerformanceGoals");

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeID",
                table: "PerformanceGoals",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AlterColumn<int>(
                name: "CycleID",
                table: "PerformanceGoals",
                type: "int",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "int");

            migrationBuilder.AddColumn<DateTime>(
                name: "ExpiryDate",
                table: "JobPostings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "UpdatedAt",
                table: "JobPostings",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceGoals_Employees_EmployeeID",
                table: "PerformanceGoals",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceGoals_ReviewCycles_CycleID",
                table: "PerformanceGoals",
                column: "CycleID",
                principalTable: "ReviewCycles",
                principalColumn: "CycleID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceGoals_Employees_EmployeeID",
                table: "PerformanceGoals");

            migrationBuilder.DropForeignKey(
                name: "FK_PerformanceGoals_ReviewCycles_CycleID",
                table: "PerformanceGoals");

            migrationBuilder.DropColumn(
                name: "ExpiryDate",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "UpdatedAt",
                table: "JobPostings");

            migrationBuilder.AlterColumn<int>(
                name: "EmployeeID",
                table: "PerformanceGoals",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AlterColumn<int>(
                name: "CycleID",
                table: "PerformanceGoals",
                type: "int",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "int",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceGoals_Employees_EmployeeID",
                table: "PerformanceGoals",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PerformanceGoals_ReviewCycles_CycleID",
                table: "PerformanceGoals",
                column: "CycleID",
                principalTable: "ReviewCycles",
                principalColumn: "CycleID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
