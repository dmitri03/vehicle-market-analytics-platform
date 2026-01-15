using Marketplace.Api.Models.Dtos;
using Marketplace.Api.Services;
using Microsoft.AspNetCore.Mvc;

namespace Marketplace.Api.Controllers;

[ApiController]
[Route("api/analytics")]
public sealed class AnalyticsController : ControllerBase
{
    private readonly IAnalyticsService _svc;

    public AnalyticsController(IAnalyticsService svc)
    {
        _svc = svc;
    }

    [HttpGet("inventory-trend")]
    public async Task<ActionResult<TrendResponse>> InventoryTrend(
        [FromQuery] string listingType,
        [FromQuery] string state,
        [FromQuery] string? make,
        [FromQuery] string? model,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var res = await _svc.GetInventoryTrendByStateAsync(listingType, state, make, model, from, to, ct);
        return Ok(res);
    }

    [HttpGet("avg-price-trend")]
    public async Task<ActionResult<TrendResponse>> AvgPriceTrend(
        [FromQuery] string state,
        [FromQuery] string? make,
        [FromQuery] string? model,
        [FromQuery] DateTime? from,
        [FromQuery] DateTime? to,
        CancellationToken ct)
    {
        var res = await _svc.GetAveragePriceTrendAsync(state, make, model, from, to, ct);
        return Ok(res);
    }
}
