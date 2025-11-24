using System;
using System.Linq;
using PlayerManagerApp.Services;          // Player services
using AsteroidManagerApp.Services;        // Asteroid services
using AsteroidManagerApp.Models;          // Asteroid model
using GameLauncher.DataAnalysis;

namespace GameLauncher
{
    class Program
    {
        static PlayerService playerService = new PlayerService();
        static AsteroidService asteroidService = new AsteroidService();

        static void Main(string[] args)
        {
            Console.Clear();
            Console.WriteLine("=== ASTEROID DODGER GAME LAUNCHER ===");
            MainMenu();
        }

        // MAIN MENU
        static void MainMenu()
        {
            while (true)
            {
                Console.WriteLine("\n=== MAIN MENU ===");
                Console.WriteLine("1. Play");
                Console.WriteLine("2. Reports");
                Console.WriteLine("3. Generate Sample Data");
                Console.WriteLine("4. How to Play");
                Console.WriteLine("5. Exit");

                Console.Write("Choose an option: ");
                string choice = Console.ReadLine()?.Trim() ?? "";

                switch (choice)
                {
                    case "1":
                        PlayMenu();
                        break;
                    case "2":
                        var report = StatisticsHelper.GenerateReport(playerService.Players, asteroidService.Asteroids);
                        ReportPrinter.PrintReport(report);
                        break;
                    case "3":
                        RandomDataGenerator.GenerateSampleDataInteractive(playerService, asteroidService);
                        break;
                    case "4":
                        ShowInstructions();
                        break;
                    case "5":
                        Console.WriteLine("Exiting... Goodbye!");
                        return;
                    default:
                        Console.WriteLine("Invalid choice. Try again.");
                        break;
                }
            }
        }

        // PLAY MENU
        static void PlayMenu()
        {
            while (true)
            {
                Console.WriteLine("\n=== PLAY MENU ===");
                Console.WriteLine("1. Existing Player");
                Console.WriteLine("2. New Player");
                Console.WriteLine("3. Scoreboard");
                Console.WriteLine("4. Asteroids");
                Console.WriteLine("5. Back");

                Console.Write("Choose an option: ");
                string choice = Console.ReadLine()?.Trim() ?? "";

                switch (choice)
                {
                    case "1":
                        ExistingPlayerFlow();
                        break;
                    case "2":
                        NewPlayerFlow();
                        break;
                    case "3":
                        ShowScoreboard();
                        break;
                    case "4":
                        AsteroidMenu();
                        break;
                    case "5":
                        return;
                    default:
                        Console.WriteLine("Invalid option. Try again.");
                        break;
                }
            }
        }

        // EXISTING PLAYER FLOW
        static void ExistingPlayerFlow()
        {
            Console.Write("\nEnter your name: ");
            string name = (Console.ReadLine() ?? "").Trim();

            var player = playerService.Players.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            if (player == null)
            {
                Console.WriteLine("Player does not exist! Returning to Play Menu...");
                return;
            }

            Console.WriteLine($"Welcome back, {player.Name}!");
            StartGame();
        }

        // NEW PLAYER FLOW
        static void NewPlayerFlow()
        {
            Console.Write("\nEnter your name: ");
            string name = (Console.ReadLine() ?? "").Trim();

            var player = playerService.Players.FirstOrDefault(p => p.Name.Equals(name, StringComparison.OrdinalIgnoreCase));
            if (player != null)
            {
                Console.WriteLine("Player already exists! Returning to Play Menu...");
                return;
            }

            playerService.AddPlayer(name);
            Console.WriteLine($"Player {name} created successfully!\n");
            StartGame();
        }

        // ASTEROID MENU
        static void AsteroidMenu()
        {
            while (true)
            {
                Console.WriteLine("\n=== ASTEROID MANAGER ===");
                Console.WriteLine("1. List Asteroids");
                Console.WriteLine("2. Add Asteroid");
                Console.WriteLine("3. Add Random Asteroid");
                Console.WriteLine("4. Update Asteroid");
                Console.WriteLine("5. Delete Asteroid");
                Console.WriteLine("6. Back");

                Console.Write("Choose an option: ");
                string choice = Console.ReadLine()?.Trim() ?? "";

                switch (choice)
                {
                    case "1":
                        PrintAsteroids();
                        break;
                    case "2":
                        AddAsteroidFlow();
                        break;
                    case "3":
                        var a = RandomAsteroidGenerator.Generate();
                        asteroidService.AddAsteroid(a);
                        Console.WriteLine("Random asteroid added!");
                        break;
                    case "4":
                        UpdateAsteroidFlow();
                        break;
                    case "5":
                        DeleteAsteroidFlow();
                        break;
                    case "6":
                        return;
                    default:
                        Console.WriteLine("Invalid choice.");
                        break;
                }
            }
        }

