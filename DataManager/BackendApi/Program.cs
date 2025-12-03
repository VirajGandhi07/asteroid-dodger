using BackendApi;
using BackendApi.Data;
using BackendApi.Services;
using BackendApi.Middleware;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using System.Text;
using System.Reflection;

var builder = WebApplication.CreateBuilder(args);

// Configure Entity Framework Core with SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=AsteroidDodger.db";
builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseSqlite(connectionString));

// Register EF-based services
builder.Services.AddScoped<EF_PlayerService>();
builder.Services.AddScoped<EF_AsteroidService>();
builder.Services.AddScoped<AuthService>();

// Configure JWT Authentication
var jwtSettings = builder.Configuration.GetSection("Jwt");
var secretKey = jwtSettings["SecretKey"];
var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));

builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
    .AddJwtBearer(options =>
    {
        options.TokenValidationParameters = new TokenValidationParameters
        {
            ValidateIssuerSigningKey = true,
            IssuerSigningKey = key,
            ValidateIssuer = true,
            ValidIssuer = jwtSettings["Issuer"],
            ValidateAudience = true,
            ValidAudience = jwtSettings["Audience"],
            ValidateLifetime = true,
            ClockSkew = TimeSpan.Zero
        };
    });

builder.Services.AddAuthorization();

// Configure CORS so frontend served from http://localhost:8000 can call API
var AllowedOrigin = "http://localhost:8000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", p => p
        .WithOrigins(AllowedOrigin)
        .AllowAnyHeader()
        .AllowAnyMethod()
        .AllowCredentials());
});

// Add Swagger/OpenAPI (currently disabled - requires additional configuration)
// builder.Services.AddEndpointsApiExplorer();
// builder.Services.AddSwaggerGen(...);

var app = builder.Build();

// Add global exception handling middleware
app.UseMiddleware<GlobalExceptionHandlerMiddleware>();

// Note: Swagger/OpenAPI configuration - currently disabled due to DI issues in minimal API setup
// To enable, ensure all Swashbuckle dependencies are properly configured
// Future improvement: Move to full Program.cs with better service registration

app.UseCors("LocalDev");
app.UseAuthentication();
app.UseAuthorization();

// Run EF migrations and perform one-time migration from legacy file-based storage (if present)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<GameDbContext>();
        // Ensure database is created and migrations applied
        db.Database.Migrate();

        // Seed initial data if database is empty
        await SeedDataAsync(db);

        // Attempt to migrate legacy players from DataStorage/players.json (if exists)
        var candidates = new[] {
            Path.GetFullPath(Path.Combine(AppContext.BaseDirectory, "..", "..", "DataStorage", "players.json")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "..", "DataStorage", "players.json")),
            Path.GetFullPath(Path.Combine(Directory.GetCurrentDirectory(), "..", "DataStorage", "players.json"))
        };
        string? legacyPath = null;
        foreach (var c in candidates)
        {
            if (File.Exists(c)) { legacyPath = c; break; }
        }
        if (legacyPath != null)
        {
            if (!db.Scores.Any())
            {
                Console.WriteLine($"[Startup] Found legacy players file at {legacyPath}, importing...");

                var text = File.ReadAllText(legacyPath);
                try
                {
                    var legacyPlayers = System.Text.Json.JsonSerializer.Deserialize<List<LegacyPlayer>>(text) ?? new List<LegacyPlayer>();
                    foreach (var lp in legacyPlayers)
                    {
                        if (string.IsNullOrWhiteSpace(lp.Name)) continue;
                        var name = lp.Name.Trim();
                        var existing = db.Players.FirstOrDefault(p => p.Name.ToLower() == name.ToLower());
                        if (existing == null)
                        {
                            existing = new GamePlayer { Name = name, CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow };
                            db.Players.Add(existing);
                            db.SaveChanges();
                        }
                        if (lp.HighScore > 0)
                        {
                            var score = new PlayerScore { PlayerId = existing.Id, Score = lp.HighScore, ScoredAt = DateTime.UtcNow };
                            db.Scores.Add(score);
                            db.SaveChanges();
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"[Startup] Failed to import legacy players: {ex.Message}");
                }
            }
            else
            {
                Console.WriteLine("[Startup] Skipping legacy import because Scores table already contains data.");
            }
        }
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Startup] Exception during DB init: {ex}");
    }
}

