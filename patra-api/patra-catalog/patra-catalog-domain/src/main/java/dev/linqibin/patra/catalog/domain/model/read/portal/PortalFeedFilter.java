package dev.linqibin.patra.catalog.domain.model.read.portal;

import java.util.Objects;

/// Portal 文献流查询过滤条件。
///
/// @param tab 排序维度（已归一化的枚举）
/// @author linqibin
/// @since 0.1.0
public record PortalFeedFilter(PortalFeedTab tab) {

  /// 创建过滤条件。
  ///
  /// @param tab 排序维度（非空）
  /// @return 过滤条件
  public static PortalFeedFilter of(PortalFeedTab tab) {
    return new PortalFeedFilter(Objects.requireNonNull(tab, "tab must not be null"));
  }
}
