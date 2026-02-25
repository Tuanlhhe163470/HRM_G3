using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace HRM_Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class SyncRecruitmentColumns : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "PublicHolidays");

            migrationBuilder.DropColumn(
                name: "Year",
                table: "PublicHolidays");

            migrationBuilder.RenameColumn(
                name: "MorningStart",
                table: "ShiftConfigs",
                newName: "StartTime");

            migrationBuilder.RenameColumn(
                name: "AfternoonEnd",
                table: "ShiftConfigs",
                newName: "EndTime");

            migrationBuilder.RenameColumn(
                name: "HolidayID",
                table: "PublicHolidays",
                newName: "Id");

            migrationBuilder.AddColumn<int>(
                name: "AllowedEarlyLeaveMinutes",
                table: "ShiftConfigs",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "BreakEndTime",
                table: "ShiftConfigs",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<TimeSpan>(
                name: "BreakStartTime",
                table: "ShiftConfigs",
                type: "time",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WorkDays",
                table: "ShiftConfigs",
                type: "nvarchar(20)",
                maxLength: 20,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AlterColumn<string>(
                name: "HolidayName",
                table: "PublicHolidays",
                type: "nvarchar(200)",
                maxLength: 200,
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(max)");

            migrationBuilder.AddColumn<int>(
                name: "HiredCount",
                table: "JobPostings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<int>(
                name: "Vacancies",
                table: "JobPostings",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<double>(
                name: "WorkingHours",
                table: "AttendanceLogs",
                type: "float",
                nullable: true,
                oldClrType: typeof(double),
                oldType: "float");

            migrationBuilder.AlterColumn<DateTime>(
                name: "CheckOutTime",
                table: "AttendanceLogs",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(TimeSpan),
                oldType: "time",
                oldNullable: true);

            migrationBuilder.AlterColumn<DateTime>(
                name: "CheckInTime",
                table: "AttendanceLogs",
                type: "datetime2",
                nullable: true,
                oldClrType: typeof(TimeSpan),
                oldType: "time",
                oldNullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CheckInIp",
                table: "AttendanceLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CheckOutIp",
                table: "AttendanceLogs",
                type: "nvarchar(50)",
                maxLength: 50,
                nullable: true);

            migrationBuilder.AddColumn<bool>(
                name: "IsSystemGenerated",
                table: "AttendanceLogs",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "AllowedEarlyLeaveMinutes",
                table: "ShiftConfigs");

            migrationBuilder.DropColumn(
                name: "BreakEndTime",
                table: "ShiftConfigs");

            migrationBuilder.DropColumn(
                name: "BreakStartTime",
                table: "ShiftConfigs");

            migrationBuilder.DropColumn(
                name: "WorkDays",
                table: "ShiftConfigs");

            migrationBuilder.DropColumn(
                name: "HiredCount",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "Vacancies",
                table: "JobPostings");

            migrationBuilder.DropColumn(
                name: "CheckInIp",
                table: "AttendanceLogs");

            migrationBuilder.DropColumn(
                name: "CheckOutIp",
                table: "AttendanceLogs");

            migrationBuilder.DropColumn(
                name: "IsSystemGenerated",
                table: "AttendanceLogs");

            migrationBuilder.RenameColumn(
                name: "StartTime",
                table: "ShiftConfigs",
                newName: "MorningStart");

            migrationBuilder.RenameColumn(
                name: "EndTime",
                table: "ShiftConfigs",
                newName: "AfternoonEnd");

            migrationBuilder.RenameColumn(
                name: "Id",
                table: "PublicHolidays",
                newName: "HolidayID");

            migrationBuilder.AlterColumn<string>(
                name: "HolidayName",
                table: "PublicHolidays",
                type: "nvarchar(max)",
                nullable: false,
                oldClrType: typeof(string),
                oldType: "nvarchar(200)",
                oldMaxLength: 200);

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "PublicHolidays",
                type: "datetime2",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<int>(
                name: "Year",
                table: "PublicHolidays",
                type: "int",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AlterColumn<double>(
                name: "WorkingHours",
                table: "AttendanceLogs",
                type: "float",
                nullable: false,
                defaultValue: 0.0,
                oldClrType: typeof(double),
                oldType: "float",
                oldNullable: true);

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "CheckOutTime",
                table: "AttendanceLogs",
                type: "time",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);

            migrationBuilder.AlterColumn<TimeSpan>(
                name: "CheckInTime",
                table: "AttendanceLogs",
                type: "time",
                nullable: true,
                oldClrType: typeof(DateTime),
                oldType: "datetime2",
                oldNullable: true);
        }
    }
}