// Health check endpoint
app.MapGet("/", () => Results.Ok(new { status = "ok", version = "1.0", database = "SQLite with EF Core", authentication = "JWT" }))
    .WithName("HealthCheck")

    .WithDescription("Health check endpoint to verify API is running");

// ===== AUTHENTICATION ENDPOINTS =====

/// <summary>
/// Register a new user account
/// </summary>
app.MapPost("/auth/register", async (AuthService authService, RegisterRequest request) =>
{
    var (success, message, user) = await authService.RegisterAsync(request.Username, request.Email, request.Password);
    if (!success)
        return Results.BadRequest(new { success = false, message });

    var userDto = new UserDto(user!.Id, user.Username, user.Email, user.CreatedAt, user.IsActive);
    return Results.Created("/auth/register", new { success = true, message, user = userDto });
})
.WithName("Register")

.WithDescription("Register a new user account")
.Produces(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest);

/// <summary>
/// Login with username and password to receive JWT token
/// </summary>
app.MapPost("/auth/login", async (AuthService authService, LoginRequest request) =>
{
    var (success, message, token, user) = await authService.LoginAsync(request.Username, request.Password);
    if (!success)
        return Results.Unauthorized();

    var userDto = new UserDto(user!.Id, user.Username, user.Email, user.CreatedAt, user.IsActive);
    return Results.Ok(new AuthResponse(success, message, token, userDto));
})
.WithName("Login")

.WithDescription("Login with username and password to receive JWT token")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status401Unauthorized);

// ===== PLAYER ENDPOINTS =====

/// <summary>
/// Get all players with their highest scores
/// </summary>
app.MapGet("/players", async (EF_PlayerService ps) =>
{
    var players = await ps.GetAllPlayersAsync();
    return Results.Ok(players);
})
.WithName("GetAllPlayers")

.WithDescription("Retrieve all players with their highest scores");

/// <summary>
/// Get top 10 players by highest score
/// </summary>
app.MapGet("/players/top", async (EF_PlayerService ps) =>
{
    var top = await ps.GetTopScoresAsync();
    return Results.Ok(top);
})
.WithName("GetTopPlayers")

.WithDescription("Get top 10 players sorted by highest score");

/// <summary>
/// Create a new player (requires authentication)
/// </summary>
app.MapPost("/players", async (EF_PlayerService ps, PlayerCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name)) 
        return Results.BadRequest(new { error = "Player name is required" });
    
    var player = await ps.AddPlayerAsync(dto.Name);
    return Results.Created($"/players/{player.Id}", player);
})
.WithName("CreatePlayer")

.WithDescription("Create a new player (requires authentication)")
.Produces(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status401Unauthorized);

/// <summary>
/// Delete a player by name (requires authentication)
/// </summary>
app.MapDelete("/players/{name}", async (EF_PlayerService ps, string name) =>
{
    if (string.IsNullOrWhiteSpace(name)) 
        return Results.BadRequest(new { error = "Player name is required" });
    
    await ps.DeletePlayerAsync(name);
    return Results.Ok(new { message = "Player deleted successfully", name });
})
.WithName("DeletePlayer")

.WithDescription("Delete a player by name (requires authentication)")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status401Unauthorized);

/// <summary>
/// Rename a player (requires authentication)
/// </summary>
app.MapPut("/players/rename", async (EF_PlayerService ps, RenameDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.OldName) || string.IsNullOrWhiteSpace(dto.NewName))
        return Results.BadRequest(new { error = "Old name and new name are required" });
    
    await ps.RenamePlayerAsync(dto.OldName, dto.NewName);
    return Results.Ok(new { message = "Player renamed successfully", oldName = dto.OldName, newName = dto.NewName });
})
.WithName("RenamePlayer")

.WithDescription("Rename a player (requires authentication)")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status401Unauthorized);

/// <summary>
/// Add a score for a player
/// </summary>
app.MapPost("/players/{name}/score", async (EF_PlayerService ps, string name, ScoreDto dto) =>
{
    if (string.IsNullOrWhiteSpace(name))
        return Results.BadRequest(new { error = "Player name is required" });
    
    await ps.AddScoreAsync(name, dto.Score);
    var players = await ps.GetAllPlayersAsync();
    var player = players.FirstOrDefault(p => p.Name.ToLower() == name.Trim().ToLower());
    return Results.Ok(new { message = "Score recorded", player });
})
.WithName("PostScore")

