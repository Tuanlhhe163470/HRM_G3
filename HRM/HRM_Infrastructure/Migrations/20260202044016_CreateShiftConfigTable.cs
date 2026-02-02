using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class CreateShiftConfigTable : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ShiftConfigs",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    ShiftName = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    MorningStart = table.Column<TimeSpan>(type: "time", nullable: false),
                    AfternoonEnd = table.Column<TimeSpan>(type: "time", nullable: false),
                    AllowedLateMinutes = table.Column<int>(type: "int", nullable: false),
                    IsActive = table.Column<bool>(type: "bit", nullable: false),
                    CreatedAt = table.Column<DateTime>(type: "datetime2", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ShiftConfigs", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ShiftConfigs");
        }
    }
}
