package dev.linqibin.patra.catalog.infra.adapter.read;

import java.math.BigDecimal;

/// `VenueDao#findTopVenuesByImpactFactor` native query 的 Spring Data 接口投影。
///
/// getter 名与 SQL 列别名一一对应（别名在 SQL 中加双引号保持 camelCase）。
///
/// @author linqibin
/// @since 0.1.0
public interface PortalVenueRow {
  Long getId();

  String getName();

  String getAbbr();

  BigDecimal getImpactFactor();

  String getQuartile();

  Integer getFoundedYear();
}