.WithDescription("Add a score for a player (auto-creates player if doesn't exist)")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status400BadRequest);

// ===== ASTEROID ENDPOINTS =====

/// <summary>
/// Get all asteroids
/// </summary>
app.MapGet("/asteroids", async (EF_AsteroidService asvc) =>
{
    var asteroids = await asvc.GetAllAsteroidsAsync();
    return Results.Ok(asteroids);
})
.WithName("GetAllAsteroids")

.WithDescription("Retrieve all asteroids from the database");

/// <summary>
/// Create a new asteroid (requires authentication)
/// </summary>
app.MapPost("/asteroids", async (EF_AsteroidService asvc, AsteroidCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Size) || string.IsNullOrWhiteSpace(dto.Material) || 
        string.IsNullOrWhiteSpace(dto.Type))
        return Results.BadRequest(new { error = "Size, Material, and Type are required" });
    
    var asteroid = await asvc.AddAsteroidAsync(dto);
    return Results.Created($"/asteroids/{asteroid.Id}", asteroid);
})
.WithName("CreateAsteroid")

.WithDescription("Create a new asteroid (requires authentication)")
.Produces(StatusCodes.Status201Created)
.Produces(StatusCodes.Status400BadRequest)
.Produces(StatusCodes.Status401Unauthorized);

/// <summary>
/// Delete an asteroid by ID (requires authentication)
/// </summary>
app.MapDelete("/asteroids/{id}", async (EF_AsteroidService asvc, int id) =>
{
    await asvc.DeleteAsteroidAsync(id);
    return Results.Ok(new { message = "Asteroid deleted successfully", id });
})
.WithName("DeleteAsteroid")

.WithDescription("Delete an asteroid by ID (requires authentication)")
.Produces(StatusCodes.Status200OK)
.Produces(StatusCodes.Status401Unauthorized);

app.Run("http://localhost:5000");

// ===== DATA SEEDING FUNCTION =====

/// <summary>
/// Seed initial test data into the database
/// </summary>
static async Task SeedDataAsync(GameDbContext db)
{
    try
    {
        // Only seed if database is empty
        if (db.Users.Any() || db.Players.Any())
            return;

        Console.WriteLine("[Seeding] Starting data seed...");

        // Create demo users
        var demoUsers = new[]
        {
            new User { Username = "demo", Email = "demo@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("demo123"), IsActive = true },
            new User { Username = "player1", Email = "player1@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("player123"), IsActive = true },
            new User { Username = "player2", Email = "player2@example.com", PasswordHash = BCrypt.Net.BCrypt.HashPassword("player123"), IsActive = true }
        };

        foreach (var user in demoUsers)
        {
            if (!db.Users.Any(u => u.Username.ToLower() == user.Username.ToLower()))
            {
                db.Users.Add(user);
            }
        }

        // Create demo players with scores
        var demoPlayers = new[]
        {
            new GamePlayer { Name = "SkyWalker", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new GamePlayer { Name = "StoneBreaker", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow },
            new GamePlayer { Name = "SpeedDemon", CreatedAt = DateTime.UtcNow, UpdatedAt = DateTime.UtcNow }
        };

        foreach (var player in demoPlayers)
        {
            if (!db.Players.Any(p => p.Name.ToLower() == player.Name.ToLower()))
            {
                db.Players.Add(player);
                await db.SaveChangesAsync();

                // Add scores for the player
                var scores = new[]
                {
                    new PlayerScore { PlayerId = player.Id, Score = 1500, ScoredAt = DateTime.UtcNow.AddDays(-5) },
                    new PlayerScore { PlayerId = player.Id, Score = 2100, ScoredAt = DateTime.UtcNow.AddDays(-3) },
                    new PlayerScore { PlayerId = player.Id, Score = 1800, ScoredAt = DateTime.UtcNow.AddDays(-1) }
                };

                foreach (var score in scores)
                {
                    db.Scores.Add(score);
                }
            }
        }

        await db.SaveChangesAsync();
        Console.WriteLine("[Seeding] Data seed completed successfully!");
    }
    catch (Exception ex)
    {
        Console.WriteLine($"[Seeding] Error during data seed: {ex.Message}");
    }
}
