using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.Core.Interfaces.Repositories;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.Auth;
using MusicEventManagementSystem.Infrastructure.Database;
using MusicEventManagementSystem.Infrastructure.Repositories;
using MusicEventManagementSystem.MediaCampaign.API.Services;
using System.Text.Json.Serialization;

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

// 4. Register Repositories - Media Campaign
builder.Services.AddScoped<ICampaignRepository, CampaignRepository>();
builder.Services.AddScoped<IAdTypeRepository, AdTypeRepository>();
builder.Services.AddScoped<IMediaWorkflowRepository, MediaWorkflowRepository>();
builder.Services.AddScoped<IMediaTaskRepository, MediaTaskRepository>();
builder.Services.AddScoped<IAdRepository, AdRepository>();
builder.Services.AddScoped<IMediaVersionRepository, MediaVersionRepository>();
builder.Services.AddScoped<IMediaChannelRepository, MediaChannelRepository>();
builder.Services.AddScoped<IApprovalRepository, ApprovalRepository>();

// 5. Register Services - Media Campaign
builder.Services.AddScoped<ICampaignService, CampaignService>();
builder.Services.AddScoped<IAdTypeService, AdTypeService>();
builder.Services.AddScoped<IMediaWorkflowService, MediaWorkflowService>();
builder.Services.AddScoped<IMediaTaskService, MediaTaskService>();
builder.Services.AddScoped<IAdService, AdService>();
builder.Services.AddScoped<IMediaVersionService, MediaVersionService>();
builder.Services.AddScoped<IMediaChannelService, MediaChannelService>();
builder.Services.AddScoped<IApprovalService, ApprovalService>();

// 6. Configure Controllers with JSON options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Music Event Management - Media Campaign API", Version = "v1" });
});

var app = builder.Build();

// Database seeding - Media Campaign
//using (var scope = app.Services.CreateScope())
//{
//    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
//    try
//    {
//        context.Database.Migrate();
//        await MusicEventManagementSystem.Infrastructure.Database.Seeders.MediaCampaignSeeder.SeedAsync(context);
//    }
//    catch (Exception ex)
//    {
//        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
//        logger.LogError(ex, "An error occurred while seeding Media Campaign data.");
//    }
//}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Media Campaign API v1"));
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();