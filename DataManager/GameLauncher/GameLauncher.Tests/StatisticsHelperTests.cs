using System;
using System.Collections.Generic;
using System.Linq;
using AsteroidManagerApp.Models;
using GameLauncher.DataAnalysis;
using PlayerManagerApp.Models;
using Xunit;

namespace GameLauncher.Tests
{
    public class StatisticsHelperTests
    {
        [Fact]
        public void GenerateReport_WithPlayersAndAsteroids_ComputesExpectedValues()
        {
            // Arrange - players with known scores
            var players = new List<Player>
            {
                new Player { Name = "P1", HighScore = 10 }, // low
                new Player { Name = "P2", HighScore = 20 }, // mid
                new Player { Name = "P3", HighScore = 30 }, // mid
                new Player { Name = "P4", HighScore = 40 }  // high
            };

            // Arrange - asteroids with known speed and spawn rate
            var asteroids = new List<Asteroid>
            {
                new Asteroid { Id = 1, Speed = 2, SpawnRate = 10 },
                new Asteroid { Id = 2, Speed = 4, SpawnRate = 20 }
            };

            // Act
            var report = StatisticsHelper.GenerateReport(players, asteroids);

            // Assert totals
            Assert.Equal(4, report.TotalPlayers);
            Assert.Equal(2, report.TotalAsteroids);

            // Scores: [10,20,30,40] -> average 25, median 25
            Assert.InRange(report.AverageScore, 24.999, 25.001);
            Assert.InRange(report.MedianScore, 24.999, 25.001);

            // StdDev (population): sqrt( ((-15)^2 + (-5)^2 + 5^2 + 15^2)/4 ) = sqrt(125) ~= 11.18034
            Assert.InRange(report.StdDevScore, 11.18 - 0.01, 11.18 + 0.01);

            // Buckets: Low (5-15) => 1, Mid (16-39) => 2, High (40-50) => 1
            Assert.Equal(1, report.ScoreBuckets["Low (5-15)"]);
            Assert.Equal(2, report.ScoreBuckets["Mid (16-39)"]);
            Assert.Equal(1, report.ScoreBuckets["High (40-50)"]);

            // Asteroid averages
            Assert.InRange(report.AverageAsteroidSpeed, 3.0 - 0.001, 3.0 + 0.001);
            Assert.InRange(report.AverageAsteroidSpawnRate, 15.0 - 0.001, 15.0 + 0.001);
        }

        [Fact]
        public void GenerateReport_WithNoPlayersOrAsteroids_ReturnsZeros()
        {
            // Act
            var report = StatisticsHelper.GenerateReport(Enumerable.Empty<Player>(), Enumerable.Empty<Asteroid>());

            // Assert totals
            Assert.Equal(0, report.TotalPlayers);
            Assert.Equal(0, report.TotalAsteroids);

            // Numeric fields should be zero
            Assert.Equal(0, report.AverageScore);
            Assert.Equal(0, report.MedianScore);
            Assert.Equal(0, report.StdDevScore);
            Assert.Equal(0, report.AverageAsteroidSpeed);
            Assert.Equal(0, report.AverageAsteroidSpawnRate);

            // Buckets should be present and zero
            Assert.Equal(0, report.ScoreBuckets["Low (5-15)"]);
            Assert.Equal(0, report.ScoreBuckets["Mid (16-39)"]);
            Assert.Equal(0, report.ScoreBuckets["High (40-50)"]);
        }
    }
}
