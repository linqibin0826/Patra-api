package dev.linqibin.patra.catalog.infra.adapter.read;

import java.time.Instant;

/// [PortalFeedDao] native query 的 Spring Data 接口投影。
///
/// getter 名与 SQL 列别名一一对应（别名在 SQL 中加双引号保持 camelCase）。
///
/// @author linqibin
/// @since 0.1.0
public interface PortalFeedRow {
  Long getId();

  String getTitle();

  String getVenueName();

  Integer getPublicationYear();

  Integer getCitationCount();

  String getDoi();

  String getPmid();

  String getProvenanceCode();

  String getStudyType();

  /// 作者展示名，单元分隔符（U+001F）拼接，按 author_order 升序；无作者时为 null。
  String getAuthorNames();

  Instant getLastSyncedAt();
}
