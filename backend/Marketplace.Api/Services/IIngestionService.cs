using Marketplace.Api.Models.Dtos;

namespace Marketplace.Api.Services;

public interface IIngestionService
{
    Task<IngestUploadResponse> IngestNdjsonStreamAsync(
        string type,
        Stream ndjsonStream,
        bool truncateStaging,
        CancellationToken ct);

    Task<IReadOnlyCollection<IngestUploadResponse>> IngestS3Async(
        string type,
        string bucket,
        string? vehicleKey,
        string? partKey,
        bool truncateStaging,
        CancellationToken ct);
}
