package dev.linqibin.patra.catalog.infra.adapter.read;

import static org.assertj.core.api.Assertions.assertThat;

import dev.linqibin.patra.catalog.domain.model.read.portal.PortalVenueReadModel;
import dev.linqibin.patra.catalog.domain.model.vo.venue.PublicationHistory;
import dev.linqibin.patra.catalog.domain.model.vo.venue.PublicationProfile;
import dev.linqibin.patra.catalog.infra.config.CatalogITPostgreSQLContainerInitializer;
import dev.linqibin.patra.catalog.infra.persistence.entity.JcrRatingEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.VenueEntity;
import dev.linqibin.starter.jpa.autoconfig.JpaAuditingConfig;
import dev.linqibin.starter.jpa.id.SnowflakeIdGenerator;
import java.math.BigDecimal;
import java.util.List;
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
@Import({PortalVenueReadAdapter.class, JpaAuditingConfig.class})
@ActiveProfiles("test")
@DisplayName("PortalVenueReadAdapter 期刊榜查询集成测试")
class PortalVenueReadAdapterIT {

  @Autowired private PortalVenueReadAdapter adapter;
  @Autowired private TestEntityManager em;

  @Test
  @DisplayName("按最新年影响因子降序，组装 name/abbr/quartile/foundedYear")
  void shouldSortByImpactFactorDescAndAssembleFields() {
    Long high = saveJournal("High IF Journal", "High IF J", 1990);
    saveJcr(high, 2024, new BigDecimal("50.0"), "Q1");
    saveJcr(high, 2025, new BigDecimal("65.4"), "Q1"); // 最新年应取这条
    Long low = saveJournal("Low IF Journal", "Low IF J", 2001);
    saveJcr(low, 2025, new BigDecimal("3.2"), "Q3");
    em.flush();
    em.clear();

    List<PortalVenueReadModel> result = adapter.findTopByImpactFactor(6);

    assertThat(result).extracting(PortalVenueReadModel::id).containsExactly(high, low);
    PortalVenueReadModel head = result.get(0);
    assertThat(head.name()).isEqualTo("High IF Journal");
    assertThat(head.abbr()).isEqualTo("High IF J");
    assertThat(head.impactFactor()).isEqualByComparingTo("65.4");
    assertThat(head.quartile()).isEqualTo("Q1");
    assertThat(head.foundedYear()).isEqualTo(1990);
  }

  @Test
  @DisplayName("无 JCR 记录或最新有效年无影响因子的期刊不出现在榜单")
  void shouldExcludeJournalsWithoutImpactFactor() {
    Long withIf = saveJournal("With IF", "With IF", 1980);
    saveJcr(withIf, 2025, new BigDecimal("10.0"), "Q2");
    saveJournal("No JCR at all", "No JCR", 1990); // 无 JCR 记录
    Long nullIf = saveJournal("Null IF", "Null IF", 1995);
    saveJcr(nullIf, 2025, null, "Q4"); // JCR 存在但 impact_factor 为 null
    em.flush();
    em.clear();

    List<PortalVenueReadModel> result = adapter.findTopByImpactFactor(6);

    assertThat(result).extracting(PortalVenueReadModel::id).containsExactly(withIf);
  }

  @Test
  @DisplayName("topN 限制返回数量，且取影响因子最高的 N 条（降序）")
  void shouldRespectTopN() {
    Long[] ids = new Long[5];
    for (int i = 0; i < 5; i++) {
      ids[i] = saveJournal("J" + i, "J" + i, 2000);
      saveJcr(ids[i], 2025, new BigDecimal(10 + i), "Q1"); // IF: J0=10 .. J4=14
    }
    em.flush();
    em.clear();

    List<PortalVenueReadModel> result = adapter.findTopByImpactFactor(3);

    assertThat(result).hasSize(3);
    // J4(14) > J3(13) > J2(12)，应按影响因子降序返回这三条
    assertThat(result).extracting(PortalVenueReadModel::id).containsExactly(ids[4], ids[3], ids[2]);
  }

  @Test
  @DisplayName("非 JOURNAL 类型即使影响因子很高也不出现在榜单")
  void shouldExcludeNonJournalVenues() {
    Long journal = saveJournal("A Journal", "A J", 1990);
    saveJcr(journal, 2025, new BigDecimal("8.0"), "Q2");
    Long repo = saveVenue("A Repository", "REPOSITORY", "A Repo", 1990);
    saveJcr(repo, 2025, new BigDecimal("99.0"), "Q1");
    em.flush();
    em.clear();

    List<PortalVenueReadModel> result = adapter.findTopByImpactFactor(6);

    assertThat(result).extracting(PortalVenueReadModel::id).containsExactly(journal);
  }

  @Test
  @DisplayName("foundedYear 缺失（无 publication_profile）时为 null")
  void shouldReturnNullFoundedYearWhenMissing() {
    Long id = saveVenueWithoutProfile("No Founded", "No F");
    saveJcr(id, 2025, new BigDecimal("5.0"), "Q3");
    em.flush();
    em.clear();

    List<PortalVenueReadModel> result = adapter.findTopByImpactFactor(6);

    assertThat(result.get(0).foundedYear()).isNull();
  }

  private Long saveJournal(String title, String abbr, int foundedYear) {
    return saveVenue(title, "JOURNAL", abbr, foundedYear);
  }

  private Long saveVenue(String title, String venueType, String abbr, int foundedYear) {
    VenueEntity v = new VenueEntity();
    v.setId(SnowflakeIdGenerator.getId());
    v.setVenueType(venueType);
    v.setTitle(title);
    v.setAbbreviatedTitle(abbr);
    v.setProvenanceCode("OPENALEX");
    v.setPublicationProfile(
        PublicationProfile.builder()
            .abbreviatedTitle(abbr)
            .publicationHistory(PublicationHistory.active(foundedYear))
            .build());
    em.persist(v);
    return v.getId();
  }

  private Long saveVenueWithoutProfile(String title, String abbr) {
    VenueEntity v = new VenueEntity();
    v.setId(SnowflakeIdGenerator.getId());
    v.setVenueType("JOURNAL");
    v.setTitle(title);
    v.setAbbreviatedTitle(abbr);
    v.setProvenanceCode("OPENALEX");
    em.persist(v);
    return v.getId();
  }

  private void saveJcr(Long venueId, int year, BigDecimal impactFactor, String quartile) {
    JcrRatingEntity r = new JcrRatingEntity();
    r.setId(SnowflakeIdGenerator.getId());
    r.setVenueId(venueId);
    r.setYear((short) year);
    r.setImpactFactor(impactFactor);
    r.setWosOverallQuartile(quartile);
    em.persist(r);
  }
}
