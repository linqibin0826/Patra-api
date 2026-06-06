package dev.linqibin.patra.catalog.adapter.rest.portal.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import java.util.List;

/// Portal 期刊浏览/检索请求。
///
/// 适配器入口校验：非法参数在此收敛为 4xx。
///
/// Spring MVC 对 `?subject=A,B` 按逗号绑定为 `List<String>`。
///
/// @param q 关键词（标题前缀），可空
/// @param sort 排序码：cas_quartile / title / cited_by（其余值或不传，默认按影响因子降序 impact_factor）
/// @param subject JCR 学科列表，可空；多值以逗号分隔
/// @param jcrQuartile JCR 分区列表，可空；多值以逗号分隔
/// @param casQuartile CAS 大类分区列表，可空；多值以逗号分隔
/// @param casTop 是否 CAS 顶刊，可空
/// @param oa 是否开放获取，可空（替换原 oaType）
/// @param doaj 是否收录于 DOAJ，可空
/// @param country 国家/地区码列表，可空；多值以逗号分隔
/// @param page 页码（1-based），可空，默认 1
/// @param pageSize 每页大小（1..50），可空，默认 12
/// @author linqibin
/// @since 0.1.0
public record PortalVenueListRequest(
    String q,
    String sort,
    List<String> subject,
    List<String> jcrQuartile,
    List<String> casQuartile,
    Boolean casTop,
    Boolean oa,
    Boolean doaj,
    List<String> country,
    @Min(value = 1, message = "page 最小为 1") Integer page,
    @Min(value = 1, message = "pageSize 最小为 1") @Max(value = 50, message = "pageSize 最大为 50")
        Integer pageSize) {

  /// 紧凑构造器：各 List 为 null 时替换为空不可变列表，否则防御性拷贝。
  public PortalVenueListRequest {
    subject = subject != null ? List.copyOf(subject) : List.of();
    jcrQuartile = jcrQuartile != null ? List.copyOf(jcrQuartile) : List.of();
    casQuartile = casQuartile != null ? List.copyOf(casQuartile) : List.of();
    country = country != null ? List.copyOf(country) : List.of();
  }
}
