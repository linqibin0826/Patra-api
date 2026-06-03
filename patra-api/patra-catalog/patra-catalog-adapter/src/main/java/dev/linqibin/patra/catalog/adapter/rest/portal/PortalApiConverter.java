package dev.linqibin.patra.catalog.adapter.rest.portal;

import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalPaperResponse;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalVenueDetailResponse;
import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalVenueResponse;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalPaperReadModel;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalVenueReadModel;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel;
import dev.linqibin.patra.common.enums.ProvenanceCode;
import java.time.Duration;
import java.time.Instant;
import org.springframework.stereotype.Component;

/// Portal 读模型 → 响应 DTO 转换器。
///
/// @author linqibin
/// @since 0.1.0
@Component
public class PortalApiConverter {

  /// 将读模型转为响应 DTO。
  ///
  /// @param model 读模型
  /// @return 响应 DTO
  public PortalPaperResponse toResponse(PortalPaperReadModel model) {
    return new PortalPaperResponse(
        Long.toString(model.id()),
        model.title(),
        model.venueName(),
        model.publicationYear(),
        model.authors(),
        model.citationCount(),
        0, // bookmarks：无用户系统，恒为 0
        model.doi(),
        model.pmid(),
        toSource(model.provenanceCode()),
        // TODO(LLM-summary)：接入 LLM 摘要生成后填充
        null,
        // TODO(read-time)：接入原文采集/字数后估算原文阅读时长
        null,
        model.studyType(),
        toMinutesAgo(model.lastSyncedAt()));
  }

  /// 将期刊读模型转为响应 DTO。
  ///
  /// @param model 期刊读模型
  /// @return 响应 DTO
  public PortalVenueResponse toVenueResponse(PortalVenueReadModel model) {
    return new PortalVenueResponse(
        Long.toString(model.id()),
        model.name(),
        model.abbr(),
        model.impactFactor(),
        model.quartile(),
        model.foundedYear());
  }

  /// 将期刊详情读模型转为响应 DTO。
  ///
  /// @param model 期刊详情读模型
  /// @return 响应 DTO
  public PortalVenueDetailResponse toVenueDetailResponse(VenueDetailReadModel model) {
    return new PortalVenueDetailResponse(
        Long.toString(model.id()),
        model.title(),
        model.abbreviatedTitle(),
        model.venueType(),
        model.issnL(),
        model.countryCode(),
        model.primaryLanguage(),
        model.foundedYear(),
        model.coverObjectKey(),
        null, // homepageUrl：当前无数据源，恒为 null
        model.isOpenAccess(),
        model.impactFactor(),
        model.jcrQuartile(),
        model.jcrSubject(),
        model.casMajorCategory(),
        model.casMajorQuartile(),
        model.casIsTop(),
        model.citeScore(),
        model.hIndex(),
        model.citedByCount(),
        model.worksCount(),
        model.frequency(),
        model.medlineIndexed(),
        model.oaType(),
        model.apcUsd(),
        model.isInDoaj(),
        model.jcrRatings().stream()
            .map(
                v ->
                    new PortalVenueDetailResponse.JcrRating(
                        v.year(),
                        v.impactFactor(),
                        v.quartile(),
                        v.subject(),
                        v.jifRank(),
                        v.jifPercentile()))
            .toList(),
        model.casRatings().stream()
            .map(
                v ->
                    new PortalVenueDetailResponse.CasRating(
                        v.year(),
                        v.edition(),
                        v.majorCategory(),
                        v.majorQuartile(),
                        v.minorSubject(),
                        v.minorQuartile(),
                        v.isTop(),
                        v.isReview()))
            .toList(),
        model.scopusRatings().stream()
            .map(
                v ->
                    new PortalVenueDetailResponse.ScopusRating(
                        v.year(), v.citeScore(), v.sjr(), v.snip(), v.quartile(), v.percentile()))
            .toList(),
        model.yearlyStats().stream()
            .map(
                v ->
                    new PortalVenueDetailResponse.YearlyStat(
                        v.year(), v.worksCount(), v.citedByCount(), v.oaWorksCount()))
            .toList(),
        model.identifiers().stream()
            .map(v -> new PortalVenueDetailResponse.Identifier(v.type(), v.value(), v.primary()))
            .toList());
  }

  private String toSource(String provenanceCode) {
    if (provenanceCode == null) {
      return null;
    }
    try {
      return ProvenanceCode.parse(provenanceCode).getDescription();
    } catch (IllegalArgumentException e) {
      return provenanceCode;
    }
  }

  private Integer toMinutesAgo(Instant lastSyncedAt) {
    if (lastSyncedAt == null) {
      return null;
    }
    // 钳到 0：lastSyncedAt 若晚于当前时间（时钟偏移等），避免负分钟透传到响应
    long minutes = Duration.between(lastSyncedAt, Instant.now()).toMinutes();
    return (int) Math.max(0L, minutes);
  }
}
