using backend.Data;
using backend.DTOs;
using backend.Models;
using backend.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class MusicFoldersController : ControllerBase
{
    private readonly MusicDbContext _context;

    private readonly MusicLibraryScanner _scanner;

    public MusicFoldersController(
    MusicDbContext context,
    MusicLibraryScanner scanner)
{
    _context = context;

    _scanner = scanner;
}

    [HttpGet]
    public async Task<IActionResult> GetFolders()
    {
        var folders = await _context.MusicFolders
            .OrderBy(folder => folder.Name)
            .ToListAsync();

        return Ok(folders);
    }

    [HttpPost]
    public async Task<IActionResult> AddFolder(
        [FromBody] AddMusicFolderRequest request)
    {
        if (string.IsNullOrWhiteSpace(request.FolderPath))
        {
            return BadRequest(new
            {
                message = "Folder path is required."
            });
        }

        var fullPath = Path.GetFullPath(
            request.FolderPath);

        if (!Directory.Exists(fullPath))
        {
            return NotFound(new
            {
                message = "The specified folder does not exist."
            });
        }

        var alreadyExists =
            await _context.MusicFolders
                .AnyAsync(folder =>
                    folder.Path == fullPath);

        if (alreadyExists)
        {
            return Conflict(new
            {
                message = "This folder is already in your library."
            });
        }

        var folder = new MusicFolder
        {
            Path = fullPath,

            Name = new DirectoryInfo(fullPath).Name,

            DateAdded = DateTime.UtcNow
        };

        _context.MusicFolders.Add(folder);

        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(GetFolder),
            new { id = folder.Id },
            folder);
    }

    [HttpGet("{id:int}")]
    public async Task<IActionResult> GetFolder(int id)
    {
        var folder = await _context.MusicFolders
            .FindAsync(id);

        if (folder == null)
        {
            return NotFound();
        }

        return Ok(folder);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteFolder(int id)
    {
        var folder = await _context.MusicFolders
            .FindAsync(id);

        if (folder == null)
        {
            return NotFound();
        }

        _context.MusicFolders.Remove(folder);

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpPost("{id:int}/scan")]
public async Task<IActionResult> ScanFolder(int id)
{
    var folder =
        await _context.MusicFolders
            .FindAsync(id);

    if (folder == null)
    {
        return NotFound(new
        {
            message = "Music folder not found."
        });
    }

    try
    {
        var imported =
            await _scanner.ScanFolderAsync(folder);

        return Ok(new
        {
            message = "Folder scan completed.",

            importedCount = imported,

            lastScanned = folder.LastScanned
        });
    }
    catch (DirectoryNotFoundException)
    {
        return NotFound(new
        {
            message =
                "The folder no longer exists."
        });
    }
}

[HttpPost("cleanup")]
public async Task<IActionResult> CleanupLibrary()
{
    var removed =
        await _scanner.RemoveMissingFilesAsync();

    return Ok(new
    {
        message = "Library cleanup completed.",

        removedCount = removed
    });
}
}