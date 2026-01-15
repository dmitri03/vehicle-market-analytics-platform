namespace Marketplace.Api.Models.Entities;

public sealed class User
{
    public int UserId { get; set; }
    public string Email { get; set; } = "";
    public string PasswordHash { get; set; } = "";
    public bool IsActive { get; set; } = true;
}
