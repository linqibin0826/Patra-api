package dev.linqibin.patra.catalog.adapter.rest.portal.response;

import java.util.List;
import lombok.Builder;

/// Portal 期刊 facet 聚合响应 DTO。
///
/// 镜像领域读模型 [dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFacets]，
/// 字段名对齐前端零映射。
///
/// @param subjects JCR 学科 facet 列表
/// @param jcrQuartiles JCR 分区 facet 列表（Q1-Q4）
/// @param casQuartiles CAS 分区 facet 列表（Q1-Q4）
/// @param countries 国家/地区 facet 列表
/// @param casTop 满足当前筛选且 casTop=true 的期刊数
/// @param openAccess 满足当前筛选且 isOpenAccess=true 的期刊数
/// @param doaj 满足当前筛选且 doaj=true 的期刊数
/// @author linqibin
/// @since 0.1.0
@Builder
public record PortalVenueFacetsResponse(
    List<FacetCountResponse> subjects,
    List<FacetCountResponse> jcrQuartiles,
    List<FacetCountResponse> casQuartiles,
    List<FacetCountResponse> countries,
    long casTop,
    long openAccess,
    long doaj) {

  /// 紧凑构造器：各 List 为 null 时替换为空不可变列表。
  public PortalVenueFacetsResponse {
    subjects = subjects != null ? List.copyOf(subjects) : List.of();
    jcrQuartiles = jcrQuartiles != null ? List.copyOf(jcrQuartiles) : List.of();
    casQuartiles = casQuartiles != null ? List.copyOf(casQuartiles) : List.of();
    countries = countries != null ? List.copyOf(countries) : List.of();
  }

  /// 单个 facet 项响应 DTO。
  ///
  /// @param value 维度值（如 "Q1"、"CN"、"Medicine"）
  /// @param count 该维度值下的期刊数量
  public record FacetCountResponse(String value, long count) {

    /// 创建 [FacetCountResponse] 实例。
    ///
    /// @param value 维度值
    /// @param count 期刊数量
    /// @return 新建的 [FacetCountResponse]
    public static FacetCountResponse of(String value, long count) {
      return new FacetCountResponse(value, count);
    }
  }
}
