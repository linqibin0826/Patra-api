package dev.linqibin.patra.catalog.infra.adapter.read;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseReadModel;
import dev.linqibin.patra.catalog.domain.port.read.VenueBrowseReadPort;
import dev.linqibin.patra.catalog.infra.persistence.dao.VenueDao;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Repository;

/// 期刊浏览检索 CQRS 读适配器。
///
/// 单次 LATERAL JOIN（venue + 最新年 JCR/CAS），支持多维度过滤和多种排序，无 N+1。
/// 负责对原始 keyword 执行 LIKE 转义（`!` 为转义符），与 SQL `ESCAPE '!'` 配套。
///
/// @author linqibin
/// @since 0.1.0
@Repository
@RequiredArgsConstructor
public class VenueBrowseReadAdapter implements VenueBrowseReadPort {

  private final VenueDao venueDao;

  @Override
  public PageResult<VenueBrowseReadModel> search(VenueBrowseFilter filter, PagingParams paging) {
    Page<VenueBrowseRow> page =
        venueDao.findPortalVenueBrowsePage(
            escapeLike(filter.keyword()),
            filter.sort().name(),
            filter.subject(),
            filter.jcrQuartile(),
            filter.casQuartile(),
            filter.casTop(),
            filter.oaType(),
            filter.doaj(),
            filter.countryCode(),
            PageRequest.of(paging.page() - 1, paging.pageSize()));

    List<VenueBrowseReadModel> items = page.getContent().stream().map(this::toReadModel).toList();
    return PageResult.of(items, paging.page(), paging.pageSize(), page.getTotalElements());
  }

  /// 对 LIKE 前缀关键词转义特殊字符，转义符为 `!`，与 SQL `ESCAPE '!'` 子句配套。
  ///
  /// @param keyword 原始关键词，null 时直接返回 null
  /// @return 转义后的关键词，或 null
  private String escapeLike(String keyword) {
    if (keyword == null) {
      return null;
    }
    return keyword.replace("!", "!!").replace("%", "!%").replace("_", "!_");
  }

  private VenueBrowseReadModel toReadModel(VenueBrowseRow row) {
    return VenueBrowseReadModel.builder()
        .id(row.getId())
        .name(row.getName())
        .abbr(row.getAbbr())
        .coverObjectKey(row.getCoverObjectKey())
        .impactFactor(row.getImpactFactor())
        .jcrQuartile(row.getJcrQuartile())
        .jcrSubject(row.getJcrSubject())
        .casMajorCategory(row.getCasMajorCategory())
        .casMajorQuartile(row.getCasMajorQuartile())
        .casIsTop(row.getCasIsTop())
        .countryCode(row.getCountryCode())
        .citedByCount(row.getCitedByCount())
        .foundedYear(row.getFoundedYear())
        .isOpenAccess(row.getIsOpenAccess())
        .isInDoaj(row.getIsInDoaj())
        .issnL(row.getIssnL())
        .build();
  }
}
