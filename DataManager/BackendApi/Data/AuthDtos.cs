namespace BackendApi.Data;

/// <summary>
/// DTO for user login request
/// </summary>
public record LoginRequest(string Username, string Password);

/// <summary>
/// DTO for user registration request
/// </summary>
public record RegisterRequest(string Username, string Email, string Password);

/// <summary>
/// DTO for authentication response containing JWT token
/// </summary>
public record AuthResponse(bool Success, string Message, string? Token, UserDto? User);

/// <summary>
/// DTO for user information (safe to return to client)
/// </summary>
public record UserDto(int Id, string Username, string Email, DateTime CreatedAt, bool IsActive);

/// <summary>
/// Standard error response format
/// </summary>
public record ErrorResponse(int StatusCode, string Message, string? Details = null, DateTime Timestamp = default)
{
    public DateTime Timestamp { get; } = Timestamp == default ? DateTime.UtcNow : Timestamp;
}
