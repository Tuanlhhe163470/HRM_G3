using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddShiftIdToOvertime : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "ShiftId",
                table: "OvertimeRequests",
                type: "int",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_OvertimeRequests_ShiftId",
                table: "OvertimeRequests",
                column: "ShiftId");

            migrationBuilder.AddForeignKey(
                name: "FK_OvertimeRequests_ShiftConfigs_ShiftId",
                table: "OvertimeRequests",
                column: "ShiftId",
                principalTable: "ShiftConfigs",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_OvertimeRequests_ShiftConfigs_ShiftId",
                table: "OvertimeRequests");

            migrationBuilder.DropIndex(
                name: "IX_OvertimeRequests_ShiftId",
                table: "OvertimeRequests");

            migrationBuilder.DropColumn(
                name: "ShiftId",
                table: "OvertimeRequests");
        }
    }
}
