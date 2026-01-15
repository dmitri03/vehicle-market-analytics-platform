namespace Marketplace.Api.Models.Entities;

public sealed class Location
{
    public int LocationId { get; set; }
    public string? City { get; set; }
    public string? State { get; set; }  // 'WA'
    public decimal? Latitude { get; set; }
    public decimal? Longitude { get; set; }
    public string? FbLocationToken { get; set; }
}
