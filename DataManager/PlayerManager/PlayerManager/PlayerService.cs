using System;
using System.Text.Json;
using System.IO;
using PlayerManagerApp.Models;

namespace PlayerManagerApp.Services
{
    public class PlayerService
    {
        public List<Player> Players { get; private set; } = new List<Player>();

        public PlayerService()
        {
            LoadPlayers();
        }

        public void AddPlayer(string name)
        {
            Players.Add(new Player { Name = name });
            SavePlayers();
        }

        // Overload to add a player with an initial high score (used by data generator)
        public void AddPlayer(string name, int highScore)
        {
            Players.Add(new Player { Name = name, HighScore = highScore });
            SavePlayers();
        }

        public void SavePlayers()
        {
            var path = GetSharedFilePath("players.json");
            var json = JsonSerializer.Serialize(Players, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(path, json);
        }

        public void LoadPlayers()
        {
            var shared = GetSharedFilePath("players.json");

            // If shared file exists, load from it
            if (File.Exists(shared))
            {
                var json = File.ReadAllText(shared);
                Players = JsonSerializer.Deserialize<List<Player>>(json) ?? new List<Player>();
                return;
            }

            // Fallback: if a local legacy file exists in the current working directory, migrate it
            var local = Path.Combine(Directory.GetCurrentDirectory(), "players.json");
            if (File.Exists(local))
            {
                var json = File.ReadAllText(local);
                Players = JsonSerializer.Deserialize<List<Player>>(json) ?? new List<Player>();
                // Save migrated data to shared location
                Directory.CreateDirectory(Path.GetDirectoryName(shared)!);
                File.WriteAllText(shared, json);
                return;
            }

            // Nothing found -> keep empty list
            Players = new List<Player>();
        }

        // Determine a repository-root based shared path for storing data.
        private string GetSharedFilePath(string fileName)
        {
            // Start searching for the repo root from the application's base directory
            // (not the current working directory) so the service works when the
            // process is started from elsewhere.
            var repoRoot = FindRepoRoot(AppContext.BaseDirectory);
            if (repoRoot == null)
            {
                // fallback to current directory
                return Path.Combine(Directory.GetCurrentDirectory(), fileName);
            }

            var sharedDir = Path.Combine(repoRoot, "DataStorage");
            Directory.CreateDirectory(sharedDir);
            return Path.Combine(sharedDir, fileName);
        }

        private string? FindRepoRoot(string start)
        {
            var dir = new DirectoryInfo(start);
            while (dir != null)
            {
                if (Directory.Exists(Path.Combine(dir.FullName, ".git")))
                    return dir.FullName;
                dir = dir.Parent;
            }
            return null;
        }

        public List<Player> GetTopScores()
        {
            return Players.OrderByDescending(p => p.HighScore).Take(5).ToList();
        }
    }
}