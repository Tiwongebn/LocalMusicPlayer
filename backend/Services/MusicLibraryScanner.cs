using backend.Data;
using backend.Models;
using Microsoft.EntityFrameworkCore;

namespace backend.Services;

public class MusicLibraryScanner
{
    private readonly MusicDbContext _context;

    private readonly ILogger<MusicLibraryScanner> _logger;

    private static readonly string[] SupportedExtensions =
    {
        ".mp3",
        ".flac",
        ".wav",
        ".m4a",
        ".aac",
        ".ogg",
        ".opus"
    };

    public MusicLibraryScanner(
        MusicDbContext context,
        ILogger<MusicLibraryScanner> logger)
    {
        _context = context;
        _logger = logger;
    }

    public async Task<int> ScanFolderAsync(
        MusicFolder musicFolder)
    {
        if (!Directory.Exists(musicFolder.Path))
        {
            throw new DirectoryNotFoundException(
                $"The folder '{musicFolder.Path}' does not exist.");
        }

        var files = Directory
            .EnumerateFiles(
                musicFolder.Path,
                "*.*",
                SearchOption.AllDirectories)
            .Where(IsSupportedAudioFile)
            .ToList();

        var importedCount = 0;

        foreach (var filePath in files)
        {
            try
            {
                var imported =
                    await ImportSongAsync(filePath);

                if (imported)
                {
                    importedCount++;
                }
            }
            catch (Exception ex)
            {
                _logger.LogError(
                    ex,
                    "Could not import music file: {FilePath}",
                    filePath);
            }
        }

        musicFolder.LastScanned =
            DateTime.UtcNow;

        await _context.SaveChangesAsync();

        return importedCount;
    }

    private async Task<bool> ImportSongAsync(
        string filePath)
    {
        var normalizedPath =
            Path.GetFullPath(filePath);

        var alreadyExists =
            await _context.Songs
                .AnyAsync(song =>
                    song.FilePath == normalizedPath);

        if (alreadyExists)
        {
            return false;
        }

        using var file =
            TagLib.File.Create(filePath);

        var song = new Song
        {
            Title =
                string.IsNullOrWhiteSpace(
                    file.Tag.Title)
                    ? Path.GetFileNameWithoutExtension(
                        filePath)
                    : file.Tag.Title,

            Artist =
                file.Tag.FirstPerformer
                ?? "Unknown Artist",

            Album =
                file.Tag.Album
                ?? "Unknown Album",

            Genre =
                file.Tag.FirstGenre
                ?? "Unknown Genre",

            TrackNumber =
                (int)file.Tag.Track,

            Year =
                (int)file.Tag.Year,

            Duration =
                file.Properties.Duration.TotalSeconds,

            FilePath =
                normalizedPath,

            ArtworkPath = "",

            DateAdded =
                DateTime.UtcNow
        };

        _context.Songs.Add(song);

        return true;
    }

    private static bool IsSupportedAudioFile(
        string filePath)
    {
        var extension =
            Path.GetExtension(filePath);

        return SupportedExtensions.Contains(
            extension,
            StringComparer.OrdinalIgnoreCase);
    }

    public async Task<int> RemoveMissingFilesAsync()
{
    var songs =
        await _context.Songs.ToListAsync();

    var missingSongs =
        songs
            .Where(song =>
                !File.Exists(song.FilePath))
            .ToList();

    if (missingSongs.Count == 0)
    {
        return 0;
    }

    _context.Songs.RemoveRange(
        missingSongs);

    await _context.SaveChangesAsync();

    return missingSongs.Count;
}
}