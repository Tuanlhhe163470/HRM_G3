using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateHolidayRange : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "HolidayName",
                table: "PublicHolidays",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "HolidayName",
                table: "PublicHolidays");
        }
    }
}
