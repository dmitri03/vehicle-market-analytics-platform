namespace Marketplace.Api.Models.Dtos;

public sealed record IngestUploadResponse(
    string Type,
    long LinesRead,
    long StagingRowsInserted
);

public sealed record IngestS3Request(
    string Type,            // "vehicle" | "part" | "both"
    string Bucket,
    string? VehicleKey,
    string? PartKey
);

public sealed record IngestS3Response(
    string Bucket,
    string Type,
    IReadOnlyCollection<IngestUploadResponse> Results
);
