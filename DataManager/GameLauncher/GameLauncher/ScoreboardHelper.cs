using System.Collections.Generic;
using System.Linq;
using PlayerManagerApp.Services;

namespace GameLauncher
{
    public static class ScoreboardHelper
    {
        // Returns formatted lines for the top N players by HighScore
        public static IEnumerable<string> GetTopScoreLines(PlayerService svc, int topN = 5)
        {
            if (svc == null) yield break;

            var top = svc.GetTopScores() ?? new System.Collections.Generic.List<PlayerManagerApp.Models.Player>();
            int rank = 1;
            foreach (var p in top.Take(topN))
            {
                yield return $"{rank}. {p.Name} - {p.HighScore}";
                rank++;
            }
        }
    }
}
