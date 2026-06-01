package dev.linqibin.patra.catalog.adapter.rest.portal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.patra.catalog.adapter.config.CatalogAdapterITWebMvcConfig;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalFeedQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalFeedQuery;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalPaperReadModel;
import java.time.Instant;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.client.RestTestClient;

@WebMvcTest(controllers = PortalPublicationController.class)
@ContextConfiguration(classes = CatalogAdapterITWebMvcConfig.class)
@Import({PortalPublicationController.class, PortalApiConverter.class})
@AutoConfigureRestTestClient
@DisplayName("PortalPublicationController REST 切片测试")
class PortalPublicationControllerIT {

  @Autowired private RestTestClient restClient;

  @MockitoBean private PortalFeedQueryService portalFeedQueryService;

  @Test
  @DisplayName("GET /portal/publications 返回 200 + 对齐前端的分页信封")
  void shouldReturnFeedEnvelope() {
    PortalPaperReadModel model =
        new PortalPaperReadModel(
            100428830191L,
            "Semaglutide 长期心血管转归",
            "N Engl J Med",
            2026,
            List.of("Perkovic V.", "Tuttle K. R."),
            142,
            "10.1056/NEJMoa2603120",
            "39812044",
            "PUBMED",
            "Journal Article",
            Instant.parse("2026-01-01T00:00:00Z"));
    when(portalFeedQueryService.listFeed(any(PortalFeedQuery.class)))
        .thenReturn(PageResult.of(List.of(model), 1, 14, 137));

    restClient
        .get()
        .uri("/portal/publications?tab=recent&page=1&pageSize=14")
        .exchange()
        .expectStatus()
        .isOk()
        .expectHeader()
        .contentType(MediaType.APPLICATION_JSON)
        .expectBody()
        .jsonPath("$.page")
        .isEqualTo(1)
        .jsonPath("$.pageSize")
        .isEqualTo(14)
        .jsonPath("$.total")
        .isEqualTo(137)
        .jsonPath("$.totalPages")
        .isEqualTo(10)
        .jsonPath("$.items[0].id")
        .isEqualTo("100428830191")
        .jsonPath("$.items[0].journal")
        .isEqualTo("N Engl J Med")
        .jsonPath("$.items[0].authors.length()")
        .isEqualTo(2)
        .jsonPath("$.items[0].cites")
        .isEqualTo(142)
        .jsonPath("$.items[0].bookmarks")
        .isEqualTo(0)
        .jsonPath("$.items[0].source")
        .isEqualTo("PubMed")
        .jsonPath("$.items[0].kind")
        .isEqualTo("Journal Article")
        .jsonPath("$.items[0].aiSummary")
        .isEmpty()
        .jsonPath("$.items[0].estimatedReadMin")
        .isEmpty()
        .jsonPath("$.items[0].minutesAgo")
        .isNumber();

    ArgumentCaptor<PortalFeedQuery> captor = ArgumentCaptor.forClass(PortalFeedQuery.class);
    verify(portalFeedQueryService).listFeed(captor.capture());
    assertThat(captor.getValue().tab()).isEqualTo("recent");
    assertThat(captor.getValue().page()).isEqualTo(1);
  }

  @Test
  @DisplayName("非法 tab 在适配器校验层收敛为 422，不触达应用层")
  void shouldRejectInvalidTab() {
    restClient
        .get()
        .uri("/portal/publications?tab=hottest")
        .exchange()
        .expectStatus()
        .isEqualTo(422);

    verifyNoInteractions(portalFeedQueryService);
  }

  @Test
  @DisplayName("pageSize 超过上限 50 在适配器校验层收敛为 422")
  void shouldRejectOversizedPageSize() {
    restClient
        .get()
        .uri("/portal/publications?pageSize=51")
        .exchange()
        .expectStatus()
        .isEqualTo(422);

    verifyNoInteractions(portalFeedQueryService);
  }
}
