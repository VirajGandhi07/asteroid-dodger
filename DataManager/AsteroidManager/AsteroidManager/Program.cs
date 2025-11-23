using AsteroidManagerApp.Models;
using AsteroidManagerApp.Services;

namespace AsteroidManagerApp
{
    class Program
    {
        static void Main()
        {
            var service = new AsteroidService();

            while (true)
            {
                Console.Clear();
                Console.WriteLine("=== ASTEROID MANAGER ===");
                Console.WriteLine("1. List Asteroids");
                Console.WriteLine("2. Add Asteroid");
                Console.WriteLine("3. Add Random Asteroid");
                Console.WriteLine("4. Update Asteroid");
                Console.WriteLine("5. Delete Asteroid");
                Console.WriteLine("6. Exit");
                Console.Write("Choose: ");

                string choice = Console.ReadLine() ?? "";

                switch (choice)
                {
                    case "1":
                        ListAsteroids(service);
                        break;
                    case "2":
                        AddAsteroid(service);
                        break;
                    case "3":
                        var random = RandomAsteroidGenerator.Generate();
                        service.AddAsteroid(random);
                        Console.WriteLine("Random asteroid added!");
                        break;
                    case "4":
                        UpdateAsteroid(service);
                        break;
                    case "5":
                        DeleteAsteroid(service);
                        break;
                    case "6":
                        return;
                    default:
                        Console.WriteLine("Invalid choice!");
                        break;
                }

                Console.WriteLine("\nPress ENTER to continue...");
                Console.ReadLine();
            }
        }

        static void ListAsteroids(AsteroidService service)
        {
            if (!service.Asteroids.Any())
                Console.WriteLine("No asteroids available.");
            else
                service.Asteroids.ForEach(a => Console.WriteLine(a));
        }

        static void AddAsteroid(AsteroidService service)
        {
            var asteroid = new Asteroid();

            asteroid.Size = GetValidatedInput(
                "Size (Small/Medium/Large): ",
                new string[] { "Small", "Medium", "Large" });

            asteroid.Speed = GetValidatedInt(
                "Speed (1-10): ",
                1, 10);

            asteroid.Material = GetValidatedInput(
                "Material (Rock/Iron/Crystal): ",
                new string[] { "Rock", "Iron", "Crystal" });

            asteroid.Type = GetValidatedInput(
                "Type (Normal/Rare/Boss): ",
                new string[] { "Normal", "Rare", "Boss" });

            asteroid.SpawnRate = GetValidatedInt(
                "Spawn Rate (10-100): ",
                10, 100);

            service.AddAsteroid(asteroid);
            Console.WriteLine("Asteroid added!");
        }

        static void UpdateAsteroid(AsteroidService service)
        {
            Console.Write("Enter Asteroid ID to update: ");
            string? idInput = Console.ReadLine();
            if (!int.TryParse(idInput, out int id))
            {
                Console.WriteLine("Invalid ID.");
                return;
            }

            var asteroid = service.Asteroids.FirstOrDefault(a => a.Id == id);
            if (asteroid == null)
            {
                Console.WriteLine("Asteroid not found.");
                return;
            }

            asteroid.Size = GetValidatedInput(
                $"Size ({asteroid.Size}): ",
                new string[] { "Small", "Medium", "Large" },
                asteroid.Size);

            asteroid.Speed = GetValidatedInt(
                $"Speed ({asteroid.Speed}): ",
                1, 10, asteroid.Speed);

            asteroid.Material = GetValidatedInput(
                $"Material ({asteroid.Material}): ",
                new string[] { "Rock", "Iron", "Crystal" },
                asteroid.Material);

            asteroid.Type = GetValidatedInput(
                $"Type ({asteroid.Type}): ",
                new string[] { "Normal", "Rare", "Boss" },
                asteroid.Type);

            asteroid.SpawnRate = GetValidatedInt(
                $"Spawn Rate ({asteroid.SpawnRate}): ",
                10, 100, asteroid.SpawnRate);

            service.UpdateAsteroid(asteroid);
            Console.WriteLine("Asteroid updated!");
        }

        static void DeleteAsteroid(AsteroidService service)
        {
            Console.Write("Enter Asteroid ID to delete: ");
            string? idInput = Console.ReadLine();
            if (int.TryParse(idInput, out int id))
            {
                service.DeleteAsteroid(id);
                Console.WriteLine("Asteroid deleted if existed.");
            }
            else
            {
                Console.WriteLine("Invalid ID.");
            }
        }

        // Helper Methods
        static string GetValidatedInput(string prompt, string[] validOptions, string? currentValue = null)
        {
            while (true)
            {
                Console.Write(prompt);
                string input = Console.ReadLine() ?? "";
                if (string.IsNullOrWhiteSpace(input) && currentValue != null)
                    return currentValue;

                input = Capitalize(input);

                if (validOptions.Contains(input))
                    return input;

                Console.WriteLine("Invalid input. Try again.");
            }
        }

        static int GetValidatedInt(string prompt, int min, int max, int? currentValue = null)
        {
            while (true)
            {
                Console.Write(prompt);
                string input = Console.ReadLine() ?? "";
                if (string.IsNullOrWhiteSpace(input) && currentValue != null)
                    return currentValue.Value;

                if (int.TryParse(input, out int value) && value >= min && value <= max)
                    return value;

                Console.WriteLine($"Invalid input. Enter a number between {min} and {max}.");
            }
        }

        static string Capitalize(string input)
        {
            if (string.IsNullOrWhiteSpace(input)) return input;
            return char.ToUpper(input[0]) + input.Substring(1).ToLower();
        }
    }
}