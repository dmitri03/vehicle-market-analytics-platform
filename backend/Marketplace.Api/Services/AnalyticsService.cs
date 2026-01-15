using Marketplace.Api.Data;
using Marketplace.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Api.Services;

public sealed class AnalyticsService : IAnalyticsService
{
    private readonly AppDbContext _db;

    public AnalyticsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<TrendResponse> GetInventoryTrendByStateAsync(
        string listingType,
        string state,
        string? make,
        string? model,
        DateTime? from,
        DateTime? to,
        CancellationToken ct)
    {
        listingType = (listingType ?? "vehicle").Trim().ToLowerInvariant();
        if (listingType != "vehicle" && listingType != "part")
            throw new ArgumentException("listingType must be 'vehicle' or 'part'.");

        var st = (state ?? "").Trim().ToUpperInvariant();
        if (st.Length != 2) throw new ArgumentException("state must be a 2-letter code (e.g., WA).");

        var q = from inv in _db.InventoryDaily.AsNoTracking()
                join mk in _db.Makes.AsNoTracking() on inv.MakeId equals mk.MakeId into mkj
                from mk in mkj.DefaultIfEmpty()
                join md in _db.Models.AsNoTracking() on inv.ModelId equals md.ModelId into mdj
                from md in mdj.DefaultIfEmpty()
                where inv.State == st && inv.ListingType == listingType
                select new { inv, mk, md };

        if (!string.IsNullOrWhiteSpace(make))
            q = q.Where(x => x.mk != null && x.mk.MakeName == make!.Trim().ToLowerInvariant());

        if (!string.IsNullOrWhiteSpace(model))
            q = q.Where(x => x.md != null && x.md.ModelName == model!.Trim().ToLowerInvariant());

        if (from.HasValue) q = q.Where(x => x.inv.SnapshotDate >= from.Value.Date);
        if (to.HasValue) q = q.Where(x => x.inv.SnapshotDate <= to.Value.Date);

        var series = await q
            .GroupBy(x => x.inv.SnapshotDate)
            .Select(g => new TrendPoint(g.Key, g.Sum(x => (double)x.inv.ListingCount)))
            .OrderBy(x => x.SnapshotDate)
            .ToListAsync(ct);

        var reg = LinearRegression(series.Select((p, i) => (x: (double)i, y: p.Value)).ToList());

        return new TrendResponse(
            Metric: "inventory_count",
            Series: series,
            SlopePerDay: reg?.slope,
            Intercept: reg?.intercept,
            RSquared: reg?.r2
        );
    }

    public async Task<TrendResponse> GetAveragePriceTrendAsync(
        string state,
        string? make,
        string? model,
        DateTime? from,
        DateTime? to,
        CancellationToken ct)
    {
        var st = (state ?? "").Trim().ToUpperInvariant();
        if (st.Length != 2) throw new ArgumentException("state must be a 2-letter code (e.g., WA).");

        var q = from v in _db.VehicleListings.AsNoTracking()
                join mk in _db.Makes.AsNoTracking() on v.MakeId equals mk.MakeId into mkj
                from mk in mkj.DefaultIfEmpty()
                join md in _db.Models.AsNoTracking() on v.ModelId equals md.ModelId into mdj
                from md in mdj.DefaultIfEmpty()
                join loc in _db.Locations.AsNoTracking() on v.LocationId equals loc.LocationId
                where loc.State == st && v.Price != null
                select new { v, mk, md, loc };

        if (!string.IsNullOrWhiteSpace(make))
            q = q.Where(x => x.mk != null && x.mk.MakeName == make!.Trim().ToLowerInvariant());

        if (!string.IsNullOrWhiteSpace(model))
            q = q.Where(x => x.md != null && x.md.ModelName == model!.Trim().ToLowerInvariant());

        if (from.HasValue) q = q.Where(x => x.v.SnapshotDate >= from.Value.Date);
        if (to.HasValue) q = q.Where(x => x.v.SnapshotDate <= to.Value.Date);

        var series = await q
            .GroupBy(x => x.v.SnapshotDate)
            .Select(g => new TrendPoint(g.Key, g.Average(x => (double)x.v.Price!.Value)))
            .OrderBy(x => x.SnapshotDate)
            .ToListAsync(ct);

        var reg = LinearRegression(series.Select((p, i) => (x: (double)i, y: p.Value)).ToList());

        return new TrendResponse(
            Metric: "avg_price",
            Series: series,
            SlopePerDay: reg?.slope,
            Intercept: reg?.intercept,
            RSquared: reg?.r2
        );
    }

    private static (double slope, double intercept, double r2)? LinearRegression(IReadOnlyList<(double x, double y)> pts)
    {
        if (pts.Count < 2) return null;

        double n = pts.Count;
        double sumX = 0, sumY = 0, sumXX = 0, sumXY = 0;

        for (int i = 0; i < pts.Count; i++)
        {
            var (x, y) = pts[i];
            sumX += x;
            sumY += y;
            sumXX += x * x;
            sumXY += x * y;
        }

        var denom = (n * sumXX - sumX * sumX);
        if (Math.Abs(denom) < 1e-12) return null;

        var slope = (n * sumXY - sumX * sumY) / denom;
        var intercept = (sumY - slope * sumX) / n;

        double ssTot = 0, ssRes = 0;
        var yMean = sumY / n;

        foreach (var (x, y) in pts)
        {
            var yHat = slope * x + intercept;
            ssTot += (y - yMean) * (y - yMean);
            ssRes += (y - yHat) * (y - yHat);
        }

        var r2 = ssTot <= 1e-12 ? 1.0 : 1.0 - (ssRes / ssTot);
        return (slope, intercept, r2);
    }
}
