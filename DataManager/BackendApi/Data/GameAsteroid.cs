namespace BackendApi.Data;

/// <summary>
/// Represents an asteroid in the game
/// </summary>
public class GameAsteroid
{
    public int Id { get; set; }
    public string Size { get; set; } = null!;  // Small, Medium, Large
    public int Speed { get; set; }  // 1-10
    public string Material { get; set; } = null!;  // Rock, Iron, Crystal
    public string Type { get; set; } = null!;  // Normal, Rare, Boss
    public int SpawnRate { get; set; }  // 1-100
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
}
