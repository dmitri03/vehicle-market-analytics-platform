using BCrypt.Net;
using Marketplace.Api.Auth;
using Marketplace.Api.Data;
using Marketplace.Api.Models.Dtos;
using Marketplace.Api.Models.Entities;
using Microsoft.EntityFrameworkCore;

namespace Marketplace.Api.Services;

public sealed class UserService : IUserService
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwt;

    public UserService(AppDbContext db, IJwtTokenService jwt)
    {
        _db = db;
        _jwt = jwt;
    }

    public async Task<AuthResponse> RegisterAsync(RegisterRequest req, CancellationToken ct)
    {
        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        if (string.IsNullOrWhiteSpace(email) || string.IsNullOrWhiteSpace(req.Password))
            throw new ArgumentException("Email and password are required.");

        var exists = await _db.Users.AnyAsync(u => u.Email == email, ct);
        if (exists) throw new InvalidOperationException("User already exists.");

        var pwHash = BCrypt.Net.BCrypt.HashPassword(req.Password);

        var user = new User { Email = email, PasswordHash = pwHash, IsActive = true };
        _db.Users.Add(user);
        await _db.SaveChangesAsync(ct);

        // Public registration assigns the User role; admins are seeded manually.
        var roleName = Roles.User;

        // Ensure roles exist.
        await EnsureRoleExistsAsync(Roles.User, ct);
        await EnsureRoleExistsAsync(Roles.Admin, ct);

        var role = await _db.Roles.FirstAsync(r => r.RoleName == roleName, ct);

        _db.UserRoles.Add(new UserRole { UserId = user.UserId, RoleId = role.RoleId });
        await _db.SaveChangesAsync(ct);

        var roles = new[] { roleName };
        var token = _jwt.CreateAccessToken(user, roles);
        return new AuthResponse(token, user.UserId, user.Email, roles);
    }

    public async Task<AuthResponse?> LoginAsync(LoginRequest req, CancellationToken ct)
    {
        var email = (req.Email ?? "").Trim().ToLowerInvariant();
        var user = await _db.Users.FirstOrDefaultAsync(u => u.Email == email && u.IsActive, ct);
        if (user is null) return null;

        var ok = BCrypt.Net.BCrypt.Verify(req.Password, user.PasswordHash);
        if (!ok) return null;

        var roles = await (from ur in _db.UserRoles
                           join r in _db.Roles on ur.RoleId equals r.RoleId
                           where ur.UserId == user.UserId
                           select r.RoleName).ToListAsync(ct);

        if (roles.Count == 0) roles.Add(Roles.User);

        var token = _jwt.CreateAccessToken(user, roles);
        return new AuthResponse(token, user.UserId, user.Email, roles);
    }

    private async Task EnsureRoleExistsAsync(string roleName, CancellationToken ct)
    {
        roleName = roleName.Trim().ToLowerInvariant();
        var exists = await _db.Roles.AnyAsync(r => r.RoleName == roleName, ct);
        if (exists) return;

        _db.Roles.Add(new Role { RoleName = roleName });
        await _db.SaveChangesAsync(ct);
    }
}
