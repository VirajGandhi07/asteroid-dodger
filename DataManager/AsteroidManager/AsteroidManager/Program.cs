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
            Console.Write("Size (Small/Medium/Large): ");
            asteroid.Size = Console.ReadLine() ?? "Medium";
            Console.Write("Speed (1-10): ");
            asteroid.Speed = int.TryParse(Console.ReadLine(), out var s) ? s : 5;
            Console.Write("Material (Rock/Iron/Crystal): ");
            asteroid.Material = Console.ReadLine() ?? "Rock";
            Console.Write("Type (Normal/Rare/Boss): ");
            asteroid.Type = Console.ReadLine() ?? "Normal";
            Console.Write("Spawn Rate (10-100): ");
            asteroid.SpawnRate = int.TryParse(Console.ReadLine(), out var r) ? r : 50;

            service.AddAsteroid(asteroid);
            Console.WriteLine("Asteroid added!");
        }

        static void UpdateAsteroid(AsteroidService service)
        {
            Console.Write("Enter Asteroid ID to update: ");
            if (int.TryParse(Console.ReadLine(), out var id))
            {
                var asteroid = service.Asteroids.FirstOrDefault(a => a.Id == id);
                if (asteroid == null)
                {
                    Console.WriteLine("Asteroid not found.");
                    return;
                }

                Console.Write($"Size ({asteroid.Size}): ");
                var input = Console.ReadLine();
                if (!string.IsNullOrWhiteSpace(input)) asteroid.Size = input;

                Console.Write($"Speed ({asteroid.Speed}): ");
                input = Console.ReadLine();
                if (int.TryParse(input, out var speed)) asteroid.Speed = speed;

                Console.Write($"Material ({asteroid.Material}): ");
                input = Console.ReadLine();
                if (!string.IsNullOrWhiteSpace(input)) asteroid.Material = input;

                Console.Write($"Type ({asteroid.Type}): ");
                input = Console.ReadLine();
                if (!string.IsNullOrWhiteSpace(input)) asteroid.Type = input;

                Console.Write($"Spawn Rate ({asteroid.SpawnRate}): ");
                input = Console.ReadLine();
                if (int.TryParse(input, out var rate)) asteroid.SpawnRate = rate;

                service.UpdateAsteroid(asteroid);
                Console.WriteLine("Asteroid updated!");
            }
        }

        static void DeleteAsteroid(AsteroidService service)
        {
            Console.Write("Enter Asteroid ID to delete: ");
            if (int.TryParse(Console.ReadLine(), out var id))
            {
                service.DeleteAsteroid(id);
                Console.WriteLine("Asteroid deleted if existed.");
            }
        }
    }
}
