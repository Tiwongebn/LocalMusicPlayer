namespace backend.Models;

public class Song
{
    public int Id { get; set; }

    public string Title { get; set; } = "";

    public string Artist { get; set; } = "";

    public string Album { get; set; } = "";

    public string Genre { get; set; } = "";

    public int TrackNumber { get; set; }

    public int Year { get; set; }

    public double Duration { get; set; }

    public string FilePath { get; set; } = "";

    public string ArtworkPath { get; set; } = "";

    public DateTime DateAdded { get; set; }
}