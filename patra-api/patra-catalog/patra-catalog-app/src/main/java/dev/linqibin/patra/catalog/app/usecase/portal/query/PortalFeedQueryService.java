package dev.linqibin.patra.catalog.app.usecase.portal.query;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalFeedQuery;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedTab;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalPaperReadModel;
import dev.linqibin.patra.catalog.domain.port.read.PortalFeedReadPort;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/// Portal 文献流 CQRS 查询服务。
///
/// 归一化分页与 tab 后委托 [PortalFeedReadPort]。只读，无 `@Transactional`。
///
/// @author linqibin
/// @since 0.1.0
@Service
@RequiredArgsConstructor
public class PortalFeedQueryService {

  /// Portal 文献流默认每页大小（首页一屏视觉密度）。
  private static final int DEFAULT_PAGE_SIZE = 14;

  /// Portal 文献流每页大小上限。
  private static final int MAX_PAGE_SIZE = 50;

  private final PortalFeedReadPort readPort;

  /// 查询 portal 文献流。
  ///
  /// @param query 未归一化的外部查询参数
  /// @return 分页结果
  /// @throws IllegalArgumentException 当 tab 非法时
  public PageResult<PortalPaperReadModel> listFeed(PortalFeedQuery query) {
    Objects.requireNonNull(query, "query must not be null");
    PagingParams paging =
        PagingParams.normalize(query.page(), query.pageSize(), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    PortalFeedFilter filter = PortalFeedFilter.of(PortalFeedTab.fromCode(query.tab()));
    return readPort.findFeedPage(paging, filter);
  }
}
