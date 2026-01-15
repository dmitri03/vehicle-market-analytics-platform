namespace Marketplace.Api.Models.Entities;

public sealed class VehicleListing
{
    public ulong VehicleListingId { get; set; }
    public string ListingHash { get; set; } = "";
    public string Url { get; set; } = "";

    public int? MakeId { get; set; }
    public int? ModelId { get; set; }

    public ushort? Year { get; set; }
    public string? ModelConfig { get; set; }

    public int? Price { get; set; }
    public string? MileageText { get; set; }

    public int? LocationId { get; set; }
    public bool IsDealership { get; set; }

    public DateTime ScrapedAt { get; set; }
    public DateTime SnapshotDate { get; set; }

    public string? RawTitle { get; set; }
}
