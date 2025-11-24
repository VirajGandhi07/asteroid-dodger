using System;
using System.IO;
using System.Linq;
using GameLauncher;
using PlayerManagerApp.Services;
using PlayerManagerApp.Models;
using Xunit;

namespace GameLauncher.Tests
{
    public class ScoreboardTests : IDisposable
    {
        private readonly string originalCwd;
        private readonly string tempDir;

        public ScoreboardTests()
        {
            originalCwd = Directory.GetCurrentDirectory();
            tempDir = Path.Combine(Path.GetTempPath(), "ScoreboardTests_" + Guid.NewGuid().ToString("N"));
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
        public void GetTopScoreLines_Returns_Correct_Order_And_Format()
        {
            var svc = new PlayerService();
            svc.Players.Clear();

            svc.Players.Add(new Player { Name = "A", HighScore = 50 });
            svc.Players.Add(new Player { Name = "B", HighScore = 200 });
            svc.Players.Add(new Player { Name = "C", HighScore = 150 });
            svc.Players.Add(new Player { Name = "D", HighScore = 75 });
            svc.Players.Add(new Player { Name = "E", HighScore = 25 });
            svc.Players.Add(new Player { Name = "F", HighScore = 5 });

            svc.SavePlayers();

            var lines = ScoreboardHelper.GetTopScoreLines(svc).ToList();

            Assert.Equal(5, lines.Count);
            Assert.Equal("1. B - 200", lines[0]);
            Assert.Equal("2. C - 150", lines[1]);
            Assert.Equal("3. D - 75", lines[2]);
            Assert.Equal("4. A - 50", lines[3]);
            Assert.Equal("5. E - 25", lines[4]);
        }
    }
}
