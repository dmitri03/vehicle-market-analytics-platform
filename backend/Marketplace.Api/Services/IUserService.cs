using Marketplace.Api.Models.Dtos;

namespace Marketplace.Api.Services;

public interface IUserService
{
    Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct);
    Task<AuthResponse?> LoginAsync(LoginRequest req, CancellationToken ct);
}
