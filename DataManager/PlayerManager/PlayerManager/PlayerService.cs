using System.Text.Json;
using PlayerManagerApp.Models;

namespace PlayerManagerApp.Services
{
    public class PlayerService
    {
        private const string FileName = "players.json";
        public List<Player> Players { get; private set; } = new List<Player>();

        public PlayerService()
        {
            LoadPlayers();
        }

        public void AddPlayer(string name)
        {
            Players.Add(new Player { Name = name });
            SavePlayers();
        }

        // Overload to add a player with an initial high score (used by data generator)
        public void AddPlayer(string name, int highScore)
        {
            Players.Add(new Player { Name = name, HighScore = highScore });
            SavePlayers();
        }

        public void SavePlayers()
        {
            var json = JsonSerializer.Serialize(Players, new JsonSerializerOptions { WriteIndented = true });
            File.WriteAllText(FileName, json);
        }

        public void LoadPlayers()
        {
            if (File.Exists(FileName))
            {
                var json = File.ReadAllText(FileName);
                Players = JsonSerializer.Deserialize<List<Player>>(json) ?? new List<Player>();
            }
        }

        public List<Player> GetTopScores()
        {
            return Players.OrderByDescending(p => p.HighScore).Take(5).ToList();
        }
    }
}