using Marketplace.Api.Models.Dtos;

namespace Marketplace.Api.Services;

public interface IListingsService
{
    Task<PagedResponse<VehicleListingDto>> SearchVehiclesAsync(
        string? make,
        string? model,
        int? yearMin,
        int? yearMax,
        int? priceMin,
        int? priceMax,
        string? state,
        int page,
        int pageSize,
        CancellationToken ct);

    Task<PagedResponse<PartListingDto>> SearchPartsAsync(
        string? make,
        string? model,
        int? yearMin,
        int? yearMax,
        int? priceMin,
        int? priceMax,
        string? state,
        int page,
        int pageSize,
        CancellationToken ct);
}
