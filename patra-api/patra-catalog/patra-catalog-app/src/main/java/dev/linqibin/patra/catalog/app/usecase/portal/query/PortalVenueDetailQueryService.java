package dev.linqibin.patra.catalog.app.usecase.portal.query;

import dev.linqibin.patra.catalog.domain.exception.VenueNotFoundException;
import dev.linqibin.patra.catalog.domain.model.read.portal.VenueDetailReadModel;
import dev.linqibin.patra.catalog.domain.port.read.VenueDetailReadPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/// Portal 期刊详情 CQRS 查询服务。
///
/// 委托 [VenueDetailReadPort] 查询，不存在时抛出 [VenueNotFoundException]。只读，无 `@Transactional`。
///
/// @author linqibin
/// @since 0.1.0
@Service
@RequiredArgsConstructor
public class PortalVenueDetailQueryService {

  private final VenueDetailReadPort readPort;

  /// 按 ID 查询期刊详情。
  ///
  /// @param venueId 期刊 ID
  /// @return 期刊详情读模型
  /// @throws VenueNotFoundException 期刊不存在时
  public VenueDetailReadModel getById(long venueId) {
    return readPort.findById(venueId).orElseThrow(() -> new VenueNotFoundException(venueId));
  }
}
