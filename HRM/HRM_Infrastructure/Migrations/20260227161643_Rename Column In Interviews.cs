using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class RenameColumnInInterviews : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Interviews_Applications_ApplicationID",
                table: "Interviews");

            migrationBuilder.RenameColumn(
                name: "ApplicationID",
                table: "Interviews",
                newName: "CandidateID");

            migrationBuilder.RenameIndex(
                name: "IX_Interviews_ApplicationID",
                table: "Interviews",
                newName: "IX_Interviews_CandidateID");

            migrationBuilder.AddForeignKey(
                name: "FK_Interviews_Candidates_CandidateID",
                table: "Interviews",
                column: "CandidateID",
                principalTable: "Candidates",
                principalColumn: "CandidateID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Interviews_Candidates_CandidateID",
                table: "Interviews");

            migrationBuilder.RenameColumn(
                name: "CandidateID",
                table: "Interviews",
                newName: "ApplicationID");

            migrationBuilder.RenameIndex(
                name: "IX_Interviews_CandidateID",
                table: "Interviews",
                newName: "IX_Interviews_ApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Interviews_Applications_ApplicationID",
                table: "Interviews",
                column: "ApplicationID",
                principalTable: "Applications",
                principalColumn: "ApplicationID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
