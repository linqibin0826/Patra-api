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
            filter.keyword(),
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
