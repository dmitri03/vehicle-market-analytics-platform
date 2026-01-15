using Marketplace.Api.Models.Dtos;
using Marketplace.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/vehicles")]
public sealed class VehiclesController : ControllerBase
{
    private readonly IListingsService _svc;

    public VehiclesController(IListingsService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<VehicleListingDto>>> Search(
        [FromQuery] string? make,
        [FromQuery] string? model,
        [FromQuery] int? yearMin,
        [FromQuery] int? yearMax,
        [FromQuery] int? priceMin,
        [FromQuery] int? priceMax,
        [FromQuery] string? state,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 50,
        CancellationToken ct = default)
    {
        var res = await _svc.SearchVehiclesAsync(make, model, yearMin, yearMax, priceMin, priceMax, state, page, pageSize, ct);
        return Ok(res);
    }

    [Authorize]
    [HttpGet("me")]
    public ActionResult<object> Me()
    {
        return Ok(new
        {
            user = User.Identity?.Name,
            claims = User.Claims.Select(c => new { c.Type, c.Value }).ToList()
        });
    }
}
