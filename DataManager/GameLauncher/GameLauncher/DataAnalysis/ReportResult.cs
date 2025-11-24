using System.Collections.Generic;

namespace GameLauncher.DataAnalysis
{
    public class ReportResult
    {
        public int TotalPlayers { get; set; }
        public int TotalAsteroids { get; set; }

        public double AverageScore { get; set; }
        public double MedianScore { get; set; }
        public double StdDevScore { get; set; }

        public double AverageAsteroidSpeed { get; set; }
        public double AverageAsteroidSpawnRate { get; set; }

        // Counts per bucket: "Low", "Mid", "High"
        public Dictionary<string, int> ScoreBuckets { get; set; } = new Dictionary<string, int>();
    }
}
