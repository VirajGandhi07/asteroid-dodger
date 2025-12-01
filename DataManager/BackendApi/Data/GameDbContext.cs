using Microsoft.EntityFrameworkCore;

namespace BackendApi.Data;

/// <summary>
/// Database context for the Asteroid Dodger game API
/// Manages all database operations through Entity Framework Core
/// </summary>
public class GameDbContext : DbContext
{
    public GameDbContext(DbContextOptions<GameDbContext> options) : base(options) { }

    public DbSet<GamePlayer> Players { get; set; } = null!;
    public DbSet<PlayerScore> Scores { get; set; } = null!;
    public DbSet<GameAsteroid> Asteroids { get; set; } = null!;
    public DbSet<User> Users { get; set; } = null!;

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        base.OnModelCreating(modelBuilder);

        // Player configuration
        modelBuilder.Entity<GamePlayer>()
            .HasKey(p => p.Id);
        modelBuilder.Entity<GamePlayer>()
            .Property(p => p.Name)
            .IsRequired()
            .HasMaxLength(100);
        modelBuilder.Entity<GamePlayer>()
            .HasIndex(p => p.Name)
            .IsUnique();
        modelBuilder.Entity<GamePlayer>()
            .HasMany(p => p.Scores)
            .WithOne(s => s.Player)
            .HasForeignKey(s => s.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Score configuration
        modelBuilder.Entity<PlayerScore>()
            .HasKey(s => s.Id);
        modelBuilder.Entity<PlayerScore>()
            .Property(s => s.Score)
            .IsRequired();
        modelBuilder.Entity<PlayerScore>()
            .HasOne(s => s.Player)
            .WithMany(p => p.Scores)
            .HasForeignKey(s => s.PlayerId)
            .OnDelete(DeleteBehavior.Cascade);

        // Asteroid configuration
        modelBuilder.Entity<GameAsteroid>()
            .HasKey(a => a.Id);
        modelBuilder.Entity<GameAsteroid>()
            .Property(a => a.Size)
            .IsRequired()
            .HasMaxLength(50);
        modelBuilder.Entity<GameAsteroid>()
            .Property(a => a.Material)
            .IsRequired()
            .HasMaxLength(50);
        modelBuilder.Entity<GameAsteroid>()
            .Property(a => a.Type)
            .IsRequired()
            .HasMaxLength(50);

        // User configuration
        modelBuilder.Entity<User>()
            .HasKey(u => u.Id);
        modelBuilder.Entity<User>()
            .Property(u => u.Username)
            .IsRequired()
            .HasMaxLength(100);
        modelBuilder.Entity<User>()
            .Property(u => u.Email)
            .IsRequired()
            .HasMaxLength(255);
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Username)
            .IsUnique();
        modelBuilder.Entity<User>()
            .HasIndex(u => u.Email)
            .IsUnique();
    }
}
