package dev.linqibin.patra.catalog.domain.port.read;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalPaperReadModel;

/// Portal 文献流 CQRS 读端口。
///
/// 由 Infra 层 [PortalFeedReadAdapter] 实现，单次查询组装文献流列表项。
///
/// @author linqibin
/// @since 0.1.0
public interface PortalFeedReadPort {

  /// 分页查询 portal 文献流。
  ///
  /// @param paging 已归一化的分页参数
  /// @param filter 过滤条件（含排序维度）
  /// @return 分页结果
  PageResult<PortalPaperReadModel> findFeedPage(PagingParams paging, PortalFeedFilter filter);
}
