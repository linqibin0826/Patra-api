package dev.linqibin.patra.catalog.infra.adapter.read;

import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel.CasRatingView;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel.IdentifierView;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel.JcrRatingView;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel.ScopusRatingView;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel.YearlyStatView;
import dev.linqibin.patra.catalog.domain.port.read.VenueDetailReadPort;
import dev.linqibin.patra.catalog.infra.persistence.dao.VenueDao;
import java.util.List;
import java.util.Optional;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/// 期刊详情 CQRS 读适配器。
///
/// 主行通过 LATERAL JOIN 一次性获取最新年 JCR/CAS/Scopus 快照；
/// 子表数据通过 5 条独立查询填充，无 N+1（每次请求仅查询单条 venue）。
///
/// @author linqibin
/// @since 0.1.0
@Repository
@RequiredArgsConstructor
public class VenueDetailReadAdapter implements VenueDetailReadPort {

  private final VenueDao venueDao;

  @Override
  public Optional<VenueDetailReadModel> findById(long venueId) {
    return venueDao
        .findVenueDetailById(venueId)
        .map(
            main ->
                new VenueDetailReadModel(
                    main.getId(),
                    main.getTitle(),
                    main.getAbbreviatedTitle(),
                    main.getVenueType(),
                    main.getIssnL(),
                    main.getCountryCode(),
                    main.getPrimaryLanguage(),
                    main.getFoundedYear(),
                    main.getCoverObjectKey(),
                    main.getIsOpenAccess(),
                    main.getImpactFactor(),
                    main.getJcrQuartile(),
                    main.getJcrSubject(),
                    main.getCasMajorCategory(),
                    main.getCasMajorQuartile(),
                    main.getCasIsTop(),
                    main.getCiteScore(),
                    main.getHIndex(),
                    main.getCitedByCount(),
                    main.getWorksCount(),
                    main.getFrequency(),
                    main.getMedlineIndexed(),
                    main.getOaType(),
                    main.getApcUsd(),
                    main.getIsInDoaj(),
                    mapJcrRatings(venueDao.findJcrRatingsByVenueId(venueId)),
                    mapCasRatings(venueDao.findCasRatingsByVenueId(venueId)),
                    mapScopusRatings(venueDao.findScopusRatingsByVenueId(venueId)),
                    mapYearlyStats(venueDao.findPublicationStatsByVenueId(venueId)),
                    mapIdentifiers(venueDao.findIdentifiersByVenueId(venueId))));
  }

  private List<JcrRatingView> mapJcrRatings(List<JcrRatingRow> rows) {
    return rows.stream()
        .map(
            r ->
                new JcrRatingView(
                    r.getYear(),
                    r.getImpactFactor(),
                    r.getQuartile(),
                    r.getSubject(),
                    r.getJifRank(),
                    r.getJifPercentile()))
        .toList();
  }

  private List<CasRatingView> mapCasRatings(List<CasRatingRow> rows) {
    return rows.stream()
        .map(
            r ->
                new CasRatingView(
                    r.getYear(),
                    r.getEdition(),
                    r.getMajorCategory(),
                    r.getMajorQuartile(),
                    r.getMinorSubject(),
                    r.getMinorQuartile(),
                    r.getIsTop(),
                    r.getIsReview()))
        .toList();
  }

  private List<ScopusRatingView> mapScopusRatings(List<ScopusRatingRow> rows) {
    return rows.stream()
        .map(
            r ->
                new ScopusRatingView(
                    r.getYear(),
                    r.getCiteScore(),
                    r.getSjr(),
                    r.getSnip(),
                    r.getQuartile(),
                    r.getPercentile()))
        .toList();
  }

  private List<YearlyStatView> mapYearlyStats(List<VenueStatRow> rows) {
    return rows.stream()
        .map(
            r ->
                new YearlyStatView(
                    r.getYear(), r.getWorksCount(), r.getCitedByCount(), r.getOaWorksCount()))
        .toList();
  }

  private List<IdentifierView> mapIdentifiers(List<VenueIdentifierRow> rows) {
    return rows.stream()
        .map(
            r -> new IdentifierView(r.getType(), r.getValue(), Boolean.TRUE.equals(r.getPrimary())))
        .toList();
  }
}
