using Marketplace.Api.Models.Dtos;
using Marketplace.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/admin/ingest")]
[Authorize(Roles = "admin")]
public sealed class AdminIngestionController : ControllerBase
{
    private readonly IIngestionService _ingestion;

    public AdminIngestionController(IIngestionService ingestion)
    {
        _ingestion = ingestion;
    }

    /// <summary>
    /// Upload NDJSON, ingest into staging, then process to fact tables.
    /// </summary>
    /// <param name="type">vehicle|part</param>
    /// <param name="file">NDJSON file</param>
    /// <param name="truncateStaging">Truncate staging before load</param>
    [HttpPost("ndjson")]
    [RequestSizeLimit(200_000_000)] // 200 MB limit
    public async Task<ActionResult<IngestUploadResponse>> UploadNdjson(
        [FromQuery] string type,
        [FromForm] IFormFile file,
        [FromQuery] bool truncateStaging = true,
        CancellationToken ct = default)
    {
        if (file is null || file.Length == 0)
            return BadRequest(new { error = "File is required." });

        if (!type.Equals("vehicle", StringComparison.OrdinalIgnoreCase) &&
            !type.Equals("part", StringComparison.OrdinalIgnoreCase))
        {
            return BadRequest(new { error = "type must be vehicle or part for upload endpoint." });
        }

        await using var stream = file.OpenReadStream();
        var res = await _ingestion.IngestNdjsonStreamAsync(type, stream, truncateStaging, ct);
        return Ok(res);
    }

    /// <summary>
    /// Ingest NDJSON from S3; type=both requires both keys.
    /// </summary>
    [HttpPost("from-s3")]
    public async Task<ActionResult<IngestS3Response>> IngestFromS3(
        [FromBody] IngestS3Request req,
        [FromQuery] bool truncateStaging = true,
        CancellationToken ct = default)
    {
        if (string.IsNullOrWhiteSpace(req.Bucket))
            return BadRequest(new { error = "bucket is required." });

        var results = await _ingestion.IngestS3Async(
            req.Type,
            req.Bucket,
            req.VehicleKey,
            req.PartKey,
            truncateStaging,
            ct);

        return Ok(new IngestS3Response(req.Bucket, req.Type, results));
    }
}
