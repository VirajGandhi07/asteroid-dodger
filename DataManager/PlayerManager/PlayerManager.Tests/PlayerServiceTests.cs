using System;
using System.IO;
using System.Linq;
using PlayerManagerApp.Models;
using PlayerManagerApp.Services;
using Xunit;

namespace PlayerManager.Tests
{
    public class PlayerServiceTests : IDisposable
    {
        private readonly string originalCwd;
        private readonly string tempDir;

        public PlayerServiceTests()
        {
            originalCwd = Directory.GetCurrentDirectory();
            tempDir = Path.Combine(Path.GetTempPath(), "PlayerServiceTests_" + Guid.NewGuid().ToString("N"));
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
        public void AddPlayer_Persists_PlayerExists()
        {
            var svc = new PlayerService();
            svc.Players.Clear();
            svc.SavePlayers();

            svc.AddPlayer("Alice");

            Assert.Contains(svc.Players, p => p.Name == "Alice");
            Assert.True(File.Exists("players.json"));
        }

        [Fact]
        public void GetTopScores_Returns_Top5_Descending()
        {
            var svc = new PlayerService();
            svc.Players.Clear();

            // Create 6 players with different scores
            for (int i = 1; i <= 6; i++)
            {
                svc.Players.Add(new Player { Name = $"P{i}", HighScore = i * 10 });
            }

            svc.SavePlayers();

            var top = svc.GetTopScores();

            Assert.Equal(5, top.Count);
            var scores = top.Select(p => p.HighScore).ToList();
            var sorted = scores.OrderByDescending(x => x).ToList();
            Assert.Equal(sorted, scores);
        }
    }
}
