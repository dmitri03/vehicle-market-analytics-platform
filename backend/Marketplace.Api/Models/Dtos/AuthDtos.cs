namespace Marketplace.Api.Models.Dtos;

public sealed record RegisterRequest(string Email, string Password);

public sealed record LoginRequest(string Email, string Password);

public sealed record AuthResponse(
    string AccessToken,
    int UserId,
    string Email,
    IReadOnlyCollection<string> Roles
);
