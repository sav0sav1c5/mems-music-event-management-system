using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.Auth;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.IServices.Auth;
using MusicEventManagementSystem.API.Services.Proxies;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Models.Entities.Auth;
using MusicEventManagementSystem.Infrastructure.Database;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext with PostgreSQL (only for Auth)
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
        policy.WithOrigins(
            "http://localhost:5173",   // Vite default
            "https://localhost:5173",
            "http://localhost:3000",   // Create React App default
            "https://localhost:3000",
            "https://localhost:7050"   // Alternative frontend port
        )
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials();
    });
});

// 4. Register HttpClient services for microservices communication\
builder.Services.AddHttpClient("TicketSalesAPI", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["MicroserviceUrls:TicketSales"] ?? "https://localhost:7011");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddHttpClient("EventOrganizationAPI", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["MicroserviceUrls:EventOrganization"] ?? "https://localhost:7021");
    client.Timeout = TimeSpan.FromSeconds(30);
});

builder.Services.AddHttpClient("PerformerCommunicationAPI", client =>
{
    client.BaseAddress = new Uri(builder.Configuration["MicroserviceUrls:PerformerCommunication"] ?? "https://localhost:7041");
    client.Timeout = TimeSpan.FromSeconds(30);
});

// 5. Register Gateway-specific services (Auth + Client-facing orchestration)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientEventService, ClientEventService>();
builder.Services.AddScoped<IClientPerformerService, ClientPerformerService>();
builder.Services.AddScoped<IClientVenueService, ClientVenueService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// 6. Register HTTP proxy services for EventOrganization microservice
builder.Services.AddScoped<IEventService, EventProxyService>();
builder.Services.AddScoped<IPerformanceService, PerformanceProxyService>();

// 7. Register HTTP proxy services for TicketSales microservice
builder.Services.AddScoped<IVenueService, VenueProxyService>();
builder.Services.AddScoped<IZoneService, ZoneProxyService>();
builder.Services.AddScoped<ITicketTypeService, TicketTypeProxyService>();
builder.Services.AddScoped<ITicketService, TicketProxyService>();
builder.Services.AddScoped<ISpecialOfferService, SpecialOfferProxyService>();
builder.Services.AddScoped<IRecordedSaleService, RecordedSaleProxyService>();

// 8. Register HTTP proxy services for PerformerCommunication microservice
builder.Services.AddScoped<IPerformerService, PerformerProxyService>();

// 9. Configure Controllers with JSON options
builder.Services.AddControllers()
    .ConfigureApplicationPartManager(manager =>
    {
        // Only load controllers from Gateway API assembly
        manager.ApplicationParts.Clear();
        manager.ApplicationParts.Add(new Microsoft.AspNetCore.Mvc.ApplicationParts.AssemblyPart(typeof(Program).Assembly));
    })
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
    });

builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new() { Title = "Music Event Management - Gateway API", Version = "v1" });
});

var app = builder.Build();

// Database seeding (only for Auth)
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    try
    {
        context.Database.Migrate();
        // Only seed auth data if needed
    }
    catch (Exception ex)
    {
        var logger = scope.ServiceProvider.GetRequiredService<ILogger<Program>>();
        logger.LogError(ex, "An error occurred while migrating/seeding Auth data.");
    }
}

if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI(c => c.SwaggerEndpoint("/swagger/v1/swagger.json", "Gateway API v1"));
}

app.UseCors("AllowReactApp");
app.UseHttpsRedirection();
app.UseAuthentication();
app.UseAuthorization();
app.MapControllers();

app.Run();