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
    return Results.Ok();
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
    return Results.Ok();
});

app.Run("http://localhost:5000");

// ===== DTOs =====

/// <summary>Player creation DTO</summary>
public record PlayerCreateDto(string Name);

/// <summary>Score submission DTO</summary>
public record ScoreDto(int Score);

/// <summary>Player rename DTO</summary>
public record RenameDto(string OldName, string NewName);
