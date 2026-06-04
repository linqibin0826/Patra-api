package dev.linqibin.patra.catalog.adapter.rest.portal;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.patra.catalog.adapter.rest.portal.request.PortalPublicationListRequest;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalPaperResponse;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalPublicationDetailResponse;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalFeedQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalPublicationDetailQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalFeedQuery;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import jakarta.validation.constraints.Positive;
import lombok.RequiredArgsConstructor;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/// Portal C 端门户文献流查询控制器。
///
/// @author linqibin
/// @since 0.1.0
@Tag(name = "Portal", description = "Portal C 端门户专用接口")
@Validated
@RestController
@RequestMapping("/portal/publications")
@RequiredArgsConstructor
public class PortalPublicationController {

  private final PortalFeedQueryService portalFeedQueryService;
  private final PortalPublicationDetailQueryService portalPublicationDetailQueryService;
  private final PortalApiConverter portalApiConverter;

  /// 查询 portal 文献流分页列表。
  ///
  /// @param request 查询请求（Spring MVC 自动绑定 query params）
  /// @return 分页响应
  @GetMapping
  public PageResult<PortalPaperResponse> listFeed(@Valid PortalPublicationListRequest request) {
    PortalFeedQuery query = PortalFeedQuery.of(request.tab(), request.page(), request.pageSize());
    return portalFeedQueryService.listFeed(query).map(portalApiConverter::toResponse);
  }

  /// 查询文献详情。
  ///
  /// @param id 文献 ID（必须为正整数）
  /// @return 文献详情
  @GetMapping("/{id}")
  public PortalPublicationDetailResponse getDetail(@PathVariable @Positive long id) {
    return portalApiConverter.toPublicationDetailResponse(
        portalPublicationDetailQueryService.getById(id));
  }
}
