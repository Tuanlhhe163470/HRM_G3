using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.Services.TimeAttendance;
using HRM_Infrastructure.Data;
using HRM_Infrastructure.Extensions; // <--- BẮT BUỘC PHẢI CÓ
using HRM_Infrastructure.Repositories.TimeAttendance;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// --- QUAN TRỌNG: GỌI HÀM EXTENSION ĐỂ ĐĂNG KÝ SERVICE ---
// Dòng này sẽ tự động đăng ký: DbContext, AutoMapper, PerformanceGoalRepository, GoalService...
builder.Services.AddInfrastructure(builder.Configuration); 

// Đăng ký các Service khác chưa có trong Extension (nếu cần)
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IShiftService, ShiftService>();

builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b =>
        {
            b.AllowAnyOrigin()
             .AllowAnyMethod()
             .AllowAnyHeader();
        });
});

var app = builder.Build();

// Configure the HTTP request pipeline.
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

app.UseCors("AllowAll");

app.MapControllers();

app.Run();