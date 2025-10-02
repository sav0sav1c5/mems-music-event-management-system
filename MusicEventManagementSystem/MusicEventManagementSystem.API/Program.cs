using AutoMapper;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
<<<<<<< HEAD
using System.Text.Json.Serialization;
using MusicEventManagementSystem.API.Repositories;
using MusicEventManagementSystem.API.Repositories.IRepositories;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.IService;
using MusicEventManagementSystem.Data;
using MusicEventManagementSystem.Models.Auth;
using MusicEventManagementSystem.Services.Auth;
=======
using MusicEventManagementSystem.API.Services.Auth;
using MusicEventManagementSystem.API.Services.IServices.Auth;
using MusicEventManagementSystem.Core.Models.Entities.Auth;
using MusicEventManagementSystem.Infrastructure.Database;
using System.Text.Json.Serialization;
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Identity setup
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
}).AddEntityFrameworkStores<ApplicationDbContext>()
  .AddDefaultTokenProviders();

// 3. Add CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowReactApp", policy =>
    {
        policy.WithOrigins("http://localhost:5173", "https://localhost:5173", "https://localhost:7050")
              .AllowAnyHeader()
              .AllowAnyMethod()
              .AllowCredentials();
    });
});

// 4. Register Auth Service
builder.Services.AddScoped<IAuthService, AuthService>();

// 5. Configure Controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

<<<<<<< HEAD
builder.Services.AddAutoMapper(AppDomain.CurrentDomain.GetAssemblies());

builder.Services.AddControllers();
// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
=======
>>>>>>> fc7d1e8729b7d2d6668f9b466d7f35e20a9a6543
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Music Event Management - Auth API", Version = "v1" });
});

var app = builder.Build();

// Database seeding
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.Migrate();
        await MusicEventManagementSystem.Infrastructure.Database.Seeders.DatabaseSeeder.SeedAsync(context);
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while seeding Ticket Sales data.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Auth API v1"));
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();