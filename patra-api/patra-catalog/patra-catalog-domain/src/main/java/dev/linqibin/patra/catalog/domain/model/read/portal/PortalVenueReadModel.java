package dev.linqibin.patra.catalog.domain.model.read.portal;

import java.math.BigDecimal;

/// Portal 期刊卡片读模型（CQRS 读端）。
///
/// 字段来源 `cat_venue` + 最新年有影响因子的 `cat_venue_jcr_rating`，由 Infra 层单次 LATERAL JOIN 组装。
///
/// @param id 期刊主键
/// @param name 期刊全称
/// @param abbr 缩写标题
/// @param impactFactor 最新年影响因子（非空，仅含有影响因子的期刊）
/// @param quartile WOS 综合分区（Q1-Q4，可空）
/// @param foundedYear 创刊年份（可空）
/// @author linqibin
/// @since 0.1.0
public record PortalVenueReadModel(
    Long id,
    String name,
    String abbr,
    BigDecimal impactFactor,
    String quartile,
    Integer foundedYear) {}
