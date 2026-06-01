package dev.linqibin.patra.catalog.app.usecase.portal.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.app.usecase.portal.query.dto.PortalFeedQuery;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.PortalFeedTab;
import dev.linqibin.patra.catalog.domain.port.read.PortalFeedReadPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PortalFeedQueryService 单元测试")
class PortalFeedQueryServiceTest {

  @Mock private PortalFeedReadPort readPort;
  @InjectMocks private PortalFeedQueryService service;

  @Test
  @DisplayName("默认 pageSize=14，tab 缺省解析为 RECENT")
  void shouldApplyDefaults() {
    when(readPort.findFeedPage(any(), any())).thenReturn(PageResult.empty(1, 14));

    service.listFeed(PortalFeedQuery.of(null, null, null));

    ArgumentCaptor<PagingParams> paging = ArgumentCaptor.forClass(PagingParams.class);
    ArgumentCaptor<PortalFeedFilter> filter = ArgumentCaptor.forClass(PortalFeedFilter.class);
    verify(readPort).findFeedPage(paging.capture(), filter.capture());
    assertThat(paging.getValue().page()).isEqualTo(1);
    assertThat(paging.getValue().pageSize()).isEqualTo(14);
    assertThat(filter.getValue().tab()).isEqualTo(PortalFeedTab.RECENT);
  }

  @Test
  @DisplayName("pageSize 超过 50 被截断为 50")
  void shouldCapPageSize() {
    when(readPort.findFeedPage(any(), any())).thenReturn(PageResult.empty(1, 50));

    service.listFeed(PortalFeedQuery.of("cited", 1, 999));

    ArgumentCaptor<PagingParams> paging = ArgumentCaptor.forClass(PagingParams.class);
    verify(readPort).findFeedPage(paging.capture(), any());
    assertThat(paging.getValue().pageSize()).isEqualTo(50);
  }

  @Test
  @DisplayName("非法 tab 抛 IllegalArgumentException")
  void shouldRejectInvalidTab() {
    assertThatThrownBy(() -> service.listFeed(PortalFeedQuery.of("hottest", 1, 14)))
        .isInstanceOf(IllegalArgumentException.class);
  }
}
