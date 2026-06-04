package dev.linqibin.patra.catalog.domain.model.read.portal;

import lombok.Builder;

/// 期刊浏览过滤参数（CQRS 读端）。
///
/// @param keyword 刊名前缀原始关键词；null 表示不过滤。LIKE 转义由读适配器（[VenueBrowseReadAdapter]）负责
/// @param sort 排序方式，null 时紧凑构造器自动替换为 [VenueBrowseSort.IMPACT_FACTOR]
/// @param subject JCR 学科，null 表示不过滤
/// @param jcrQuartile JCR 分区（Q1-Q4），null 表示不过滤
/// @param casQuartile CAS 分区（Q1-Q4），null 表示不过滤
/// @param casTop 是否 CAS 顶刊，null 表示不过滤
/// @param oaType OA 类型，null 表示不过滤
/// @param doaj 是否收录于 DOAJ，null 表示不过滤
/// @param countryCode 国家/地区码，null 表示不过滤
/// @author linqibin
/// @since 0.1.0
@Builder
public record VenueBrowseFilter(
    String keyword,
    VenueBrowseSort sort,
    String subject,
    String jcrQuartile,
    String casQuartile,
    Boolean casTop,
    String oaType,
    Boolean doaj,
    String countryCode) {

  /// 紧凑构造器：sort 为 null 时默认 [VenueBrowseSort.IMPACT_FACTOR]。
  public VenueBrowseFilter {
    if (sort == null) {
      sort = VenueBrowseSort.IMPACT_FACTOR;
    }
  }
}
