using backend.Data;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class SongsController : ControllerBase
{
    private readonly MusicDbContext _context;

    public SongsController(MusicDbContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<IActionResult> GetSongs()
    {
        var songs = await _context.Songs
            .OrderBy(song => song.Artist)
            .ThenBy(song => song.Album)
            .ThenBy(song => song.TrackNumber)
            .ToListAsync();

        return Ok(songs);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetSong(int id)
    {
        var song = await _context.Songs
            .FirstOrDefaultAsync(song => song.Id == id);

        if (song == null)
        {
            return NotFound();
        }

        return Ok(song);
    }

    [HttpGet("{id:int}/stream")]
    public async Task<IActionResult> StreamSong(int id)
    {
        var song = await _context.Songs
            .FirstOrDefaultAsync(song => song.Id == id);

        if (song == null)
        {
            return NotFound(new
            {
                message = "Song not found."
            });
        }

        if (!System.IO.File.Exists(song.FilePath))
        {
            return NotFound(new
            {
                message = "Music file no longer exists."
            });
        }

        var contentType = GetContentType(song.FilePath);

        var stream = new FileStream(
            song.FilePath,
            FileMode.Open,
            FileAccess.Read,
            FileShare.Read);

        return File(
            stream,
            contentType,
            enableRangeProcessing: true);
    }

    private static string GetContentType(string filePath)
    {
        var extension = Path.GetExtension(filePath)
            .ToLowerInvariant();

        return extension switch
        {
            ".mp3" => "audio/mpeg",
            ".wav" => "audio/wav",
            ".flac" => "audio/flac",
            ".m4a" => "audio/mp4",
            ".aac" => "audio/aac",
            ".ogg" => "audio/ogg",
            ".opus" => "audio/ogg",
            _ => "application/octet-stream"
        };
    }
}