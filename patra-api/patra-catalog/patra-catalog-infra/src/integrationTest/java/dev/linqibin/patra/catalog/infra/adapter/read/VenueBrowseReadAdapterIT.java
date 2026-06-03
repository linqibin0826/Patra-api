package dev.linqibin.patra.catalog.infra.adapter.read;

import static org.assertj.core.api.Assertions.assertThat;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseReadModel;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseSort;
import dev.linqibin.patra.catalog.infra.config.CatalogITPostgreSQLContainerInitializer;
import dev.linqibin.patra.catalog.infra.persistence.entity.CasRatingEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.JcrRatingEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.VenueEntity;
import dev.linqibin.starter.jpa.autoconfig.JpaAuditingConfig;
import dev.linqibin.starter.jpa.id.SnowflakeIdGenerator;
import java.math.BigDecimal;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.data.jpa.test.autoconfigure.DataJpaTest;
import org.springframework.boot.jdbc.test.autoconfigure.AutoConfigureTestDatabase;
import org.springframework.boot.jpa.test.autoconfigure.TestEntityManager;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.context.ContextConfiguration;

/// `VenueBrowseReadAdapter` 期刊浏览/检索集成测试。
///
/// @author linqibin
/// @since 0.1.0
@DataJpaTest
@ContextConfiguration(initializers = CatalogITPostgreSQLContainerInitializer.class)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Import({VenueBrowseReadAdapter.class, JpaAuditingConfig.class})
@ActiveProfiles("test")
@DisplayName("VenueBrowseReadAdapter 期刊浏览查询集成测试")
class VenueBrowseReadAdapterIT {

  @Autowired private VenueBrowseReadAdapter adapter;
  @Autowired private TestEntityManager em;

  private static final PagingParams FIRST_PAGE = PagingParams.of(1, 20);

  @Test
  @DisplayName("sort=TITLE 按期刊全称字母升序")
  void shouldSortByTitle() {
    saveJournal("Zoo Journal", "ZJ", null, null, null);
    saveJournal("Alpha Journal", "AJ", null, null, null);
    em.flush();
    em.clear();

    VenueBrowseFilter filter = VenueBrowseFilter.builder().sort(VenueBrowseSort.TITLE).build();
    PageResult<VenueBrowseReadModel> result = adapter.search(filter, FIRST_PAGE);

    assertThat(result.items())
        .extracting(VenueBrowseReadModel::name)
        .containsExactly("Alpha Journal", "Zoo Journal");
  }

  @Test
  @DisplayName("sort=CAS_QUARTILE Q1 在 Q2 之前")
  void shouldSortByCasQuartileAscending() {
    Long q2 = saveJournal("B Journal", "BJ", null, null, null);
    saveCas(q2, 2024, "Q2");
    Long q1 = saveJournal("A Journal", "AJ", null, null, null);
    saveCas(q1, 2024, "Q1");
    em.flush();
    em.clear();

    VenueBrowseFilter filter =
        VenueBrowseFilter.builder().sort(VenueBrowseSort.CAS_QUARTILE).build();
    PageResult<VenueBrowseReadModel> result = adapter.search(filter, FIRST_PAGE);

    assertThat(result.items()).extracting(VenueBrowseReadModel::id).containsExactly(q1, q2);
  }

  @Test
  @DisplayName("subject facet 过滤：只返回匹配 JCR subject 的期刊")
  void shouldFilterBySubject() {
    Long oncology = saveJournal("Oncology Journal", "OJ", null, null, null);
    saveJcr(oncology, 2024, new BigDecimal("10.0"), "Q1", "ONCOLOGY");
    Long cardio = saveJournal("Cardiology Journal", "CJ", null, null, null);
    saveJcr(cardio, 2024, new BigDecimal("8.0"), "Q2", "CARDIOLOGY");
    em.flush();
    em.clear();

    VenueBrowseFilter filter = VenueBrowseFilter.builder().subject("ONCOLOGY").build();
    PageResult<VenueBrowseReadModel> result = adapter.search(filter, FIRST_PAGE);

    assertThat(result.items()).extracting(VenueBrowseReadModel::id).containsExactly(oncology);
  }

  @Test
  @DisplayName("keyword 前缀命中：'Nature' 匹配 'Nature Medicine'，不匹配 'Cell'")
  void shouldFilterByKeywordPrefix() {
    saveJournal("Nature Medicine", "NM", null, null, null);
    saveJournal("Cell", "Cell", null, null, null);
    em.flush();
    em.clear();

    VenueBrowseFilter filter = VenueBrowseFilter.builder().keyword("Nature").build();
    PageResult<VenueBrowseReadModel> result = adapter.search(filter, FIRST_PAGE);

    assertThat(result.items())
        .extracting(VenueBrowseReadModel::name)
        .containsExactly("Nature Medicine");
  }

  @Test
  @DisplayName("分页：total/items/page 字段正确")
  void shouldReturnCorrectPagination() {
    for (int i = 1; i <= 5; i++) {
      saveJournal("Journal " + i, "J" + i, null, null, null);
    }
    em.flush();
    em.clear();

    PagingParams paging = PagingParams.of(2, 2);
    VenueBrowseFilter filter = VenueBrowseFilter.builder().build();
    PageResult<VenueBrowseReadModel> result = adapter.search(filter, paging);

    assertThat(result.total()).isEqualTo(5);
    assertThat(result.items()).hasSize(2);
    assertThat(result.page()).isEqualTo(2);
  }

  // ===== 测试数据构建助手 =====

  private Long saveJournal(
      String title, String abbr, String countryCode, Boolean isOa, Boolean isInDoaj) {
    VenueEntity v = new VenueEntity();
    v.setId(SnowflakeIdGenerator.getId());
    v.setVenueType("JOURNAL");
    v.setTitle(title);
    v.setAbbreviatedTitle(abbr);
    v.setProvenanceCode("OPENALEX");
    if (countryCode != null) {
      v.setCountryCode(countryCode);
    }
    em.persist(v);
    return v.getId();
  }

  private void saveJcr(
      Long venueId, int year, BigDecimal impactFactor, String quartile, String subject) {
    JcrRatingEntity r = new JcrRatingEntity();
    r.setId(SnowflakeIdGenerator.getId());
    r.setVenueId(venueId);
    r.setYear((short) year);
    r.setImpactFactor(impactFactor);
    r.setJifQuartile(quartile);
    r.setSubject(subject);
    em.persist(r);
  }

  private void saveCas(Long venueId, int year, String majorQuartile) {
    CasRatingEntity r = new CasRatingEntity();
    r.setId(SnowflakeIdGenerator.getId());
    r.setVenueId(venueId);
    r.setYear((short) year);
    r.setEdition("2024");
    r.setMajorQuartile(majorQuartile);
    em.persist(r);
  }
}
