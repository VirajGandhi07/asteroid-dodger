namespace PlayerManagerApp.Models
{
    public class Player
    {
        public string Name { get; set; } = "";
        public int HighScore { get; set; } = 0;

        public override string ToString()
        {
            return $"{Name} - {HighScore}";
        }
    }
}