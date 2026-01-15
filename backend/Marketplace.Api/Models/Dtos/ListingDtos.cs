namespace Marketplace.Api.Models.Dtos;

public sealed record VehicleListingDto(
    string ListingHash,
    string Url,
    string? Make,
    string? Model,
    int? Year,
    string? ModelConfig,
    int? Price,
    string? Mileage,
    string? City,
    string? State,
    decimal? Latitude,
    decimal? Longitude,
    bool IsDealership,
    DateTime ScrapedAt
);

public sealed record PartListingDto(
    string ListingHash,
    string Url,
    string? Make,
    string? Model,
    int? Year,
    string? Title,
    string? Description,
    int? Price,
    string? City,
    string? State,
    decimal? Latitude,
    decimal? Longitude,
    bool IsDealership,
    DateTime ScrapedAt
);

public sealed record PagedResponse<T>(IReadOnlyCollection<T> Items, int Page, int PageSize, int Returned);
