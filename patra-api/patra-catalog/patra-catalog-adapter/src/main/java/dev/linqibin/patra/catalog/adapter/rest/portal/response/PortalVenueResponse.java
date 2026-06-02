package dev.linqibin.patra.catalog.adapter.rest.portal.response;

import java.math.BigDecimal;

/// Portal 期刊卡片响应。
///
/// 字段名与类型直接对齐前端 `Journal`，前端零字段映射。
///
/// @param id 期刊主键（String，避免 JS 超 2^53 精度损失）
/// @param name 期刊全称
/// @param abbr 缩写标题
/// @param impactFactor 最新年影响因子
/// @param quartile WOS 综合分区（Q1-Q4，可空）
/// @param foundedYear 创刊年份（可空）
/// @author linqibin
/// @since 0.1.0
public record PortalVenueResponse(
    String id,
    String name,
    String abbr,
    BigDecimal impactFactor,
    String quartile,
    Integer foundedYear) {}
