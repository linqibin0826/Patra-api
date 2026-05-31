package dev.linqibin.patra.catalog.adapter.rest.portal;

import dev.linqibin.patra.catalog.adapter.rest.portal.response.PortalPaperResponse;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalPaperReadModel;
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
    return (int) Duration.between(lastSyncedAt, Instant.now()).toMinutes();
  }
}
