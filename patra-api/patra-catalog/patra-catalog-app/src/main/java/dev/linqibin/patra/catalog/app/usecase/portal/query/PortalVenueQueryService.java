package dev.linqibin.patra.catalog.app.usecase.portal.query;

import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalVenueQuery;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalVenueReadModel;
import dev.linqibin.patra.catalog.domain.port.read.PortalVenueReadPort;
import java.util.List;
import java.util.Objects;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/// Portal 期刊榜 CQRS 查询服务。
///
/// 归一化 topN 后委托 [PortalVenueReadPort]。只读，无 `@Transactional`。
///
/// @author linqibin
/// @since 0.1.0
@Service
@RequiredArgsConstructor
public class PortalVenueQueryService {

  /// 默认返回数量（首页期刊榜一屏 6 本）。
  private static final int DEFAULT_TOP_N = 6;

  /// 返回数量上限。
  private static final int MAX_TOP_N = 50;

  private final PortalVenueReadPort readPort;

  /// 查询 portal 期刊榜（按影响因子降序）。
  ///
  /// @param query 未归一化的外部查询参数
  /// @return 期刊读模型列表
  public List<PortalVenueReadModel> listTopVenues(PortalVenueQuery query) {
    Objects.requireNonNull(query, "query must not be null");
    return readPort.findTopByImpactFactor(normalizeTopN(query.topN()));
  }

  private int normalizeTopN(Integer topN) {
    if (topN == null || topN < 1) {
      return DEFAULT_TOP_N;
    }
    return Math.min(topN, MAX_TOP_N);
  }
}
