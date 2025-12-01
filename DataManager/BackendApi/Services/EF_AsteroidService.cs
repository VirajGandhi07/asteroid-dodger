using BackendApi.Data;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Services;

/// <summary>
/// Asteroid service using Entity Framework Core for database operations
/// Replaces the file-based AsteroidService
/// </summary>
public class EF_AsteroidService
{
    private readonly GameDbContext _context;

    public EF_AsteroidService(GameDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all asteroids from the database
    /// </summary>
    public async Task<List<AsteroidDto>> GetAllAsteroidsAsync()
    {
        return await _context.Asteroids
            .Select(a => new AsteroidDto(
                a.Id,
                a.Size,
                a.Speed,
                a.Material,
                a.Type,
                a.SpawnRate,
                a.CreatedAt
            ))
            .ToListAsync();
    }

    /// <summary>
    /// Add a new asteroid
    /// </summary>
    public async Task<AsteroidDto> AddAsteroidAsync(AsteroidCreateDto asteroidData)
    {
        var asteroid = new GameAsteroid
        {
            Size = asteroidData.Size,
            Speed = asteroidData.Speed,
            Material = asteroidData.Material,
            Type = asteroidData.Type,
            SpawnRate = asteroidData.SpawnRate,
            CreatedAt = DateTime.UtcNow
        };

        _context.Asteroids.Add(asteroid);
        await _context.SaveChangesAsync();

        return new AsteroidDto(
            asteroid.Id,
            asteroid.Size,
            asteroid.Speed,
            asteroid.Material,
            asteroid.Type,
            asteroid.SpawnRate,
            asteroid.CreatedAt
        );
    }

    /// <summary>
    /// Delete an asteroid by ID
    /// </summary>
    public async Task DeleteAsteroidAsync(int id)
    {
        var asteroid = await _context.Asteroids.FindAsync(id);
        if (asteroid != null)
        {
            _context.Asteroids.Remove(asteroid);
            await _context.SaveChangesAsync();
        }
    }
}

/// <summary>
/// DTO for asteroid data
/// </summary>
public record AsteroidDto(int Id, string Size, int Speed, string Material, string Type, int SpawnRate, DateTime CreatedAt);

/// <summary>
/// DTO for creating a new asteroid
/// </summary>
public record AsteroidCreateDto(string Size, int Speed, string Material, string Type, int SpawnRate);
