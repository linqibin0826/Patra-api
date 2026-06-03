package dev.linqibin.patra.catalog.domain.port.read;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseReadModel;

/// 期刊浏览检索 CQRS 读端口。
///
/// 由 Infra 层 [VenueBrowseReadAdapter] 实现，
/// 支持多维度过滤和多种排序。
///
/// @author linqibin
/// @since 0.1.0
public interface VenueBrowseReadPort {

  /// 分页检索期刊。
  ///
  /// @param filter 过滤 + 排序参数
  /// @param paging 已归一化的分页参数
  /// @return 分页结果
  PageResult<VenueBrowseReadModel> search(VenueBrowseFilter filter, PagingParams paging);
}
