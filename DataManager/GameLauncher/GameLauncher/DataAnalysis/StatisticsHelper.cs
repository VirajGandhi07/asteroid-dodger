using System;
using System.Collections.Generic;
using System.Linq;
using AsteroidManagerApp.Models;
using PlayerManagerApp.Models;

namespace GameLauncher.DataAnalysis
{
    public static class StatisticsHelper
    {
        // Generate a report result using LINQ queries
        public static ReportResult GenerateReport(IEnumerable<Player> players, IEnumerable<Asteroid> asteroids)
        {
            var result = new ReportResult();

            var playerList = (players ?? Enumerable.Empty<Player>()).ToList();
            var asteroidList = (asteroids ?? Enumerable.Empty<Asteroid>()).ToList();

            result.TotalPlayers = playerList.Count;
            result.TotalAsteroids = asteroidList.Count;

            if (playerList.Count > 0)
            {
                // LINQ Average
                result.AverageScore = playerList.Average(p => p.HighScore);

                // LINQ Median
                var ordered = playerList.Select(p => p.HighScore).OrderBy(s => s).ToArray();
                int n = ordered.Length;
                if (n % 2 == 1)
                    result.MedianScore = ordered[n / 2];
                else
                    result.MedianScore = (ordered[(n / 2) - 1] + ordered[n / 2]) / 2.0;

                // Standard deviation (population)
                double mean = result.AverageScore;
                result.StdDevScore = Math.Sqrt(ordered.Select(s => Math.Pow(s - mean, 2)).Average());

                // Buckets
                int low = playerList.Count(p => p.HighScore >= 5 && p.HighScore <= 15);
                int mid = playerList.Count(p => p.HighScore >= 16 && p.HighScore <= 39);
                int high = playerList.Count(p => p.HighScore >= 40 && p.HighScore <= 50);

                result.ScoreBuckets["Low (5-15)"] = low;
                result.ScoreBuckets["Mid (16-39)"] = mid;
                result.ScoreBuckets["High (40-50)"] = high;
            }
            else
            {
                result.AverageScore = 0;
                result.MedianScore = 0;
                result.StdDevScore = 0;
                result.ScoreBuckets["Low (5-15)"] = 0;
                result.ScoreBuckets["Mid (16-39)"] = 0;
                result.ScoreBuckets["High (40-50)"] = 0;
            }

            if (asteroidList.Count > 0)
            {
                result.AverageAsteroidSpeed = asteroidList.Average(a => a.Speed);
                result.AverageAsteroidSpawnRate = asteroidList.Average(a => a.SpawnRate);
            }
            else
            {
                result.AverageAsteroidSpeed = 0;
                result.AverageAsteroidSpawnRate = 0;
            }

            return result;
        }
    }
}
