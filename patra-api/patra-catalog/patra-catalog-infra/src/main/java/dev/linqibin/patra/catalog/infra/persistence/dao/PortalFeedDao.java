package dev.linqibin.patra.catalog.infra.persistence.dao;

import dev.linqibin.patra.catalog.infra.adapter.read.PortalFeedRow;
import dev.linqibin.patra.catalog.infra.persistence.entity.PublicationEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface PortalFeedDao extends JpaRepository<PublicationEntity, Long> {

  /// 单次查询组装 portal 文献流。
  ///
  /// 作者用 `string_agg(... ORDER BY author_order)` 单元分隔符拼接；
  /// 类型用相关子查询取 `type_order` 最小；排序按 `:sortMode`（RECENT/CITED）。
  /// `Pageable` 仅携带分页，排序内嵌 SQL。
  @Query(
      value =
          """
          SELECT
            p.id AS "id",
            p.title AS "title",
            v.title AS "venueName",
            p.publication_year AS "publicationYear",
            p.citation_count AS "citationCount",
            p.doi AS "doi",
            p.pmid AS "pmid",
            p.provenance_code AS "provenanceCode",
            (SELECT pt.type_value FROM cat_publication_type pt
               WHERE pt.publication_id = p.id
               ORDER BY pt.type_order ASC NULLS LAST, pt.id ASC
               LIMIT 1) AS "studyType",
            (SELECT string_agg(a.display_name, E'\\x1f' ORDER BY pa.author_order)
               FROM cat_publication_author pa
               JOIN cat_author a ON a.id = pa.author_id
               WHERE pa.publication_id = p.id) AS "authorNames",
            p.last_synced_at AS "lastSyncedAt"
          FROM cat_publication p
          LEFT JOIN cat_venue v ON v.id = p.venue_id
          WHERE p.deleted_at IS NULL
          ORDER BY
            CASE WHEN :sortMode = 'CITED' THEN COALESCE(p.citation_count, -1) ELSE NULL END DESC,
            CASE WHEN :sortMode = 'RECENT' THEN p.last_synced_at ELSE NULL END DESC NULLS LAST,
            p.id DESC
          """,
      countQuery =
          """
          SELECT COUNT(*) FROM cat_publication p WHERE p.deleted_at IS NULL
          """,
      nativeQuery = true)
  Page<PortalFeedRow> findFeedPage(@Param("sortMode") String sortMode, Pageable pageable);
}
