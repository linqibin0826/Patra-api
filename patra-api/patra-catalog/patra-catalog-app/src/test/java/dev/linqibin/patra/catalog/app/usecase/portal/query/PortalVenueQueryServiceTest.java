package dev.linqibin.patra.catalog.app.usecase.portal.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.anyInt;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalVenueQuery;
import dev.linqibin.patra.catalog.domain.port.read.PortalVenueReadPort;
import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PortalVenueQueryService 单元测试")
class PortalVenueQueryServiceTest {

  @Mock private PortalVenueReadPort readPort;
  @InjectMocks private PortalVenueQueryService service;

  @Test
  @DisplayName("topN 缺省时使用默认值 6")
  void shouldApplyDefaultTopN() {
    when(readPort.findTopByImpactFactor(anyInt())).thenReturn(List.of());

    service.listTopVenues(PortalVenueQuery.of(null));

    ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
    verify(readPort).findTopByImpactFactor(captor.capture());
    assertThat(captor.getValue()).isEqualTo(6);
  }

  @Test
  @DisplayName("topN 超过上限 50 被截断为 50")
  void shouldCapTopN() {
    when(readPort.findTopByImpactFactor(anyInt())).thenReturn(List.of());

    service.listTopVenues(PortalVenueQuery.of(999));

    ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
    verify(readPort).findTopByImpactFactor(captor.capture());
    assertThat(captor.getValue()).isEqualTo(50);
  }

  @Test
  @DisplayName("topN 小于 1 时回退到默认值 6")
  void shouldFallbackWhenTopNBelowOne() {
    when(readPort.findTopByImpactFactor(anyInt())).thenReturn(List.of());

    service.listTopVenues(PortalVenueQuery.of(0));

    ArgumentCaptor<Integer> captor = ArgumentCaptor.forClass(Integer.class);
    verify(readPort).findTopByImpactFactor(captor.capture());
    assertThat(captor.getValue()).isEqualTo(6);
  }
}
