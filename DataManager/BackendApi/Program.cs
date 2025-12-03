using BackendApi.Data;
using BackendApi.Services;
using Microsoft.EntityFrameworkCore;

var builder = WebApplication.CreateBuilder(args);

// Configure Entity Framework Core with SQLite
var connectionString = builder.Configuration.GetConnectionString("DefaultConnection") 
    ?? "Data Source=AsteroidDodger.db";
builder.Services.AddDbContext<GameDbContext>(options =>
    options.UseSqlite(connectionString));

// Register EF-based services
builder.Services.AddScoped<EF_PlayerService>();
builder.Services.AddScoped<EF_AsteroidService>();

// Configure CORS so frontend served from http://localhost:8000 can call API
var AllowedOrigin = "http://localhost:8000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", p => p.WithOrigins(AllowedOrigin).AllowAnyHeader().AllowAnyMethod());
});

var app = builder.Build();
app.UseCors("LocalDev");

// Run EF migrations and perform one-time migration from legacy file-based storage (if present)
using (var scope = app.Services.CreateScope())
{
    var services = scope.ServiceProvider;
    try
    {
        var db = services.GetRequiredService<GameDbContext>();
        // Ensure database is created and migrations applied
        db.Database.Migrate();

        // Attempt to migrate legacy players from DataStorage/players.json (if exists)
        // Try a few likely locations for the legacy DataStorage folder
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
            // Only import if there are no scores yet to avoid duplicates
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
                        // If legacy has a high score, add it as a PlayerScore record
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
app.MapGet("/", () => Results.Ok(new { status = "ok", version = "1.0", database = "SQLite with EF Core" }));

// ===== PLAYER ENDPOINTS =====

// Get all players
app.MapGet("/players", async (EF_PlayerService ps) =>
{
    var players = await ps.GetAllPlayersAsync();
    return Results.Ok(players);
});

// Get top 5 scores
app.MapGet("/players/top", async (EF_PlayerService ps) =>
{
    var top = await ps.GetTopScoresAsync();
    return Results.Ok(top);
});

// Add a new player
app.MapPost("/players", async (EF_PlayerService ps, PlayerCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Name)) 
        return Results.BadRequest(new { error = "Player name is required" });
    
    var player = await ps.AddPlayerAsync(dto.Name);
    return Results.Created($"/players/{player.Id}", player);
});

// Delete a player by name
app.MapDelete("/players/{name}", async (EF_PlayerService ps, string name) =>
{
    if (string.IsNullOrWhiteSpace(name)) 
        return Results.BadRequest(new { error = "Player name is required" });
    
    await ps.DeletePlayerAsync(name);
    return Results.Ok();
});

// Rename a player
app.MapPut("/players/rename", async (EF_PlayerService ps, RenameDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.OldName) || string.IsNullOrWhiteSpace(dto.NewName))
        return Results.BadRequest(new { error = "Old name and new name are required" });
    
    await ps.RenamePlayerAsync(dto.OldName, dto.NewName);
    return Results.Ok();
});

// Add a score for a player
app.MapPost("/players/{name}/score", async (EF_PlayerService ps, string name, ScoreDto dto) =>
{
    if (string.IsNullOrWhiteSpace(name))
        return Results.BadRequest(new { error = "Player name is required" });
    
    await ps.AddScoreAsync(name, dto.Score);
    // Return the player data for consistency
    var players = await ps.GetAllPlayersAsync();
    var player = players.FirstOrDefault(p => p.Name.ToLower() == name.Trim().ToLower());
    return Results.Ok(new { message = "Score recorded", player });
});

// ===== ASTEROID ENDPOINTS =====

// Get all asteroids
app.MapGet("/asteroids", async (EF_AsteroidService asvc) =>
{
    var asteroids = await asvc.GetAllAsteroidsAsync();
    return Results.Ok(asteroids);
});

// Add a new asteroid
app.MapPost("/asteroids", async (EF_AsteroidService asvc, AsteroidCreateDto dto) =>
{
    if (string.IsNullOrWhiteSpace(dto.Size) || string.IsNullOrWhiteSpace(dto.Material) || 
        string.IsNullOrWhiteSpace(dto.Type))
        return Results.BadRequest(new { error = "Size, Material, and Type are required" });
    
    var asteroid = await asvc.AddAsteroidAsync(dto);
    return Results.Created($"/asteroids/{asteroid.Id}", asteroid);
});

// Delete an asteroid by ID
app.MapDelete("/asteroids/{id}", async (EF_AsteroidService asvc, int id) =>
{
    await asvc.DeleteAsteroidAsync(id);
    return Results.Ok(new { message = "Asteroid deleted successfully", id });
});

app.Run("http://localhost:5000");

// ===== DTOs =====

/// <summary>Player creation DTO</summary>
public record PlayerCreateDto(string Name);

/// <summary>Score submission DTO</summary>
public record ScoreDto(int Score);

/// <summary>Player rename DTO</summary>
public record RenameDto(string OldName, string NewName);

// Internal record used when importing legacy JSON player files
internal record LegacyPlayer(string Name, int HighScore);
