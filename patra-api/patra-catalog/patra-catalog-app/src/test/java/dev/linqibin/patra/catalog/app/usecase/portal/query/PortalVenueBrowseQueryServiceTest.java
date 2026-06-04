package dev.linqibin.patra.catalog.app.usecase.portal.query;

import static org.assertj.core.api.Assertions.assertThat;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.verify;
import static org.mockito.Mockito.when;

import dev.linqibin.commons.query.PageResult;
import dev.linqibin.commons.query.PagingParams;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseFilter;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseReadModel;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueBrowseSort;
import dev.linqibin.patra.catalog.domain.port.read.VenueBrowseReadPort;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.ArgumentCaptor;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

@ExtendWith(MockitoExtension.class)
@DisplayName("PortalVenueBrowseQueryService 单元测试")
class PortalVenueBrowseQueryServiceTest {

  @Mock private VenueBrowseReadPort readPort;
  @InjectMocks private PortalVenueBrowseQueryService service;

  private PageResult<VenueBrowseReadModel> emptyPage(int page, int pageSize) {
    return PageResult.empty(page, pageSize);
  }

  @Test
  @DisplayName("默认 pageSize=12")
  void shouldApplyDefaultPageSize() {
    when(readPort.search(any(), any())).thenReturn(emptyPage(1, 12));

    service.browse(null, null, null, null, null, null, null, null, null, null, null);

    ArgumentCaptor<PagingParams> paging = ArgumentCaptor.forClass(PagingParams.class);
    verify(readPort).search(any(), paging.capture());
    assertThat(paging.getValue().pageSize()).isEqualTo(12);
  }

  @Test
  @DisplayName("pageSize 超过 50 被截断为 50")
  void shouldCapPageSize() {
    when(readPort.search(any(), any())).thenReturn(emptyPage(1, 50));

    service.browse(null, null, null, null, null, null, null, null, null, 1, 999);

    ArgumentCaptor<PagingParams> paging = ArgumentCaptor.forClass(PagingParams.class);
    verify(readPort).search(any(), paging.capture());
    assertThat(paging.getValue().pageSize()).isEqualTo(50);
  }

  @Test
  @DisplayName("keyword 原始值直传 filter（转义由读适配器负责）")
  void shouldPassRawKeywordToFilter() {
    when(readPort.search(any(), any())).thenReturn(emptyPage(1, 12));

    service.browse("100%", null, null, null, null, null, null, null, null, null, null);

    ArgumentCaptor<VenueBrowseFilter> filter = ArgumentCaptor.forClass(VenueBrowseFilter.class);
    verify(readPort).search(filter.capture(), any());
    assertThat(filter.getValue().keyword()).isEqualTo("100%");
  }

  @Test
  @DisplayName("sort 字符串 cas_quartile 解析为 CAS_QUARTILE")
  void shouldParseSortCode() {
    when(readPort.search(any(), any())).thenReturn(emptyPage(1, 12));

    service.browse(null, "cas_quartile", null, null, null, null, null, null, null, null, null);

    ArgumentCaptor<VenueBrowseFilter> filter = ArgumentCaptor.forClass(VenueBrowseFilter.class);
    verify(readPort).search(filter.capture(), any());
    assertThat(filter.getValue().sort()).isEqualTo(VenueBrowseSort.CAS_QUARTILE);
  }

  @Test
  @DisplayName("空白 subject 转为 null 传入 filter")
  void shouldConvertBlankSubjectToNull() {
    when(readPort.search(any(), any())).thenReturn(emptyPage(1, 12));

    service.browse(null, null, "  ", null, null, null, null, null, null, null, null);

    ArgumentCaptor<VenueBrowseFilter> filter = ArgumentCaptor.forClass(VenueBrowseFilter.class);
    verify(readPort).search(filter.capture(), any());
    assertThat(filter.getValue().subject()).isNull();
  }
}
