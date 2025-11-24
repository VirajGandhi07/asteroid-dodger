using System;
using System.Collections.Generic;
using PlayerManagerApp.Models;
using PlayerManagerApp.Services;
using AsteroidManagerApp.Models;
using AsteroidManagerApp.Services;

namespace GameLauncher
{
    public static class RandomDataGenerator
    {
        private static Random rnd = new Random();

        // Simple name parts to compose realistic-sounding player names
        private static string[] firstNames = new[] { "Alex", "Sam", "Chris", "Taylor", "Jordan", "Morgan", "Casey", "Riley", "Avery", "Jamie", "Robin", "Drew", "Devon", "Parker", "Quinn" };
        private static string[] lastNames = new[] { "Stone", "Reed", "Morgan", "Cole", "Banks", "Hayes", "Reynolds", "Baker", "Knight", "Parker", "Hayward", "Carter", "Bell", "Wells", "Sutton" };

        // Generate N players with realistic high-score distribution
        public static void GeneratePlayers(int count, PlayerService playerService, int maxScore = 10000)
        {
            if (count <= 0) return;

            var used = new HashSet<string>(StringComparer.OrdinalIgnoreCase);

            for (int i = 0; i < count; i++)
            {
                string name;
                int attempt = 0;
                do
                {
                    name = ComposeName();
                    attempt++;
                    if (attempt > 5) name += $"_{i}";
                } while (used.Contains(name));

                used.Add(name);

                // Generate realistic scores between 5 and 50 (inclusive)
                // Distribution: low (5-15) rare, high (40-50) rare, most values in mid (16-39)
                double u = rnd.NextDouble();
                int score;
                if (u < 0.10) // 10% chance low score
                {
                    score = rnd.Next(5, 16); // 5..15
                }
                else if (u > 0.90) // 10% chance high score
                {
                    score = rnd.Next(40, 51); // 40..50
                }
                else // 80% chance mid-range
                {
                    score = rnd.Next(16, 40); // 16..39
                }

                playerService.AddPlayer(name, score);
            }
        }

        // Generate N asteroids using existing Asteroid generator and persist
        public static void GenerateAsteroids(int count, AsteroidService asteroidService)
        {
            if (count <= 0) return;

            for (int i = 0; i < count; i++)
            {
                var a = RandomAsteroidGenerator.Generate();
                asteroidService.AddAsteroid(a);
            }
        }

        // Interactive helper used by GameLauncher CLI
        public static void GenerateSampleDataInteractive(PlayerService playerService, AsteroidService asteroidService)
        {
            Console.WriteLine("\n=== SAMPLE DATA GENERATOR ===");
            Console.Write("Number of players to generate: ");
            int players = ReadPositiveInt();

            Console.Write("Number of asteroids to generate: ");
            int asteroids = ReadPositiveInt();

            Console.Write("Overwrite existing data? (y/N): ");
            string ow = (Console.ReadLine() ?? "").Trim().ToLower();
            bool overwrite = ow == "y" || ow == "yes";

            if (overwrite)
            {
                playerService.Players.Clear();
                asteroidService.Asteroids.Clear();
            }

            Console.WriteLine("Generating players...");
            GeneratePlayers(players, playerService);

            Console.WriteLine("Generating asteroids...");
            GenerateAsteroids(asteroids, asteroidService);

            Console.WriteLine($"Generated {players} players and {asteroids} asteroids.\n");
        }

        private static int ReadPositiveInt()
        {
            while (true)
            {
                string? s = Console.ReadLine();
                if (int.TryParse(s, out int n) && n >= 0)
                    return n;
                Console.Write("Please enter a non-negative integer: ");
            }
        }

        private static string ComposeName()
        {
            var f = firstNames[rnd.Next(firstNames.Length)];
            var l = lastNames[rnd.Next(lastNames.Length)];
            return $"{f} {l}";
        }
    }
}
