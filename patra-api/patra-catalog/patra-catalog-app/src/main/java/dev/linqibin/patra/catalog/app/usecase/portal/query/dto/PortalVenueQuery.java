package dev.linqibin.patra.catalog.app.usecase.portal.query.dto;

/// Portal 期刊榜查询参数（未归一化的外部输入）。
///
/// @param topN 返回数量（可空，由服务归一化）
/// @author linqibin
/// @since 0.1.0
public record PortalVenueQuery(Integer topN) {

  /// 创建查询参数。
  ///
  /// @param topN 返回数量
  /// @return 查询参数
  public static PortalVenueQuery of(Integer topN) {
    return new PortalVenueQuery(topN);
  }
}
