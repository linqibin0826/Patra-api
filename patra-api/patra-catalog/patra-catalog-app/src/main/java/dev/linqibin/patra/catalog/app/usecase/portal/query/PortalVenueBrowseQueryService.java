package dev.linqibin.patra.catalog.app.usecase.portal.query;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseReadModel;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseSort;
import dev.linqibin.patra.catalog.domain.port.read.VenueBrowseReadPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/// Portal 期刊浏览/检索 CQRS 查询服务。
///
/// 归一化分页参数、转义关键词、解析排序后委托 [VenueBrowseReadPort]。只读，无 `@Transactional`。
///
/// @author linqibin
/// @since 0.1.0
@Service
@RequiredArgsConstructor
public class PortalVenueBrowseQueryService {

  /// 默认每页大小（portal 期刊浏览一屏密度）。
  private static final int DEFAULT_PAGE_SIZE = 12;

  /// 每页大小上限。
  private static final int MAX_PAGE_SIZE = 50;

  private final VenueBrowseReadPort readPort;

  /// 浏览/检索期刊。
  ///
  /// @param q 关键词，null 或空白时不过滤
  /// @param sort 排序码，null 时默认影响因子降序
  /// @param subject JCR 学科，null 或空白时不过滤
  /// @param jcrQuartile JCR 分区，null 或空白时不过滤
  /// @param casQuartile CAS 大类分区，null 或空白时不过滤
  /// @param casTop 是否 CAS 顶刊，null 时不过滤
  /// @param oaType OA 类型，null 或空白时不过滤
  /// @param doaj 是否收录于 DOAJ，null 时不过滤
  /// @param country 国家/地区码，null 或空白时不过滤
  /// @param page 页码（1-based），null 时默认 1
  /// @param pageSize 每页大小，null 时默认 12，超过 50 截断为 50
  /// @return 分页结果
  public PageResult<VenueBrowseReadModel> browse(
      String q,
      String sort,
      String subject,
      String jcrQuartile,
      String casQuartile,
      Boolean casTop,
      String oaType,
      Boolean doaj,
      String country,
      Integer page,
      Integer pageSize) {
    PagingParams paging = PagingParams.normalize(page, pageSize, DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    VenueBrowseFilter filter =
        VenueBrowseFilter.builder()
            .keyword(escapeKeyword(q))
            .sort(VenueBrowseSort.fromCode(sort))
            .subject(blankToNull(subject))
            .jcrQuartile(blankToNull(jcrQuartile))
            .casQuartile(blankToNull(casQuartile))
            .casTop(casTop)
            .oaType(blankToNull(oaType))
            .doaj(doaj)
            .countryCode(blankToNull(country))
            .build();
    return readPort.search(filter, paging);
  }

  private String escapeKeyword(String q) {
    if (q == null || q.isBlank()) {
      return null;
    }
    return q.trim().replace("!", "!!").replace("%", "!%").replace("_", "!_");
  }

  private String blankToNull(String value) {
    if (value == null || value.isBlank()) {
      return null;
    }
    return value.trim();
  }
}
