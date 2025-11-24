using System;
using System.IO;
using System.Linq;
using AsteroidManagerApp.Models;
using AsteroidManagerApp.Services;
using Xunit;

namespace AsteroidManager.Tests
{
    public class AsteroidServiceTests : IDisposable
    {
        private readonly string originalCwd;
        private readonly string tempDir;

        public AsteroidServiceTests()
        {
            originalCwd = Directory.GetCurrentDirectory();
            tempDir = Path.Combine(Path.GetTempPath(), "AsteroidServiceTests_" + Guid.NewGuid().ToString("N"));
            Directory.CreateDirectory(tempDir);
            Directory.SetCurrentDirectory(tempDir);
        }

        public void Dispose()
        {
            try
            {
                Directory.SetCurrentDirectory(originalCwd);
                if (Directory.Exists(tempDir)) Directory.Delete(tempDir, true);
            }
            catch { }
        }

        [Fact]
        public void AddAsteroid_AssignsId_And_Persists()
        {
            var svc = new AsteroidService();
            svc.Asteroids.Clear();
            svc.SaveAsteroids();

            var a = new Asteroid { Size = "Small", Speed = 5, Material = "Rock", Type = "Normal", SpawnRate = 20 };
            svc.AddAsteroid(a);

            Assert.True(a.Id >= 1);
            Assert.Contains(svc.Asteroids, x => x.Id == a.Id);
            Assert.True(File.Exists("asteroids.json"));
        }

        [Fact]
        public void UpdateAsteroid_Changes_Fields()
        {
            var svc = new AsteroidService();
            svc.Asteroids.Clear();

            var a = new Asteroid { Size = "Small", Speed = 3, Material = "Rock", Type = "Normal", SpawnRate = 30 };
            svc.AddAsteroid(a);

            a.Size = "Large";
            a.Speed = 9;
            svc.UpdateAsteroid(a);

            var stored = svc.Asteroids.FirstOrDefault(x => x.Id == a.Id);
            Assert.NotNull(stored);
            Assert.Equal("Large", stored!.Size);
            Assert.Equal(9, stored.Speed);
        }

        [Fact]
        public void DeleteAsteroid_Removes_Item()
        {
            var svc = new AsteroidService();
            svc.Asteroids.Clear();

            var a1 = new Asteroid { Size = "Small", Speed = 3, Material = "Rock", Type = "Normal", SpawnRate = 30 };
            var a2 = new Asteroid { Size = "Medium", Speed = 4, Material = "Iron", Type = "Rare", SpawnRate = 40 };
            svc.AddAsteroid(a1);
            svc.AddAsteroid(a2);

            svc.DeleteAsteroid(a1.Id);

            Assert.DoesNotContain(svc.Asteroids, x => x.Id == a1.Id);
            Assert.Contains(svc.Asteroids, x => x.Id == a2.Id);
        }

        [Fact]
        public void RandomAsteroidGenerator_Generate_Produces_Valid()
        {
            var r = RandomAsteroidGenerator.Generate();
            Assert.Contains(r.Size, new[] { "Small", "Medium", "Large" });
            Assert.InRange(r.Speed, 1, 11); // generator uses Next(1,11)
            Assert.Contains(r.Material, new[] { "Rock", "Iron", "Crystal" });
            Assert.Contains(r.Type, new[] { "Normal", "Rare", "Boss" });
            Assert.InRange(r.SpawnRate, 10, 100);
        }
    }
}
