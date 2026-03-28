using HRM_Application.Contracts.Repositories;
using HRM_Application.Contracts.Services;
using HRM_Infrastructure.Extensions;
using HRM_Infrastructure.Repositories.TimeAttendance;
using HRM_Application.Services.TimeAttendance;
using HRM_Infrastructure.Repositories.PayRoll;
using HRM_Application.Services.PayRoll;
using HRM_Infrastructure.Repositories.Recruitment;
using Microsoft.OpenApi.Models;
using Microsoft.AspNetCore.StaticFiles;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.Extensions.FileProviders;
using System.Text;
using System.IO;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);
var provider = new FileExtensionContentTypeProvider();
provider.Mappings[".pdf"] = "application/pdf"; // Ép kiểu định dạng PDF
// 1. Cấu hình JWT Authentication
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

// 2. Add services to the container.
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    }); builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo { Title = "HRM G3 API", Version = "v1" });

    c.AddSecurityDefinition("Bearer", new OpenApiSecurityScheme
    {
        Description = "Dán chuỗi Token của bạn vào đây (Ví dụ: Bearer abcxyz)",
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
                Reference = new OpenApiReference { Type = ReferenceType.SecurityScheme, Id = "Bearer" }
            },
            new string[] {}
        }
    });
});

// 3. Đăng ký Infrastructure và các Service/Repository
builder.Services.AddInfrastructure(builder.Configuration);

builder.Services.AddScoped<IShiftRepository, ShiftRepository>();
builder.Services.AddScoped<IShiftService, ShiftService>();
builder.Services.AddScoped<IPublicHolidayRepository, PublicHolidayRepository>();
builder.Services.AddScoped<IPublicHolidayService, PublicHolidaysService>();
builder.Services.AddScoped<ISalaryComponentRepository, SalaryComponentRepository>();
builder.Services.AddScoped<ISalaryComponentService, SalaryComponentService>();

// 4. Add AutoMapper
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

// 5. Cấu hình CORS
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

// --- CẤU HÌNH HTTP REQUEST PIPELINE ---

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();

// 1. Kích hoạt Static Files mặc định để đọc mọi thứ trong wwwroot

app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(
        Path.Combine(builder.Environment.ContentRootPath, "wwwroot")), // Chỉ định rõ đường dẫn vật lý
    RequestPath = "",
    ContentTypeProvider = provider,
    OnPrepareResponse = ctx =>
    {
        // Cho phép trình duyệt xem file trực tiếp thay vì tải về
        ctx.Context.Response.Headers.Append("Access-Control-Allow-Origin", "*");
        ctx.Context.Response.Headers.Append("Content-Disposition", "inline");
    }
});
// 2. Thứ tự Middleware quan trọng
app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();