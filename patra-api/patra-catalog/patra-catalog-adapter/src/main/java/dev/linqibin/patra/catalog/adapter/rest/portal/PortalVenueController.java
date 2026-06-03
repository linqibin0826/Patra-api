package dev.linqibin.patra.catalog.adapter.rest.portal;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.patra.catalog.adapter.rest.portal.request.PortalVenueListRequest;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalVenueBrowseResponse;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalVenueDetailResponse;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalVenueBrowseQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalVenueDetailQueryService;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/// Portal C 端门户期刊浏览/检索控制器。
///
/// @author linqibin
/// @since 0.1.0
@Tag(name = "Portal", description = "Portal C 端门户专用接口")
@RestController
@RequestMapping("/portal/venues")
@RequiredArgsConstructor
public class PortalVenueController {

  private final PortalVenueBrowseQueryService portalVenueBrowseQueryService;
  private final PortalVenueDetailQueryService portalVenueDetailQueryService;
  private final PortalApiConverter portalApiConverter;

  /// 浏览/检索期刊（支持多维度过滤和分页）。
  ///
  /// @param req 浏览请求（Spring MVC 自动绑定 query params）
  /// @return 分页期刊卡片列表
  @GetMapping
  public PageResult<PortalVenueBrowseResponse> browse(@Valid PortalVenueListRequest req) {
    return portalVenueBrowseQueryService
        .browse(
            req.q(),
            req.sort(),
            req.subject(),
            req.jcrQuartile(),
            req.casQuartile(),
            req.casTop(),
            req.oaType(),
            req.doaj(),
            req.country(),
            req.page(),
            req.pageSize())
        .map(portalApiConverter::toVenueBrowseResponse);
  }

  /// 查询期刊详情。
  ///
  /// @param id 期刊 ID
  /// @return 期刊详情
  @GetMapping("/{id}")
  public PortalVenueDetailResponse getVenueDetail(@PathVariable long id) {
    return portalApiConverter.toVenueDetailResponse(portalVenueDetailQueryService.getById(id));
  }
}
