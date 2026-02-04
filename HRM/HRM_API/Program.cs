using AutoMapper;
using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Application.Mappings;
using HRM_Application.Services.PayRoll;
using HRM_Application.Services.TimeAttendance;
using HRM_Infrastructure.Data;
using HRM_Infrastructure.Repositories.PayRoll;
using HRM_Infrastructure.Repositories.TimeAttendance;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;

var builder = WebApplication.CreateBuilder(args);

builder.Services.AddControllers();

// Add services to the container.
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

// 1. Kết nối DB
builder.Services.AddDbContext<HRMDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("MyCon")));

// 2. Đăng ký AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// 3. Đăng ký Repository & Service
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<IPublicHolidayRepository, PublicHolidayRepository>();
builder.Services.AddScoped<IPublicHolidayService, PublicHolidaysService>();
builder.Services.AddScoped<ISalaryComponentRepository, SalaryComponentRepository>();

// 2. Add Service
builder.Services.AddScoped<ISalaryComponentService, SalaryComponentService>();

// 3. Add AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        builder =>
        {
            builder.AllowAnyOrigin()    // Cho phép mọi nguồn (Frontend nào cũng gọi được)
                   .AllowAnyMethod()    // Cho phép GET, POST, PUT, DELETE...
                   .AllowAnyHeader();   // Cho phép mọi Header
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

app.MapControllers();

var summaries = new[]
{
    "Freezing", "Bracing", "Chilly", "Cool", "Mild", "Warm", "Balmy", "Hot", "Sweltering", "Scorching"
};

app.MapGet("/weatherforecast", () =>
{
    var forecast = Enumerable.Range(1, 5).Select(index =>
        new WeatherForecast
        (
            DateOnly.FromDateTime(DateTime.Now.AddDays(index)),
            Random.Shared.Next(-20, 55),
            summaries[Random.Shared.Next(summaries.Length)]
        ))
        .ToArray();
    return forecast;
})
.WithName("GetWeatherForecast")
.WithOpenApi();

app.UseCors("AllowAll");

app.Run();

internal record WeatherForecast(DateOnly Date, int TemperatureC, string? Summary)
{
    public int TemperatureF => 32 + (int)(TemperatureC / 0.5556);
}
