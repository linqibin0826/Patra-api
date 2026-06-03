package dev.linqibin.patra.catalog.adapter.rest.portal;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.patra.catalog.adapter.config.CatalogAdapterITWebMvcConfig;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalVenueBrowseQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalVenueDetailQueryService;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseReadModel;
import java.math.BigDecimal;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.resttestclient.autoconfigure.AutoConfigureRestTestClient;
import org.springframework.boot.webmvc.test.autoconfigure.WebMvcTest;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.test.context.ContextConfiguration;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.client.RestTestClient;

@WebMvcTest(controllers = PortalVenueController.class)
@ContextConfiguration(classes = CatalogAdapterITWebMvcConfig.class)
@Import({PortalVenueController.class, PortalApiConverter.class})
@AutoConfigureRestTestClient
@DisplayName("PortalVenueController REST 切片测试")
class PortalVenueControllerIT {

  @Autowired private RestTestClient restClient;

  @MockitoBean private PortalVenueBrowseQueryService portalVenueBrowseQueryService;

  @MockitoBean private PortalVenueDetailQueryService portalVenueDetailQueryService;

  @Test
  @DisplayName("GET /portal/venues 返回 200 + 分页信封 + 期刊卡片")
  void shouldReturnBrowseResult() {
    VenueBrowseReadModel model =
        VenueBrowseReadModel.builder()
            .id(319041872872550658L)
            .name("Annals of oncology")
            .abbr("Ann Oncol")
            .impactFactor(new BigDecimal("65.4"))
            .jcrQuartile("Q1")
            .foundedYear(1990)
            .build();
    when(portalVenueBrowseQueryService.browse(
            any(), any(), any(), any(), any(), any(), any(), any(), any(), any(), any()))
        .thenReturn(PageResult.of(List.of(model), 1, 12, 1));

    restClient
        .get()
        .uri("/portal/venues?sort=title&page=1&pageSize=12")
        .exchange()
        .expectStatus()
        .isOk()
        .expectHeader()
        .contentType(MediaType.APPLICATION_JSON)
        .expectBody()
        .jsonPath("$.items")
        .isArray()
        .jsonPath("$.total")
        .isEqualTo(1)
        .jsonPath("$.page")
        .isEqualTo(1)
        .jsonPath("$.items[0].id")
        .isEqualTo("319041872872550658");
  }

  @Test
  @DisplayName("pageSize 超过上限 50 在适配器校验层收敛为 422，不触达应用层")
  void shouldRejectOversizedPageSize() {
    restClient.get().uri("/portal/venues?pageSize=51").exchange().expectStatus().isEqualTo(422);

    verifyNoInteractions(portalVenueBrowseQueryService);
  }
}
