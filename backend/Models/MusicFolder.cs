namespace backend.Models;

public class MusicFolder
{
    public int Id { get; set; }

    public string Path { get; set; } = "";

    public string Name { get; set; } = "";

    public DateTime DateAdded { get; set; }

    public DateTime? LastScanned { get; set; }
}