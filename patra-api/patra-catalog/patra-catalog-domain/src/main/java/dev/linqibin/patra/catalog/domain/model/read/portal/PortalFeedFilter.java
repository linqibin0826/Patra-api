package dev.linqibin.patra.catalog.domain.model.read.portal;

/// Portal 文献流查询过滤条件。
///
/// @param tab 排序维度（已归一化的枚举）
public record PortalFeedFilter(PortalFeedTab tab) {

  /// 创建过滤条件。
  ///
  /// @param tab 排序维度
  /// @return 过滤条件
  public static PortalFeedFilter of(PortalFeedTab tab) {
    return new PortalFeedFilter(tab);
  }
}
