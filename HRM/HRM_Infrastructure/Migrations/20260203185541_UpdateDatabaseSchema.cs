using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateDatabaseSchema : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notifications_UserAccounts_UserID",
                table: "Notifications");

            migrationBuilder.DropForeignKey(
                name: "FK_ReviewDetails_Reviews_ReviewID",
                table: "ReviewDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Employees_EmployeeID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Employees_ManagerID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTrainings_Reviews_AssignedByReviewID",
                table: "UserTrainings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications");

            migrationBuilder.RenameTable(
                name: "Notifications",
                newName: "Notification");

            migrationBuilder.RenameIndex(
                name: "IX_Notifications_UserID",
                table: "Notification",
                newName: "IX_Notification_UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notification",
                table: "Notification",
                column: "NotificationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notification_UserAccounts_UserID",
                table: "Notification",
                column: "UserID",
                principalTable: "UserAccounts",
                principalColumn: "AccountID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReviewDetails_Reviews_ReviewID",
                table: "ReviewDetails",
                column: "ReviewID",
                principalTable: "Reviews",
                principalColumn: "ReviewID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Employees_EmployeeID",
                table: "Reviews",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Employees_ManagerID",
                table: "Reviews",
                column: "ManagerID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_UserTrainings_Reviews_AssignedByReviewID",
                table: "UserTrainings",
                column: "AssignedByReviewID",
                principalTable: "Reviews",
                principalColumn: "ReviewID",
                onDelete: ReferentialAction.SetNull);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Notification_UserAccounts_UserID",
                table: "Notification");

            migrationBuilder.DropForeignKey(
                name: "FK_ReviewDetails_Reviews_ReviewID",
                table: "ReviewDetails");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Employees_EmployeeID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_Reviews_Employees_ManagerID",
                table: "Reviews");

            migrationBuilder.DropForeignKey(
                name: "FK_UserTrainings_Reviews_AssignedByReviewID",
                table: "UserTrainings");

            migrationBuilder.DropPrimaryKey(
                name: "PK_Notification",
                table: "Notification");

            migrationBuilder.RenameTable(
                name: "Notification",
                newName: "Notifications");

            migrationBuilder.RenameIndex(
                name: "IX_Notification_UserID",
                table: "Notifications",
                newName: "IX_Notifications_UserID");

            migrationBuilder.AddPrimaryKey(
                name: "PK_Notifications",
                table: "Notifications",
                column: "NotificationID");

            migrationBuilder.AddForeignKey(
                name: "FK_Notifications_UserAccounts_UserID",
                table: "Notifications",
                column: "UserID",
                principalTable: "UserAccounts",
                principalColumn: "AccountID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_ReviewDetails_Reviews_ReviewID",
                table: "ReviewDetails",
                column: "ReviewID",
                principalTable: "Reviews",
                principalColumn: "ReviewID",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Employees_EmployeeID",
                table: "Reviews",
                column: "EmployeeID",
                principalTable: "Employees",
                principalColumn: "EmployeeID",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Reviews_Employees_ManagerID",
                table: "Reviews",
                column: "ManagerID",
                principalTable: "Employees",
                principalColumn: "EmployeeID");

            migrationBuilder.AddForeignKey(
                name: "FK_UserTrainings_Reviews_AssignedByReviewID",
                table: "UserTrainings",
                column: "AssignedByReviewID",
                principalTable: "Reviews",
                principalColumn: "ReviewID");
        }
    }
}
