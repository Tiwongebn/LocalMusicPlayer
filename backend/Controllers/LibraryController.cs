using backend.DTOs;
using backend.Services;
using Microsoft.AspNetCore.Mvc;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class LibraryController : ControllerBase
{
    private readonly MusicLibraryScanner _scanner;

    public LibraryController(MusicLibraryScanner scanner)
    {
        _scanner = scanner;
    }

    [HttpPost("scan")]
public async Task<IActionResult> Scan(string folderPath)
{
    var folder = new backend.Models.MusicFolder
    {
        Path = Path.GetFullPath(folderPath),
        Name = new DirectoryInfo(folderPath).Name,
        DateAdded = DateTime.UtcNow
    };

    var count = await _scanner.ScanFolderAsync(folder);

    return Ok(new
    {
        importedCount = count
    });
}
}