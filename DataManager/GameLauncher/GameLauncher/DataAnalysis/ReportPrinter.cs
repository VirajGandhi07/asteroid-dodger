using System;

namespace GameLauncher.DataAnalysis
{
    public static class ReportPrinter
    {
        public static void PrintReport(ReportResult r)
        {
            Console.WriteLine("\n=== DATA ANALYSIS REPORT ===");
            Console.WriteLine($"Total players: {r.TotalPlayers}");
            Console.WriteLine($"Total asteroids: {r.TotalAsteroids}");

            Console.WriteLine('\n' + "-- Player Scores --");
            Console.WriteLine($"Average score: {r.AverageScore:F2}");
            Console.WriteLine($"Median score : {r.MedianScore:F2}");
            Console.WriteLine($"Std. dev.     : {r.StdDevScore:F2}");

            Console.WriteLine('\n' + "-- Score Buckets --");
            foreach (var kv in r.ScoreBuckets)
            {
                Console.WriteLine($"{kv.Key}: {kv.Value}");
            }

            Console.WriteLine('\n' + "-- Asteroid Averages --");
            Console.WriteLine($"Avg speed     : {r.AverageAsteroidSpeed:F2}");
            Console.WriteLine($"Avg spawnRate : {r.AverageAsteroidSpawnRate:F2}");

            Console.WriteLine("\nReport complete.\n");
        }
    }
}
