namespace Marketplace.Api.Models.Dtos;

public sealed record TrendPoint(DateTime SnapshotDate, double Value);

public sealed record TrendResponse(
    string Metric,
    IReadOnlyCollection<TrendPoint> Series,
    double? SlopePerDay,
    double? Intercept,
    double? RSquared
);
