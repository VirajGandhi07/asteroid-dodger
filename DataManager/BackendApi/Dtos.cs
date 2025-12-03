namespace BackendApi;

/// <summary>Player creation DTO</summary>
public record PlayerCreateDto(string Name);

/// <summary>Score submission DTO</summary>
public record ScoreDto(int Score);

/// <summary>Player rename DTO</summary>
public record RenameDto(string OldName, string NewName);

/// <summary>Asteroid creation DTO</summary>
public record AsteroidCreateDto(string Size, int Speed, string Material, string Type, int SpawnRate);

/// <summary>Asteroid DTO for responses</summary>
public record AsteroidDto(int Id, string Size, int Speed, string Material, string Type, int SpawnRate, DateTime CreatedAt);

// Internal record used when importing legacy JSON player files
internal record LegacyPlayer(string Name, int HighScore);
