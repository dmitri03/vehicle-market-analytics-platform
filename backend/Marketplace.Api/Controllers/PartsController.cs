using Marketplace.Api.Models.Dtos;
using Marketplace.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/parts")]
public sealed class PartsController : ControllerBase
{
    private readonly IListingsService _svc;

    public PartsController(IListingsService svc)
    {
        _svc = svc;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<PartListingDto>>> Search(
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
        var res = await _svc.SearchPartsAsync(make, model, yearMin, yearMax, priceMin, priceMax, state, page, pageSize, ct);
        return Ok(res);
    }
}
