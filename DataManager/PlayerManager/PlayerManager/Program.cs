using PlayerManagerApp.Services;

namespace PlayerManagerApp
{
    class Program
    {
        static void Main()
        {
            var service = new PlayerService();

            while (true)
            {
                Console.Clear();
                Console.WriteLine("==== ASTEROID DODGER BACKEND ====");
                Console.WriteLine("1. Old Player");
                Console.WriteLine("2. New Player");
                Console.WriteLine("3. Scoreboard");
                Console.WriteLine("4. Instructions");
                Console.WriteLine("5. Exit");
                Console.Write("Choose: ");

                string choice = Console.ReadLine() ?? "";

                switch (choice)
                {
                    case "1":
                        ShowOldPlayers(service);
                        break;

                    case "2":
                        AddNewPlayer(service);
                        break;

                    case "3":
                        ShowScoreboard(service);
                        break;

                    case "4":
                        ShowInstructions();
                        break;

                    case "5":
                        return;

                    default:
                        Console.WriteLine("Invalid option!");
                        break;
                }

                Console.WriteLine("\nPress ENTER to continue...");
                Console.ReadLine();
            }
        }

        static void ShowOldPlayers(PlayerService service)
        {
            Console.WriteLine("\n=== Registered Players ===");
            if (!service.Players.Any())
                Console.WriteLine("No players found.");
            else
                service.Players.ForEach(p => Console.WriteLine(p.Name));
        }

        static void AddNewPlayer(PlayerService service)
        {
            Console.Write("\nEnter new player name: ");
            string name = Console.ReadLine() ?? "";

            if (string.IsNullOrWhiteSpace(name))
                Console.WriteLine("Invalid name.");
            else
            {
                service.AddPlayer(name);
                Console.WriteLine("Player added!");
            }
        }

        static void ShowScoreboard(PlayerService service)
        {
            Console.WriteLine("\n=== Top 5 Scores ===");
            var list = service.GetTopScores();

            if (!list.Any())
                Console.WriteLine("No scores available.");
            else
                list.ForEach(p => Console.WriteLine($"{p.Name}: {p.HighScore}"));
        }

        static void ShowInstructions()
        {
            Console.WriteLine("\n=== Instructions ===");
            Console.WriteLine("1. Use arrow keys to dodge asteroids.");
            Console.WriteLine("2. Score increases as you survive longer.");
        }
    }
}