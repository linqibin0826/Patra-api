package dev.linqibin.patra.catalog.adapter.rest.portal;

import dev.linqibin.patra.catalog.adapter.rest.portal.request.PortalVenueListRequest;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalVenueResponse;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalVenueQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalVenueQuery;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/// Portal C 端门户期刊榜查询控制器。
///
/// @author linqibin
/// @since 0.1.0
@Tag(name = "Portal", description = "Portal C 端门户专用接口")
@RestController
@RequestMapping("/portal/venues")
@RequiredArgsConstructor
public class PortalVenueController {

  private final PortalVenueQueryService portalVenueQueryService;
  private final PortalApiConverter portalApiConverter;

  /// 查询 portal 期刊榜（按影响因子降序 Top N）。
  ///
  /// @param request 查询请求（Spring MVC 自动绑定 query params）
  /// @return 期刊卡片列表
  @GetMapping
  public List<PortalVenueResponse> listTopVenues(@Valid PortalVenueListRequest request) {
    PortalVenueQuery query = PortalVenueQuery.of(request.topN());
    return portalVenueQueryService.listTopVenues(query).stream()
        .map(portalApiConverter::toVenueResponse)
        .toList();
  }
}
