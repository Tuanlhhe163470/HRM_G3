using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddJobIdToCandidate : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "JobID",
                table: "Candidates",
                type: "int",
                nullable: true);
  

            migrationBuilder.CreateIndex(
                name: "IX_Candidates_JobID",
                table: "Candidates",
                column: "JobID");

            migrationBuilder.AddForeignKey(
                name: "FK_Candidates_JobPostings_JobID",
                table: "Candidates",
                column: "JobID",
                principalTable: "JobPostings",
                principalColumn: "JobID",
              onDelete: ReferentialAction.NoAction);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Candidates_JobPostings_JobID",
                table: "Candidates");

            migrationBuilder.DropIndex(
                name: "IX_Candidates_JobID",
                table: "Candidates");

            migrationBuilder.DropColumn(
                name: "JobID",
                table: "Candidates");
        }
    }
}
