using PlayerManagerApp.Services;
using AsteroidManagerApp.Services;
using PlayerManagerApp.Models;
using AsteroidManagerApp.Models;

var builder = WebApplication.CreateBuilder(args);

// Configure CORS so frontend served from http://localhost:8000 can call API
var AllowedOrigin = "http://localhost:8000";
builder.Services.AddCors(options =>
{
    options.AddPolicy("LocalDev", p => p.WithOrigins(AllowedOrigin).AllowAnyHeader().AllowAnyMethod());
});

// Register existing services as singletons so they share data across requests
builder.Services.AddSingleton<PlayerService>();
builder.Services.AddSingleton<AsteroidService>();

var app = builder.Build();
app.UseCors("LocalDev");

app.MapGet("/", () => Results.Ok(new { status = "ok" }));

app.MapGet("/players/top", (PlayerService ps) =>
{
    var top = ps.GetTopScores();
    return Results.Ok(top);
});

app.MapGet("/players", (PlayerService ps) => Results.Ok(ps.Players));

app.MapPost("/players", async (PlayerService ps, HttpRequest req) =>
{
    var dto = await req.ReadFromJsonAsync<PlayerDto>();
    if (dto == null || string.IsNullOrWhiteSpace(dto.Name)) return Results.BadRequest();
    ps.AddPlayer(dto.Name.Trim(), dto.HighScore);
    return Results.Ok();
});

app.MapDelete("/players/{name}", (PlayerService ps, string name) =>
{
    if (string.IsNullOrWhiteSpace(name)) return Results.BadRequest();
    ps.DeletePlayer(name);
    return Results.Ok();
});

app.MapGet("/asteroids", (AsteroidService asvc) => Results.Ok(asvc.Asteroids));

app.MapPost("/asteroids", async (AsteroidService asvc, HttpRequest req) =>
{
    var ast = await req.ReadFromJsonAsync<Asteroid>();
    if (ast == null) return Results.BadRequest();
    asvc.AddAsteroid(ast);
    return Results.Ok();
});

app.Run("http://localhost:5000");

// Minimal DTO used for players POST
public record PlayerDto(string Name, int HighScore);
