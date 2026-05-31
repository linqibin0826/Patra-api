package dev.linqibin.patra.catalog.adapter.rest.portal.request;

/// Portal 文献流列表查询请求。
///
/// @param tab 排序维度（recent/cited，可空 → 默认 recent）
/// @param page 页码（可空）
/// @param pageSize 每页大小（可空）
/// @author linqibin
/// @since 0.1.0
public record PortalPublicationListRequest(String tab, Integer page, Integer pageSize) {}
