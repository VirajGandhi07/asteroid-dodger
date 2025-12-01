namespace BackendApi.Data;

/// <summary>
/// Represents a player in the game system
/// </summary>
public class GamePlayer
{
    public int Id { get; set; }
    public string Name { get; set; } = null!;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;
    
    // Relationships
    public ICollection<PlayerScore> Scores { get; set; } = new List<PlayerScore>();
}
