package dev.linqibin.patra.catalog.adapter.rest.portal;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.verifyNoInteractions;
import static org.mockito.Mockito.when;

import dev.linqibin.patra.catalog.adapter.config.CatalogAdapterITWebMvcConfig;
import dev.linqibin.patra.catalog.app.usecase.portal.query.PortalVenueQueryService;
import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalVenueQuery;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalVenueReadModel;
import java.math.BigDecimal;
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

@WebMvcTest(controllers = PortalVenueController.class)
@ContextConfiguration(classes = CatalogAdapterITWebMvcConfig.class)
@Import({PortalVenueController.class, PortalApiConverter.class})
@AutoConfigureRestTestClient
@DisplayName("PortalVenueController REST 切片测试")
class PortalVenueControllerIT {

  @Autowired private RestTestClient restClient;

  @MockitoBean private PortalVenueQueryService portalVenueQueryService;

  @Test
  @DisplayName("GET /portal/venues 返回 200 + 对齐前端的期刊卡片数组")
  void shouldReturnVenueList() {
    PortalVenueReadModel model =
        new PortalVenueReadModel(
            319041872872550658L,
            "Annals of oncology",
            "Ann Oncol",
            new BigDecimal("65.4"),
            "Q1",
            1990);
    when(portalVenueQueryService.listTopVenues(any(PortalVenueQuery.class)))
        .thenReturn(List.of(model));

    restClient
        .get()
        .uri("/portal/venues?topN=6")
        .exchange()
        .expectStatus()
        .isOk()
        .expectHeader()
        .contentType(MediaType.APPLICATION_JSON)
        .expectBody()
        .jsonPath("$.length()")
        .isEqualTo(1)
        .jsonPath("$[0].id")
        .isEqualTo("319041872872550658")
        .jsonPath("$[0].name")
        .isEqualTo("Annals of oncology")
        .jsonPath("$[0].abbr")
        .isEqualTo("Ann Oncol")
        .jsonPath("$[0].quartile")
        .isEqualTo("Q1")
        .jsonPath("$[0].foundedYear")
        .isEqualTo(1990);

    ArgumentCaptor<PortalVenueQuery> captor = ArgumentCaptor.forClass(PortalVenueQuery.class);
    verify(portalVenueQueryService).listTopVenues(captor.capture());
    assertThat(captor.getValue().topN()).isEqualTo(6);
  }

  @Test
  @DisplayName("topN 超过上限 50 在适配器校验层收敛为 422，不触达应用层")
  void shouldRejectOversizedTopN() {
    restClient.get().uri("/portal/venues?topN=51").exchange().expectStatus().isEqualTo(422);

    verifyNoInteractions(portalVenueQueryService);
  }
}
