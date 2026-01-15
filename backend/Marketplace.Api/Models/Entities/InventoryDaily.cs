namespace Marketplace.Api.Models.Entities;

public sealed class InventoryDaily
{
    public DateTime SnapshotDate { get; set; }
    public int? MakeId { get; set; }
    public int ModelId { get; set; }
    public string? State { get; set; }
    public string ListingType { get; set; } = "vehicle"; // 'vehicle' | 'part'
    public uint ListingCount { get; set; }
}
