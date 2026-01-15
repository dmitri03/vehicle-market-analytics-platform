namespace Marketplace.Api.Auth;

public sealed class JwtOptions
{
    public string Issuer { get; set; } = "Marketplace.Api";
    public string Audience { get; set; } = "Marketplace.Client";
    public string SigningKey { get; set; } = "";
    public int AccessTokenMinutes { get; set; } = 120;
}
