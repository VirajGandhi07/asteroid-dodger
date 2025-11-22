using AsteroidManagerApp.Models;

namespace AsteroidManagerApp.Services
{
    public class RandomAsteroidGenerator
    {
        private static Random rnd = new Random();

        private static string[] sizes = { "Small", "Medium", "Large" };
        private static string[] materials = { "Rock", "Iron", "Crystal" };
        private static string[] types = { "Normal", "Rare", "Boss" };

        public static Asteroid Generate()
        {
            return new Asteroid
            {
                Size = sizes[rnd.Next(sizes.Length)],
                Speed = rnd.Next(1, 11),
                Material = materials[rnd.Next(materials.Length)],
                Type = types[rnd.Next(types.Length)],
                SpawnRate = rnd.Next(10, 101)
            };
        }
    }
}
