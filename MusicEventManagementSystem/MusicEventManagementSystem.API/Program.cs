using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MusicEventManagementSystem.API.Services;
using MusicEventManagementSystem.API.Services.Auth;
using MusicEventManagementSystem.API.Services.IServices;
using MusicEventManagementSystem.API.Services.Proxies;
using MusicEventManagementSystem.API.Services.Proxies.IProxies;
using MusicEventManagementSystem.Core.Interfaces.Services;
using MusicEventManagementSystem.Core.Interfaces.Services.Auth;
using MusicEventManagementSystem.Core.Models.Configuration;
using MusicEventManagementSystem.Core.Models.Entities.Auth;
using MusicEventManagementSystem.Infrastructure.Database;
using System.Text;
using System.Text.Json.Serialization;

var builder = WebApplication.CreateBuilder(args);

// 1. DbContext with PostgreSQL
builder.Services.AddDbContext<ApplicationDbContext>(options =>
    options.UseNpgsql(builder.Configuration.GetConnectionString("DefaultConnection")));

// 2. Configure JWT Settings
builder.Services.Configure<JwtSettings>(builder.Configuration.GetSection("JwtSettings"));

// 3. Identity setup
builder.Services.AddIdentity<ApplicationUser, IdentityRole>(options =>
{
    options.Password.RequireDigit = true;
    options.Password.RequiredLength = 6;
    options.User.RequireUniqueEmail = true;
}).AddEntityFrameworkStores<ApplicationDbContext>()
  .AddDefaultTokenProviders();

// 4. JWT Authentication
var jwtSettings = builder.Configuration.GetSection("JwtSettings").Get<JwtSettings>();
var key = Encoding.UTF8.GetBytes(jwtSettings?.SecretKey ?? throw new InvalidOperationException("JWT Secret Key is not configured"));

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.SaveToken = true;
    // NOTE: In production, set RequireHttpsMetadata to true
    options.RequireHttpsMetadata = false;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuer = true,
        ValidateAudience = true,
        ValidateLifetime = true,
        ValidateIssuerSigningKey = true,
        ValidIssuer = jwtSettings.Issuer,
        ValidAudience = jwtSettings.Audience,
        IssuerSigningKey = new SymmetricSecurityKey(key),
        ClockSkew = TimeSpan.Zero
    };
});

// 5. Add CORS
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

// 6. Register HttpContextAccessor to check access from this Gateway API to other subsystems
builder.Services.AddHttpContextAccessor();

// 7. Register HttpClient services for microservices communication
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

// 8. Register JWT Token Service
builder.Services.AddScoped<IJwtTokenService, JwtTokenService>();

// 9. Register Gateway-specific services (Auth + Client-facing orchestration)
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IClientEventService, ClientEventService>();
builder.Services.AddScoped<IClientPerformerService, ClientPerformerService>();
builder.Services.AddScoped<IClientVenueService, ClientVenueService>();
builder.Services.AddScoped<ICartService, CartService>();
builder.Services.AddScoped<IOrderService, OrderService>();

// 10. Register HTTP proxy services for EventOrganization microservice
builder.Services.AddScoped<IEventProxyService, EventProxyService>();
builder.Services.AddScoped<IPerformanceProxyService, PerformanceProxyService>();

// 11. Register HTTP proxy services for TicketSales microservice
builder.Services.AddScoped<IVenueProxyService, VenueProxyService>();
builder.Services.AddScoped<IZoneProxyService, ZoneProxyService>();
builder.Services.AddScoped<ITicketTypeProxyService, TicketTypeProxyService>();
builder.Services.AddScoped<ITicketProxyService, TicketProxyService>();
builder.Services.AddScoped<ISpecialOfferProxyService, SpecialOfferProxyService>();
builder.Services.AddScoped<IRecordedSaleProxyService, RecordedSaleProxyService>();

// 12. Register HTTP proxy services for PerformerCommunication microservice
builder.Services.AddScoped<IPerformerProxyService, PerformerProxyService>();


// 13. Configure Controllers with JSON options
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

    // Dodaj JWT autentikaciju u Swagger
    c.AddSecurityDefinition("Bearer", new Microsoft.OpenApi.Models.OpenApiSecurityScheme
    {
        Description = "JWT Authorization header using the Bearer scheme. Enter 'Bearer' [space] and then your token in the text input below.",
        Name = "Authorization",
        In = Microsoft.OpenApi.Models.ParameterLocation.Header,
        Type = Microsoft.OpenApi.Models.SecuritySchemeType.ApiKey,
        Scheme = "Bearer"
    });

    c.AddSecurityRequirement(new Microsoft.OpenApi.Models.OpenApiSecurityRequirement
    {
        {
            new Microsoft.OpenApi.Models.OpenApiSecurityScheme
            {
                Reference = new Microsoft.OpenApi.Models.OpenApiReference
                {
                    Type = Microsoft.OpenApi.Models.ReferenceType.SecurityScheme,
                    Id = "Bearer"
                }
            },
            new string[] {}
        }
    });
});

var app = builder.Build();

// Database seeding
using (var scope = app.Services.CreateScope())
{
    var context = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
    var roleManager = scope.ServiceProvider.GetRequiredService<RoleManager<IdentityRole>>();

    try
    {
        context.Database.Migrate();

        // Seed roles for the entire system
        string[] roles = { "TicketSales", "EventOrganization", "ArtistCommunication", "MediaCampaign", "MEMSClient", "Administrator" };

        foreach (var role in roles)
        {
            if (!await roleManager.RoleExistsAsync(role))
            {
                await roleManager.CreateAsync(new IdentityRole(role));
            }
        }
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