using Amazon.S3;
using Amazon.S3.Model;
using Marketplace.Api.Data;
using Marketplace.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;
using MySqlConnector;
using System.Text;

namespace Marketplace.Api.Services;

public sealed class IngestionService : IIngestionService
{
    private readonly AppDbContext _db;
    private readonly IAmazonS3 _s3;

    public IngestionService(AppDbContext db, IAmazonS3 s3)
    {
        _db = db;
        _s3 = s3;
    }

    public async Task<IngestUploadResponse> IngestNdjsonStreamAsync(
        string type,
        Stream ndjsonStream,
        bool truncateStaging,
        CancellationToken ct)
    {
        type = NormalizeType(type);
        if (type is "both") throw new ArgumentException("Use vehicle or part for single-stream ingestion.");

        var stagingTable = type == "vehicle" ? "staging_vehicle_ndjson" : "staging_part_ndjson";

        if (truncateStaging)
            await _db.Database.ExecuteSqlRawAsync($"TRUNCATE TABLE {stagingTable};", ct);

        long linesRead = 0;
        long rowsInserted = 0;

        // Batch insert NDJSON lines.
        const int batchSize = 1000;
        var batch = new List<string>(batchSize);

        using var reader = new StreamReader(ndjsonStream, Encoding.UTF8, detectEncodingFromByteOrderMarks: true, leaveOpen: true);
        string? line;
        while ((line = await reader.ReadLineAsync()) is not null)
        {
            ct.ThrowIfCancellationRequested();
            line = line.Trim();
            if (line.Length == 0) continue;

            linesRead++;
            batch.Add(line);

            if (batch.Count >= batchSize)
            {
                rowsInserted += await InsertBatchAsync(stagingTable, batch, ct);
                batch.Clear();
            }
        }

        if (batch.Count > 0)
        {
            rowsInserted += await InsertBatchAsync(stagingTable, batch, ct);
            batch.Clear();
        }

        // Process staging into fact tables.
        if (type == "vehicle")
            await _db.Database.ExecuteSqlRawAsync("CALL sp_process_vehicle_staging();", ct);
        else
            await _db.Database.ExecuteSqlRawAsync("CALL sp_process_part_staging();", ct);

        return new IngestUploadResponse(type, linesRead, rowsInserted);
    }

    public async Task<IReadOnlyCollection<IngestUploadResponse>> IngestS3Async(
        string type,
        string bucket,
        string? vehicleKey,
        string? partKey,
        bool truncateStaging,
        CancellationToken ct)
    {
        type = NormalizeType(type);

        var results = new List<IngestUploadResponse>();

        if (type == "vehicle" || type == "both")
        {
            if (string.IsNullOrWhiteSpace(vehicleKey))
                throw new ArgumentException("vehicleKey is required for type=vehicle|both.");

            using var s3Stream = await GetS3ObjectStreamAsync(bucket, vehicleKey!, ct);
            results.Add(await IngestNdjsonStreamAsync("vehicle", s3Stream, truncateStaging, ct));
        }

        if (type == "part" || type == "both")
        {
            if (string.IsNullOrWhiteSpace(partKey))
                throw new ArgumentException("partKey is required for type=part|both.");

            using var s3Stream = await GetS3ObjectStreamAsync(bucket, partKey!, ct);
            results.Add(await IngestNdjsonStreamAsync("part", s3Stream, truncateStaging, ct));
        }

        return results;
    }

    private async Task<Stream> GetS3ObjectStreamAsync(string bucket, string key, CancellationToken ct)
    {
        var req = new GetObjectRequest { BucketName = bucket, Key = key };
        var resp = await _s3.GetObjectAsync(req, ct);
        // Caller owns the stream.
        return resp.ResponseStream;
    }

    private async Task<long> InsertBatchAsync(string stagingTable, List<string> jsonLines, CancellationToken ct)
    {
        // Use EF Core's connection for parameterized bulk insert.
        var conn = (MySqlConnection)_db.Database.GetDbConnection();
        if (conn.State != System.Data.ConnectionState.Open)
            await conn.OpenAsync(ct);

        using var cmd = conn.CreateCommand();

        var values = new StringBuilder();
        for (int i = 0; i < jsonLines.Count; i++)
        {
            if (i > 0) values.Append(',');
            values.Append($"(@p{i})");
            cmd.Parameters.AddWithValue($"@p{i}", jsonLines[i]);
        }

        cmd.CommandText = $"INSERT INTO {stagingTable} (json_text) VALUES {values};";
        var affected = await cmd.ExecuteNonQueryAsync(ct);
        return affected;
    }

    private static string NormalizeType(string type)
    {
        var t = (type ?? "").Trim().ToLowerInvariant();
        if (t is "vehicle" or "part" or "both") return t;
        throw new ArgumentException("type must be vehicle|part|both");
    }
}
