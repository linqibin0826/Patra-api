package dev.linqibin.patra.catalog.infra.adapter.read;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFacets;
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
/// 单次 LATERAL JOIN（venue + 最新年 JCR/CAS），支持多值 OR 过滤和多种排序，无 N+1。
/// `facets()` 采用 drill-down 语义：每个分组维度的计数忽略该维度自身的已选值。
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
            toArray(filter.subjects()),
            toArray(filter.jcrQuartiles()),
            toArray(filter.casQuartiles()),
            filter.casTop(),
            filter.isOpenAccess(),
            filter.doaj(),
            toArray(filter.countryCodes()),
            PageRequest.of(paging.page() - 1, paging.pageSize()));

    List<VenueBrowseReadModel> items = page.getContent().stream().map(this::toReadModel).toList();
    return PageResult.of(items, paging.page(), paging.pageSize(), page.getTotalElements());
  }

  @Override
  public VenueBrowseFacets facets(VenueBrowseFilter filter) {
    String kw = escapeLike(filter.keyword());
    String[] subjects = toArray(filter.subjects());
    String[] jcrQuartiles = toArray(filter.jcrQuartiles());
    String[] casQuartiles = toArray(filter.casQuartiles());
    String[] countryCodes = toArray(filter.countryCodes());
    Boolean casTop = filter.casTop();
    Boolean isOpenAccess = filter.isOpenAccess();
    Boolean doaj = filter.doaj();

    return VenueBrowseFacets.builder()
        .subjects(
            venueDao
                .facetSubjects(
                    kw, jcrQuartiles, casQuartiles, casTop, isOpenAccess, doaj, countryCodes)
                .stream()
                .map(r -> VenueBrowseFacets.FacetCount.of(r.getValue(), r.getCount()))
                .toList())
        .jcrQuartiles(
            venueDao
                .facetJcrQuartiles(
                    kw, subjects, casQuartiles, casTop, isOpenAccess, doaj, countryCodes)
                .stream()
                .map(r -> VenueBrowseFacets.FacetCount.of(r.getValue(), r.getCount()))
                .toList())
        .casQuartiles(
            venueDao
                .facetCasQuartiles(
                    kw, subjects, jcrQuartiles, casTop, isOpenAccess, doaj, countryCodes)
                .stream()
                .map(r -> VenueBrowseFacets.FacetCount.of(r.getValue(), r.getCount()))
                .toList())
        .countries(
            venueDao
                .facetCountries(
                    kw, subjects, jcrQuartiles, casQuartiles, casTop, isOpenAccess, doaj)
                .stream()
                .map(r -> VenueBrowseFacets.FacetCount.of(r.getValue(), r.getCount()))
                .toList())
        .casTop(
            venueDao.countCasTop(
                kw, subjects, jcrQuartiles, casQuartiles, isOpenAccess, doaj, countryCodes))
        .openAccess(
            venueDao.countOpenAccess(
                kw, subjects, jcrQuartiles, casQuartiles, casTop, doaj, countryCodes))
        .doaj(
            venueDao.countDoaj(
                kw, subjects, jcrQuartiles, casQuartiles, casTop, isOpenAccess, countryCodes))
        .build();
  }

  /// List → `String[]` 转换：空列表转 null（表示"不过滤"），非空则转数组。
  ///
  /// @param list 输入列表，null 或空均表示无过滤
  /// @return String 数组，或 null
  private String[] toArray(List<String> list) {
    if (list == null || list.isEmpty()) {
      return null;
    }
    return list.toArray(String[]::new);
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
