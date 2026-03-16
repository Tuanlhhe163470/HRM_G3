using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddOfferAndOfferAllowanceSystem : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Applications_ApplicationID",
                table: "Offers");

            migrationBuilder.RenameColumn(
                name: "ApplicationID",
                table: "Offers",
                newName: "CandidateID");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_ApplicationID",
                table: "Offers",
                newName: "IX_Offers_CandidateID");

            migrationBuilder.AddColumn<DateTime>(
                name: "JoinDate",
                table: "Offers",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "Note",
                table: "Offers",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "OfferAllowance",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    OfferID = table.Column<int>(type: "int", nullable: false),
                    ComponentID = table.Column<int>(type: "int", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_OfferAllowance", x => x.Id);
                    table.ForeignKey(
                        name: "FK_OfferAllowance_Offers_OfferID",
                        column: x => x.OfferID,
                        principalTable: "Offers",
                        principalColumn: "OfferID",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_OfferAllowance_SalaryComponents_ComponentID",
                        column: x => x.ComponentID,
                        principalTable: "SalaryComponents",
                        principalColumn: "ComponentID",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_OfferAllowance_ComponentID",
                table: "OfferAllowance",
                column: "ComponentID");

            migrationBuilder.CreateIndex(
                name: "IX_OfferAllowance_OfferID",
                table: "OfferAllowance",
                column: "OfferID");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Candidates_CandidateID",
                table: "Offers",
                column: "CandidateID",
                principalTable: "Candidates",
                principalColumn: "CandidateID",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Offers_Candidates_CandidateID",
                table: "Offers");

            migrationBuilder.DropTable(
                name: "OfferAllowance");

            migrationBuilder.DropColumn(
                name: "JoinDate",
                table: "Offers");

            migrationBuilder.DropColumn(
                name: "Note",
                table: "Offers");

            migrationBuilder.RenameColumn(
                name: "CandidateID",
                table: "Offers",
                newName: "ApplicationID");

            migrationBuilder.RenameIndex(
                name: "IX_Offers_CandidateID",
                table: "Offers",
                newName: "IX_Offers_ApplicationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Offers_Applications_ApplicationID",
                table: "Offers",
                column: "ApplicationID",
                principalTable: "Applications",
                principalColumn: "ApplicationID",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
