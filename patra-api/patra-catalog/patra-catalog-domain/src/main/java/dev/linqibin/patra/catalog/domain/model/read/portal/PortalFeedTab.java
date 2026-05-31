package dev.linqibin.patra.catalog.domain.model.read.portal;

import java.util.Locale;

/// Portal 文献流的排序维度。
///
/// - [RECENT]：最近采集（`last_synced_at` 降序）
/// - [CITED]：高被引（`citation_count` 降序）
///
/// @author linqibin
/// @since 0.1.0
public enum PortalFeedTab {
  RECENT,
  CITED;

  /// 将外部传入的 tab 字符串归一化为枚举。
  ///
  /// `null` 回退到 [RECENT]（默认 tab）；非法值抛 [IllegalArgumentException]，
  /// 由 starter-web 的全局异常处理映射为 4xx。
  ///
  /// @param code 外部 tab 字符串（大小写不敏感）
  /// @return 对应枚举
  /// @throws IllegalArgumentException 当 code 非 recent/cited 时
  public static PortalFeedTab fromCode(String code) {
    if (code == null || code.isBlank()) {
      return RECENT;
    }
    return switch (code.toLowerCase(Locale.ROOT)) {
      case "recent" -> RECENT;
      case "cited" -> CITED;
      default -> throw new IllegalArgumentException("不支持的 feed tab：" + code);
    };
  }
}
