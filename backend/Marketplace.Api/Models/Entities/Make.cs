namespace Marketplace.Api.Models.Entities;

public sealed class Make
{
    public int MakeId { get; set; }
    public string MakeName { get; set; } = "";
    public string? Country { get; set; }
}
