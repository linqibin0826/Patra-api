package dev.linqibin.patra.catalog.domain.port.read;

import dev.linqibin.patra.catalog.domain.model.read.portal.PortalVenueReadModel;
import java.util.List;

/// Portal 期刊榜 CQRS 读端口。
///
/// 由 Infra 层 [PortalVenueReadAdapter] 实现，单次查询组装按影响因子降序的 Top N 期刊。
///
/// @author linqibin
/// @since 0.1.0
public interface PortalVenueReadPort {

  /// 按最新年影响因子降序取 Top N 期刊。
  ///
  /// @param topN 返回数量（已归一化，≥1）
  /// @return 期刊读模型列表，按影响因子降序
  List<PortalVenueReadModel> findTopByImpactFactor(int topN);
}
