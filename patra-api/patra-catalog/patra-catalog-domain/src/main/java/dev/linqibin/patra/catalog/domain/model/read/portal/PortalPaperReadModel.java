package dev.linqibin.patra.catalog.domain.model.read.portal;

import java.time.Instant;
import java.util.List;

/// Portal 文献流列表项读模型（CQRS 读端）。
///
/// 字段来源于 `cat_publication` 主表 + venue/author/publication_type 关联，
/// 由 Infra 层一次查询组装。`aiSummary`/`estimatedReadMin` 不在读模型中——
/// 后端暂无数据来源，由 Adapter 层 Response 置 null（见 PortalPaperResponse）。
///
/// @param id 文献主键
/// @param title 标题
/// @param venueName 载体名称（可空）
/// @param publicationYear 出版年份（可空）
/// @param authors 全部作者展示名，按 author_order 升序（无作者则空列表）
/// @param citationCount 被引次数（可空）
/// @param doi DOI（可空）
/// @param pmid PubMed ID（可空）
/// @param provenanceCode 数据来源代码
/// @param studyType 文献类型（第一个 publication_type，可空）
/// @param lastSyncedAt 最后采集时间（可空）
/// @author linqibin
/// @since 0.1.0
public record PortalPaperReadModel(
    Long id,
    String title,
    String venueName,
    Integer publicationYear,
    List<String> authors,
    Integer citationCount,
    String doi,
    String pmid,
    String provenanceCode,
    String studyType,
    Instant lastSyncedAt) {

  public PortalPaperReadModel {
    authors = authors != null ? List.copyOf(authors) : List.of();
  }
}
