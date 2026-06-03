package dev.linqibin.patra.catalog.adapter.rest.portal.request;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;

/// Portal 期刊浏览/检索请求。
///
/// 适配器入口校验：非法参数在此收敛为 4xx。
///
/// @param q 关键词（标题前缀），可空
/// @param sort 排序码（impactfactor/cas_quartile/title/cited_by），可空
/// @param subject JCR 学科，可空
/// @param jcrQuartile JCR 分区，可空
/// @param casQuartile CAS 大类分区，可空
/// @param casTop 是否 CAS 顶刊，可空
/// @param oaType OA 类型，可空
/// @param doaj 是否收录于 DOAJ，可空
/// @param country 国家/地区码，可空
/// @param page 页码（1-based），可空，默认 1
/// @param pageSize 每页大小（1..50），可空，默认 12
/// @author linqibin
/// @since 0.1.0
public record PortalVenueListRequest(
    String q,
    String sort,
    String subject,
    String jcrQuartile,
    String casQuartile,
    Boolean casTop,
    String oaType,
    Boolean doaj,
    String country,
    @Min(value = 1, message = "page 最小为 1") Integer page,
    @Min(value = 1, message = "pageSize 最小为 1") @Max(value = 50, message = "pageSize 最大为 50")
        Integer pageSize) {}
