using Marketplace.Api.Data;
using Marketplace.Api.Models.Dtos;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Api.Services;

public sealed class ListingsService : IListingsService
{
    private readonly AppDbContext _db;

    public ListingsService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<PagedResponse<VehicleListingDto>> SearchVehiclesAsync(
        string? make,
        string? model,
        int? yearMin,
        int? yearMax,
        int? priceMin,
        int? priceMax,
        string? state,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var q = from v in _db.VehicleListings.AsNoTracking()
                join mk in _db.Makes.AsNoTracking() on v.MakeId equals mk.MakeId into mkj
                from mk in mkj.DefaultIfEmpty()
                join md in _db.Models.AsNoTracking() on v.ModelId equals md.ModelId into mdj
                from md in mdj.DefaultIfEmpty()
                join loc in _db.Locations.AsNoTracking() on v.LocationId equals loc.LocationId into locj
                from loc in locj.DefaultIfEmpty()
                select new { v, mk, md, loc };

        if (!string.IsNullOrWhiteSpace(make))
            q = q.Where(x => x.mk != null && x.mk.MakeName == make!.Trim().ToLower());

        if (!string.IsNullOrWhiteSpace(model))
            q = q.Where(x => x.md != null && x.md.ModelName == model!.Trim().ToLower());

        if (yearMin.HasValue) q = q.Where(x => x.v.Year != null && x.v.Year >= yearMin.Value);
        if (yearMax.HasValue) q = q.Where(x => x.v.Year != null && x.v.Year <= yearMax.Value);

        if (priceMin.HasValue) q = q.Where(x => x.v.Price != null && x.v.Price >= priceMin.Value);
        if (priceMax.HasValue) q = q.Where(x => x.v.Price != null && x.v.Price <= priceMax.Value);

        if (!string.IsNullOrWhiteSpace(state))
            q = q.Where(x => x.loc != null && x.loc.State == state!.Trim().ToUpperInvariant());

        var items = await q
            .OrderByDescending(x => x.v.ScrapedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new VehicleListingDto(
                x.v.ListingHash,
                x.v.Url,
                x.mk != null ? x.mk.MakeName : null,
                x.md != null ? x.md.ModelName : null,
                x.v.Year,
                x.v.ModelConfig,
                x.v.Price,
                x.v.MileageText,
                x.loc != null ? x.loc.City : null,
                x.loc != null ? x.loc.State : null,
                x.loc != null ? x.loc.Latitude : null,
                x.loc != null ? x.loc.Longitude : null,
                x.v.IsDealership,
                x.v.ScrapedAt
            ))
            .ToListAsync(ct);

        return new PagedResponse<VehicleListingDto>(items, page, pageSize, items.Count);
    }

    public async Task<PagedResponse<PartListingDto>> SearchPartsAsync(
        string? make,
        string? model,
        int? yearMin,
        int? yearMax,
        int? priceMin,
        int? priceMax,
        string? state,
        int page,
        int pageSize,
        CancellationToken ct)
    {
        page = Math.Max(1, page);
        pageSize = Math.Clamp(pageSize, 1, 200);

        var q = from p in _db.PartListings.AsNoTracking()
                join mk in _db.Makes.AsNoTracking() on p.MakeId equals mk.MakeId into mkj
                from mk in mkj.DefaultIfEmpty()
                join md in _db.Models.AsNoTracking() on p.ModelId equals md.ModelId into mdj
                from md in mdj.DefaultIfEmpty()
                join loc in _db.Locations.AsNoTracking() on p.LocationId equals loc.LocationId into locj
                from loc in locj.DefaultIfEmpty()
                select new { p, mk, md, loc };

        if (!string.IsNullOrWhiteSpace(make))
            q = q.Where(x => x.mk != null && x.mk.MakeName == make!.Trim().ToLower());

        if (!string.IsNullOrWhiteSpace(model))
            q = q.Where(x => x.md != null && x.md.ModelName == model!.Trim().ToLower());

        if (yearMin.HasValue) q = q.Where(x => x.p.Year != null && x.p.Year >= yearMin.Value);
        if (yearMax.HasValue) q = q.Where(x => x.p.Year != null && x.p.Year <= yearMax.Value);

        if (priceMin.HasValue) q = q.Where(x => x.p.Price != null && x.p.Price >= priceMin.Value);
        if (priceMax.HasValue) q = q.Where(x => x.p.Price != null && x.p.Price <= priceMax.Value);

        if (!string.IsNullOrWhiteSpace(state))
            q = q.Where(x => x.loc != null && x.loc.State == state!.Trim().ToUpperInvariant());

        var items = await q
            .OrderByDescending(x => x.p.ScrapedAt)
            .Skip((page - 1) * pageSize)
            .Take(pageSize)
            .Select(x => new PartListingDto(
                x.p.ListingHash,
                x.p.Url,
                x.mk != null ? x.mk.MakeName : null,
                x.md != null ? x.md.ModelName : null,
                x.p.Year,
                x.p.Title,
                x.p.Description,
                x.p.Price,
                x.loc != null ? x.loc.City : null,
                x.loc != null ? x.loc.State : null,
                x.loc != null ? x.loc.Latitude : null,
                x.loc != null ? x.loc.Longitude : null,
                x.p.IsDealership,
                x.p.ScrapedAt
            ))
            .ToListAsync(ct);

        return new PagedResponse<PartListingDto>(items, page, pageSize, items.Count);
    }
}
