using Marketplace.Api.Models.Dtos;

namespace Marketplace.Api.Services;

public interface IAnalyticsService
{
    Task<TrendResponse> GetInventoryTrendByStateAsync(
        string listingType,
        string state,
        string? make,
        string? model,
        DateTime? from,
        DateTime? to,
        CancellationToken ct);

    Task<TrendResponse> GetAveragePriceTrendAsync(
        string state,
        string? make,
        string? model,
        DateTime? from,
        DateTime? to,
        CancellationToken ct);
}
