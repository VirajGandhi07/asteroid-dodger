namespace BackendApi.Data;

/// <summary>
/// Represents a player's score in a game session
/// </summary>
public class PlayerScore
{
    public int Id { get; set; }
    public int PlayerId { get; set; }
    public int Score { get; set; }
    public DateTime ScoredAt { get; set; } = DateTime.UtcNow;
    
    // Relationships
    public GamePlayer? Player { get; set; }
}
