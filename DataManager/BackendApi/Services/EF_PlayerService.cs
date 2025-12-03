using BackendApi.Data;
using Microsoft.EntityFrameworkCore;

namespace BackendApi.Services;

/// <summary>
/// Player service using Entity Framework Core for database operations
/// Replaces the file-based PlayerService
/// </summary>
public class EF_PlayerService
{
    private readonly GameDbContext _context;

    public EF_PlayerService(GameDbContext context)
    {
        _context = context;
    }

    /// <summary>
    /// Get all players from the database
    /// </summary>
    public async Task<List<PlayerDto>> GetAllPlayersAsync()
    {
        return await _context.Players
            .Select(p => new PlayerDto(p.Id, p.Name, p.CreatedAt, p.UpdatedAt))
            .ToListAsync();
    }

    /// <summary>
    /// Get top 5 players by high score
    /// </summary>
    public async Task<List<PlayerScoreDto>> GetTopScoresAsync()
    {
        // Load players with their scores from database
        var players = await _context.Players
            .Include(p => p.Scores)
            .ToListAsync();

        // Debug: log players and their scores
        Console.WriteLine("[EF_PlayerService] Debug: Players and their scores:");
        foreach (var pl in players)
        {
            var scoresList = pl.Scores.Select(s => s.Score).ToList();
            Console.WriteLine($"Player={pl.Name} Id={pl.Id} Scores=[{string.Join(',', scoresList)}]");
        }

        // Debug: log all score records in DB
        var allScores = await _context.Scores.ToListAsync();
        Console.WriteLine("[EF_PlayerService] Debug: All Scores in DB:");
        foreach (var sc in allScores)
        {
            Console.WriteLine($"ScoreRecord Id={sc.Id} PlayerId={sc.PlayerId} Score={sc.Score} ScoredAt={sc.ScoredAt}");
        }

        // Calculate top scores in memory
        var result = players
            .Select(p => new PlayerScoreDto(
                p.Name,
                p.Scores.Any() ? p.Scores.Max(s => s.Score) : 0
            ))
            .OrderByDescending(ps => ps.HighScore)
            .Take(5)
            .ToList();

        Console.WriteLine("[EF_PlayerService] Debug: Top scores result: " + string.Join(';', result.Select(r => r.Name + ":" + r.HighScore)));

        return result;
    }
    /// <summary>
    /// Add a new player
    /// </summary>
    public async Task<PlayerDto> AddPlayerAsync(string name)
    {
        var player = new GamePlayer 
        { 
            Name = name.Trim(),
            CreatedAt = DateTime.UtcNow,
            UpdatedAt = DateTime.UtcNow
        };

        _context.Players.Add(player);
        await _context.SaveChangesAsync();

        return new PlayerDto(player.Id, player.Name, player.CreatedAt, player.UpdatedAt);
    }

    /// <summary>
    /// Delete all players with the given name (case-insensitive)
    /// </summary>
    public async Task DeletePlayerAsync(string name)
    {
        var players = await _context.Players
            .Where(p => p.Name.ToLower() == name.Trim().ToLower())
            .ToListAsync();

        if (players.Any())
        {
            _context.Players.RemoveRange(players);
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Rename all players with the old name to the new name
    /// </summary>
    public async Task RenamePlayerAsync(string oldName, string newName)
    {
        var players = await _context.Players
            .Where(p => p.Name.ToLower() == oldName.Trim().ToLower())
            .ToListAsync();

        foreach (var player in players)
        {
            player.Name = newName.Trim();
            player.UpdatedAt = DateTime.UtcNow;
        }

        if (players.Any())
        {
            await _context.SaveChangesAsync();
        }
    }

    /// <summary>
    /// Add a score for a player
    /// </summary>
    public async Task AddScoreAsync(string playerName, int score)
    {
        Console.WriteLine($"[EF_PlayerService] AddScoreAsync called for '{playerName}' score={score}");
        var player = await _context.Players
            .FirstOrDefaultAsync(p => p.Name.ToLower() == playerName.Trim().ToLower());

        if (player == null)
        {
            player = new GamePlayer 
            { 
                Name = playerName.Trim(),
                CreatedAt = DateTime.UtcNow,
                UpdatedAt = DateTime.UtcNow
            };
            _context.Players.Add(player);
            await _context.SaveChangesAsync();
        }

        var scoreRecord = new PlayerScore
        {
            PlayerId = player.Id,
            Score = score,
            ScoredAt = DateTime.UtcNow
        };

        _context.Scores.Add(scoreRecord);
        await _context.SaveChangesAsync();
    }
}

/// <summary>
/// DTO for player data
/// </summary>
public record PlayerDto(int Id, string Name, DateTime CreatedAt, DateTime UpdatedAt);

/// <summary>
/// DTO for player score (high score)
/// </summary>
public record PlayerScoreDto(string Name, int HighScore);
