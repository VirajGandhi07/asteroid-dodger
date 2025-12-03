using System;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using BackendApi.Data;
using Microsoft.IdentityModel.Tokens;
using BCrypt.Net;

namespace BackendApi.Services;

/// <summary>
/// Service for handling JWT token generation and password hashing
/// </summary>
public class AuthService
{
    private readonly IConfiguration _configuration;
    private readonly GameDbContext _db;
    private readonly ILogger<AuthService> _logger;

    public AuthService(IConfiguration configuration, GameDbContext db, ILogger<AuthService> logger)
    {
        _configuration = configuration;
        _db = db;
        _logger = logger;
    }

    /// <summary>
    /// Register a new user account
    /// </summary>
    public async Task<(bool Success, string Message, User? User)> RegisterAsync(string username, string email, string password)
    {
        try
        {
            // Validation
            if (string.IsNullOrWhiteSpace(username) || username.Length < 3)
                return (false, "Username must be at least 3 characters long", null);

            if (string.IsNullOrWhiteSpace(email) || !email.Contains("@"))
                return (false, "Invalid email format", null);

            if (string.IsNullOrWhiteSpace(password) || password.Length < 6)
                return (false, "Password must be at least 6 characters long", null);

            // Check if user already exists
            var existingUser = _db.Users.FirstOrDefault(u => u.Username.ToLower() == username.ToLower() || u.Email.ToLower() == email.ToLower());
            if (existingUser != null)
                return (false, "Username or email already exists", null);

            // Hash password using BCrypt
            string passwordHash = BCrypt.Net.BCrypt.HashPassword(password);

            // Create new user
            var user = new User
            {
                Username = username,
                Email = email,
                PasswordHash = passwordHash,
                CreatedAt = DateTime.UtcNow,
                IsActive = true
            };

            _db.Users.Add(user);
            await _db.SaveChangesAsync();

            _logger.LogInformation($"User registered successfully: {username}");
            return (true, "User registered successfully", user);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Registration error: {ex.Message}");
            return (false, $"Registration failed: {ex.Message}", null);
        }
    }

    /// <summary>
    /// Authenticate user and return JWT token
    /// </summary>
    public async Task<(bool Success, string Message, string? Token, User? User)> LoginAsync(string username, string password)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(username) || string.IsNullOrWhiteSpace(password))
                return (false, "Username and password are required", null, null);

            // Find user by username
            var user = _db.Users.FirstOrDefault(u => u.Username.ToLower() == username.ToLower());
            if (user == null)
            {
                _logger.LogWarning($"Login attempt with non-existent username: {username}");
                return (false, "Invalid username or password", null, null);
            }

            // Check if user is active
            if (!user.IsActive)
                return (false, "User account is inactive", null, null);

            // Verify password using BCrypt
            bool isPasswordValid = BCrypt.Net.BCrypt.Verify(password, user.PasswordHash);
            if (!isPasswordValid)
            {
                _logger.LogWarning($"Failed login attempt for user: {username}");
                return (false, "Invalid username or password", null, null);
            }

            // Generate JWT token
            string token = GenerateJwtToken(user);
            _logger.LogInformation($"User logged in successfully: {username}");
            return (true, "Login successful", token, user);
        }
        catch (Exception ex)
        {
            _logger.LogError($"Login error: {ex.Message}");
            return (false, $"Login failed: {ex.Message}", null, null);
        }
    }

    /// <summary>
    /// Generate JWT token for authenticated user
    /// </summary>
    private string GenerateJwtToken(User user)
    {
        var jwtSettings = _configuration.GetSection("Jwt");
        var secretKey = jwtSettings["SecretKey"];
        var issuer = jwtSettings["Issuer"];
        var audience = jwtSettings["Audience"];
        var expirationMinutes = int.Parse(jwtSettings["ExpirationMinutes"] ?? "60");

        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var claims = new[]
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Username),
            new Claim(ClaimTypes.Email, user.Email),
            new Claim("UserId", user.Id.ToString())
        };

        var token = new JwtSecurityToken(
            issuer: issuer,
            audience: audience,
            claims: claims,
            expires: DateTime.UtcNow.AddMinutes(expirationMinutes),
            signingCredentials: credentials
        );

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    /// <summary>
    /// Validate JWT token (optional - for additional validation)
    /// </summary>
    public bool ValidateToken(string token)
    {
        try
        {
            var jwtSettings = _configuration.GetSection("Jwt");
            var secretKey = jwtSettings["SecretKey"];
            var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secretKey!));

            var tokenHandler = new JwtSecurityTokenHandler();
            tokenHandler.ValidateToken(token, new TokenValidationParameters
            {
                ValidateIssuerSigningKey = true,
                IssuerSigningKey = key,
                ValidateIssuer = true,
                ValidIssuer = jwtSettings["Issuer"],
                ValidateAudience = true,
                ValidAudience = jwtSettings["Audience"],
                ValidateLifetime = true,
                ClockSkew = TimeSpan.Zero
            }, out SecurityToken validatedToken);

            return true;
        }
        catch
        {
            return false;
        }
    }
}
