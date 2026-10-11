using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Data;

public class MusicDbContext : DbContext
{
    public MusicDbContext(
        DbContextOptions<MusicDbContext> options)
        : base(options)
    {
    }

    public DbSet<Song> Songs => Set<Song>();

    public DbSet<MusicFolder> MusicFolders => Set<MusicFolder>();
}