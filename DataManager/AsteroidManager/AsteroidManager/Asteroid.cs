namespace AsteroidManagerApp.Models
{
    public class Asteroid
    {
        public int Id { get; set; }
        public string Size { get; set; } = "Medium"; // Small, Medium, Large
        public int Speed { get; set; }               // Units per second
        public string Material { get; set; } = "Rock"; // Rock, Iron, Crystal
        public string Type { get; set; } = "Normal";   // Normal, Rare, Boss
        public int SpawnRate { get; set; } = 50;    // Probability 0-100

        public override string ToString()
        {
            return $"ID:{Id} Size:{Size} Speed:{Speed} Material:{Material} Type:{Type} SpawnRate:{SpawnRate}";
        }
    }
}
