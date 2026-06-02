package dev.linqibin.patra.catalog.adapter.rest.portal.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/// Portal 期刊榜查询请求。
///
/// 适配器入口校验：非法参数在此收敛为 4xx。topN 可空（走服务端默认 6）。
///
/// @param topN 返回数量（1..50，可空 → 默认 6）
/// @author linqibin
/// @since 0.1.0
public record PortalVenueListRequest(
    @Min(value = 1, message = "topN 最小为 1") @Max(value = 50, message = "topN 最大为 50")
        Integer topN) {}