        // ADD ASTEROID FLOW
        static void AddAsteroidFlow()
        {
            Console.Write("Size (Small/Medium/Large): ");
            string size = ValidateInput(new[] { "small", "medium", "large" });

            Console.Write("Speed (1-10): ");
            int speed = ValidateNumberRange(1, 10);

            Console.Write("Material (Rock/Metal/Ice): ");
            string material = ValidateInput(new[] { "rock", "metal", "ice" });

            Console.Write("Type (Common/Rare/Legendary): ");
            string type = ValidateInput(new[] { "common", "rare", "legendary" });

            Console.Write("Spawn Rate (1–100): ");
            int spawnRate = ValidateNumberRange(1, 100);

            var asteroid = new Asteroid
            {
                Size = size,
                Speed = speed,
                Material = material,
                Type = type,
                SpawnRate = spawnRate
            };

            asteroidService.AddAsteroid(asteroid);
            Console.WriteLine("Asteroid added!");
        }

        // UPDATE ASTEROID
        static void UpdateAsteroidFlow()
        {
            PrintAsteroids();

            Console.Write("Enter Asteroid ID to update: ");
            int id = ValidateNumber();

            var asteroid = asteroidService.Asteroids.FirstOrDefault(a => a.Id == id);
            if (asteroid == null)
            {
                Console.WriteLine("Asteroid not found.");
                return;
            }

            Console.Write("New Size: ");
            string size = ValidateInput(new[] { "small", "medium", "large" });

            Console.Write("New Speed (1-10): ");
            int speed = ValidateNumberRange(1, 10);

            Console.Write("New Material: ");
            string material = ValidateInput(new[] { "rock", "metal", "ice" });

            Console.Write("New Type: ");
            string type = ValidateInput(new[] { "common", "rare", "legendary" });

            Console.Write("New Spawn Rate (1–100): ");
            int sr = ValidateNumberRange(1, 100);

            asteroid.Size = size;
            asteroid.Speed = speed;
            asteroid.Material = material;
            asteroid.Type = type;
            asteroid.SpawnRate = sr;

            asteroidService.UpdateAsteroid(asteroid);
            Console.WriteLine("Asteroid updated!");
        }

        // DELETE ASTEROID
        static void DeleteAsteroidFlow()
        {
            PrintAsteroids();

            Console.Write("Enter ID to delete: ");
            int id = ValidateNumber();

            asteroidService.DeleteAsteroid(id);
            Console.WriteLine("Asteroid deleted if existed.");
        }

        // Helper: print asteroids (refactored to use LINQ)
        static void PrintAsteroids()
        {
            if (!asteroidService.Asteroids.Any())
                Console.WriteLine("No asteroids available.");
            else
                Console.WriteLine(string.Join(Environment.NewLine, asteroidService.Asteroids.Select(a => a.ToString())));
        }

        // INPUT VALIDATION
        static string ValidateInput(string[] valid)
        {
            while (true)
            {
                string input = (Console.ReadLine() ?? "").Trim().ToLower();
                foreach (var v in valid)
                {
                    if (input == v.ToLower())
                        return char.ToUpper(input[0]) + input.Substring(1);
                }

                Console.Write("Invalid input, try again: ");
            }
        }

        static int ValidateNumber()
        {
            while (true)
            {
                if (int.TryParse(Console.ReadLine(), out int num))
                    return num;

                Console.Write("Invalid number. Try again: ");
            }
        }

        static int ValidateNumberRange(int min, int max)
        {
            while (true)
            {
                if (int.TryParse(Console.ReadLine(), out int num) && num >= min && num <= max)
                    return num;

                Console.Write($"Invalid number. Enter a number between {min} and {max}: ");
            }
        }

        // GAME LAUNCHER (placeholder for real game)
        static void StartGame()
        {
            Console.WriteLine("\n*** Starting the game... ***");
            Console.WriteLine("(This will later launch the HTML/JS asteroid dodger.)\n");
        }

        // INSTRUCTIONS
        static void ShowInstructions()
        {
            Console.WriteLine("\n=== INSTRUCTIONS ===");
            Console.WriteLine("Use arrow keys to dodge asteroids.");
            Console.WriteLine("Survive as long as possible!");
            Console.WriteLine("Scores will be saved automatically.");
        }

        // SCOREBOARD
        static void ShowScoreboard()
        {
            Console.WriteLine("\n=== SCOREBOARD ===");
            var top = playerService.GetTopScores();
            if (top == null || top.Count == 0)
            {
                Console.WriteLine("No scores yet.");
                return;
            }

            int rank = 1;
            foreach (var p in top)
            {
                Console.WriteLine($"{rank}. {p.Name} - {p.HighScore}");
                rank++;
            }
        }
    }
}
