using System;
using System.Text.Json;
using AsteroidManagerApp.Models;
using System.IO;

namespace AsteroidManagerApp.Services
{
    public class AsteroidService
    {
        public List<Asteroid> Asteroids { get; private set; } = new List<Asteroid>();

        public AsteroidService()
        {
            LoadAsteroids();
        }

        public void AddAsteroid(Asteroid asteroid)
        {
            asteroid.Id = Asteroids.Count > 0 ? Asteroids.Max(a => a.Id) + 1 : 1;
            Asteroids.Add(asteroid);
            SaveAsteroids();
        }

        public void SaveAsteroids()
        {
            var path = GetSharedFilePath("asteroids.json");
            var json = JsonSerializer.Serialize(Asteroids, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(path, json);
        }

        public void LoadAsteroids()
        {
            var shared = GetSharedFilePath("asteroids.json");

            if (File.Exists(shared))
            {
                var json = File.ReadAllText(shared);
                Asteroids = JsonSerializer.Deserialize<List<Asteroid>>(json) ?? new List<Asteroid>();
                return;
            }

            var local = Path.Combine(Directory.GetCurrentDirectory(), "asteroids.json");
            if (File.Exists(local))
            {
                var json = File.ReadAllText(local);
                Asteroids = JsonSerializer.Deserialize<List<Asteroid>>(json) ?? new List<Asteroid>();
                Directory.CreateDirectory(Path.GetDirectoryName(shared)!);
                File.WriteAllText(shared, json);
                return;
            }

            Asteroids = new List<Asteroid>();
        }

        public void DeleteAsteroid(int id)
        {
            var asteroid = Asteroids.FirstOrDefault(a => a.Id == id);
            if (asteroid != null)
            {
                Asteroids.Remove(asteroid);
                SaveAsteroids();
            }
        }

        public void UpdateAsteroid(Asteroid updated)
        {
            var asteroid = Asteroids.FirstOrDefault(a => a.Id == updated.Id);
            if (asteroid != null)
            {
                asteroid.Size = updated.Size;
                asteroid.Speed = updated.Speed;
                asteroid.Material = updated.Material;
                asteroid.Type = updated.Type;
                asteroid.SpawnRate = updated.SpawnRate;
                SaveAsteroids();
            }
        }

        private string GetSharedFilePath(string fileName)
        {
            // Start searching for the repo root from the application's base directory
            // (not the current working directory) so the service works when the
            // process is started from elsewhere.
            var repoRoot = FindRepoRoot(AppContext.BaseDirectory);
            if (repoRoot == null)
                return Path.Combine(Directory.GetCurrentDirectory(), fileName);

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
    }
}
