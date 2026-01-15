namespace Marketplace.Api.Models.Entities;

public sealed class Model
{
    public int ModelId { get; set; }
    public int MakeId { get; set; }
    public string ModelName { get; set; } = "";
    public string? ModelAliases { get; set; }
}
