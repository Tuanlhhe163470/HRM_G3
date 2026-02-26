using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Infrastructure.Extensions;
using HRM_Infrastructure.Repositories.TimeAttendance;
using HRM_Application.Services.TimeAttendance;
using HRM_Infrastructure.Repositories.PayRoll;
using HRM_Application.Services.PayRoll;
using HRM_Infrastructure.Repositories.Recruitment;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.Authentication.JwtBearer; // <--- THÊM MỚI
using Microsoft.IdentityModel.Tokens; // <--- THÊM MỚI
using System.Text; // <--- THÊM MỚI

var builder = WebApplication.CreateBuilder(args);

// 1. Cấu hình JWT Authentication (THÊM MỚI)
// Đoạn này giúp ứng dụng hiểu cách giải mã và kiểm tra tính hợp lệ của Token từ appsettings.json
builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = builder.Configuration["Jwt:Issuer"],
        ValidAudience = builder.Configuration["Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Jwt:Key"]!))
    };
});

// Add services to the container.
builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRM G3 API", Version = "v1" });

    // Cấu hình nút Authorize
    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Dán chuỗi Token của bạn vào đây",
        Name = "Authorization",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "Bearer",
        BearerFormat = "JWT"
    });

    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        {
            new OpenApiSecurityScheme
            {
                Reference = new OpenApiReference
                {
                    Type = ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

// --- GỌI HÀM EXTENSION ĐỂ ĐĂNG KÝ SERVICE ---
builder.Services.AddInfrastructure(builder.Configuration);

// Đăng ký các Service khác
builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<IPublicHolidayRepository, PublicHolidayRepository>();
builder.Services.AddScoped<IPublicHolidayService, PublicHolidaysService>();
builder.Services.AddScoped<ISalaryComponentRepository, SalaryComponentRepository>();
builder.Services.AddScoped<ISalaryComponentService, SalaryComponentService>();

// 3. Add AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// Cấu hình CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll",
        b =>
        {
            b.AllowAnyOrigin()
             .AllowAnyMethod()
             .AllowAnyHeader()
            .WithExposedHeaders("Content-Disposition");
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

// --- THỨ TỰ MIDDLEWARE QUAN TRỌNG (CẬP NHẬT TẠI ĐÂY) ---
app.UseCors("AllowAll");
app.UseStaticFiles();
app.UseAuthentication(); // 1. Xác thực: "Bạn là ai?" (PHẢI CÓ)
app.UseAuthorization();  // 2. Phân quyền: "Bạn có quyền làm gì?" (PHẢI CÓ)

app.MapControllers();

app.Run();