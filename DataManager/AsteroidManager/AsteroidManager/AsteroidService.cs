using System.Text.Json;
using AsteroidManagerApp.Models;

namespace AsteroidManagerApp.Services
{
    public class AsteroidService
    {
        private const string FileName = "asteroids.json";
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
            var json = JsonSerializer.Serialize(Asteroids, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(FileName, json);
        }

        public void LoadAsteroids()
        {
            if (File.Exists(FileName))
            {
                var json = File.ReadAllText(FileName);
                Asteroids = JsonSerializer.Deserialize<List<Asteroid>>(json) ?? new List<Asteroid>();
            }
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
    }
}
