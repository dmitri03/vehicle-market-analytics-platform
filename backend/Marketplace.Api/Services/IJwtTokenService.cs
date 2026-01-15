using Marketplace.Api.Models.Entities;

namespace Marketplace.Api.Services;

public interface IJwtTokenService
{
    string CreateAccessToken(User user, IReadOnlyCollection<string> roles);
}
