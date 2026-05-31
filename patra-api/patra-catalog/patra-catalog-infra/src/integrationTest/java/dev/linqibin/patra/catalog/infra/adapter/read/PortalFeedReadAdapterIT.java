package dev.linqibin.patra.catalog.infra.adapter.read;

import static org.assertj.core.api.Assertions.assertThat;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedTab;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalPaperReadModel;
import dev.linqibin.patra.catalog.infra.config.CatalogITPostgreSQLContainerInitializer;
import dev.linqibin.patra.catalog.infra.persistence.entity.AuthorEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.PublicationAuthorEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.PublicationEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.PublicationTypeEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.VenueEntity;
import dev.linqibin.starter.jpa.autoconfig.JpaAuditingConfig;
import dev.linqibin.starter.jpa.id.SnowflakeIdGenerator;
import java.time.Instant;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

@DataJpaTest
@ContextConfiguration(initializers = CatalogITPostgreSQLContainerInitializer.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({PortalFeedReadAdapter.class, JpaAuditingConfig.class})
@ActiveProfiles("test")
@DisplayName("PortalFeedReadAdapter 文献流查询集成测试")
class PortalFeedReadAdapterIT {

  @Autowired private PortalFeedReadAdapter adapter;
  @Autowired private TestEntityManager em;

  @Test
  @DisplayName("RECENT tab 按 last_synced_at 降序，组装 venue/authors/studyType")
  void shouldAssembleAndSortByRecent() {
    Long venueId = saveVenue("N Engl J Med");
    Long older =
        savePublication("Older paper", venueId, 100, Instant.parse("2026-01-01T00:00:00Z"));
    Long newer = savePublication("Newer paper", venueId, 5, Instant.parse("2026-05-01T00:00:00Z"));
    saveAuthors(newer, "Perkovic V.", "Tuttle K. R.");
    savePublicationType(newer, "Journal Article", 1);
    savePublicationType(newer, "Review", 2);
    em.flush();
    em.clear();

    PageResult<PortalPaperReadModel> page =
        adapter.findFeedPage(PagingParams.of(1, 14), PortalFeedFilter.of(PortalFeedTab.RECENT));

    assertThat(page.total()).isEqualTo(2);
    assertThat(page.items()).extracting(PortalPaperReadModel::id).containsExactly(newer, older);
    PortalPaperReadModel head = page.items().get(0);
    assertThat(head.title()).isEqualTo("Newer paper");
    assertThat(head.venueName()).isEqualTo("N Engl J Med");
    assertThat(head.authors()).containsExactly("Perkovic V.", "Tuttle K. R.");
    assertThat(head.studyType()).isEqualTo("Journal Article");
    assertThat(head.citationCount()).isEqualTo(5);
  }

  @Test
  @DisplayName("CITED tab 按 citation_count 降序")
  void shouldSortByCited() {
    Long venueId = saveVenue("Cell");
    Long low = savePublication("Low cited", venueId, 10, Instant.parse("2026-05-01T00:00:00Z"));
    Long high = savePublication("High cited", venueId, 999, Instant.parse("2026-01-01T00:00:00Z"));
    em.flush();
    em.clear();

    PageResult<PortalPaperReadModel> page =
        adapter.findFeedPage(PagingParams.of(1, 14), PortalFeedFilter.of(PortalFeedTab.CITED));

    assertThat(page.items()).extracting(PortalPaperReadModel::id).containsExactly(high, low);
  }

  @Test
  @DisplayName("无作者/无类型/无 venue 时降级为 空列表/null")
  void shouldDegradeGracefully() {
    Long pubId = savePublication("Lonely paper", null, 0, Instant.parse("2026-03-01T00:00:00Z"));
    em.flush();
    em.clear();

    PageResult<PortalPaperReadModel> page =
        adapter.findFeedPage(PagingParams.of(1, 14), PortalFeedFilter.of(PortalFeedTab.RECENT));

    PortalPaperReadModel only = page.items().get(0);
    assertThat(only.authors()).isEmpty();
    assertThat(only.studyType()).isNull();
    assertThat(only.venueName()).isNull();
  }

  private Long saveVenue(String title) {
    VenueEntity v = new VenueEntity();
    v.setId(SnowflakeIdGenerator.getId());
    v.setVenueType("JOURNAL");
    v.setTitle(title);
    v.setProvenanceCode("OPENALEX");
    v.setCountryCode("US");
    em.persist(v);
    return v.getId();
  }

  private Long savePublication(String title, Long venueId, int cites, Instant syncedAt) {
    PublicationEntity p =
        PublicationEntity.builder()
            .id(SnowflakeIdGenerator.getId())
            .provenanceCode("PUBMED")
            .title(title)
            .publicationYear(2026)
            .venueId(venueId)
            .venueInstanceId(venueId != null ? venueId : SnowflakeIdGenerator.getId())
            .isOa(false)
            .authorsComplete(true)
            .citationCount(cites)
            .lastSyncedAt(syncedAt)
            .build();
    em.persist(p);
    return p.getId();
  }

  /// 按传入顺序的倒序插入，验证 SQL 的 ORDER BY author_order 真正生效。
  private void saveAuthors(Long publicationId, String... displayNames) {
    for (int i = displayNames.length - 1; i >= 0; i--) {
      AuthorEntity a =
          AuthorEntity.builder()
              .id(SnowflakeIdGenerator.getId())
              .normalizedKey("k" + SnowflakeIdGenerator.getId())
              .displayName(displayNames[i])
              .status("ACTIVE")
              .provenanceCode("PUBMED")
              .build();
      em.persist(a);
      PublicationAuthorEntity link =
          PublicationAuthorEntity.builder()
              .id(SnowflakeIdGenerator.getId())
              .publicationId(publicationId)
              .authorId(a.getId())
              .authorOrder(i + 1)
              .build();
      em.persist(link);
    }
  }

  @Test
  @DisplayName("软删除的 author 不出现在作者列表")
  void shouldExcludeSoftDeletedAuthor() {
    Long venueId = saveVenue("Nature");
    Long pubId =
        savePublication(
            "Paper with deleted author", venueId, 10, Instant.parse("2026-04-01T00:00:00Z"));
    saveAuthorWithDeletedFlag(pubId, "Alive A.", 1, false);
    saveAuthorWithDeletedFlag(pubId, "Deleted D.", 2, true);
    em.flush();
    em.clear();

    PageResult<PortalPaperReadModel> page =
        adapter.findFeedPage(PagingParams.of(1, 14), PortalFeedFilter.of(PortalFeedTab.RECENT));

    assertThat(page.items().get(0).authors()).containsExactly("Alive A.");
  }

  private void savePublicationType(Long publicationId, String typeValue, int order) {
    PublicationTypeEntity t =
        PublicationTypeEntity.builder()
            .id(SnowflakeIdGenerator.getId())
            .publicationId(publicationId)
            .typeValue(typeValue)
            .typeOrder(order)
            .build();
    em.persist(t);
  }

  /// 保存作者并可选地将其软删除。
  ///
  /// 由于 Hibernate `@SoftDelete` 会拦截所有 JPA 删除操作并自动过滤查询，
  /// 无法通过 `em.remove()` 或字段 setter 直接写入 `deleted_at`。
  /// 此处使用 native query 绕过 Hibernate 拦截，直接更新 `deleted_at` 列。
  ///
  /// @param publicationId 关联的文献 ID
  /// @param displayName 作者展示名
  /// @param order 作者顺序
  /// @param deleted 是否软删除
  private void saveAuthorWithDeletedFlag(
      Long publicationId, String displayName, int order, boolean deleted) {
    AuthorEntity a =
        AuthorEntity.builder()
            .id(SnowflakeIdGenerator.getId())
            .normalizedKey("k" + SnowflakeIdGenerator.getId())
            .displayName(displayName)
            .status("ACTIVE")
            .provenanceCode("PUBMED")
            .build();
    em.persist(a);
    if (deleted) {
      em.flush();
      em.getEntityManager()
          .createNativeQuery("UPDATE cat_author SET deleted_at = now() WHERE id = :id")
          .setParameter("id", a.getId())
          .executeUpdate();
    }
    PublicationAuthorEntity link =
        PublicationAuthorEntity.builder()
            .id(SnowflakeIdGenerator.getId())
            .publicationId(publicationId)
            .authorId(a.getId())
            .authorOrder(order)
            .build();
    em.persist(link);
  }
}
