package dev.linqibin.patra.catalog.app.usecase.portal.query;

import dev.linqibin.patra.catalog.domain.exception.PublicationNotFoundException;
import dev.linqibin.patra.catalog.domain.model.read.portal.PublicationDetailReadModel;
import dev.linqibin.patra.catalog.domain.port.read.PublicationDetailReadPort;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

/// Portal 文献详情 CQRS 查询服务。
///
/// 委托 [PublicationDetailReadPort] 查询，不存在时抛出 [PublicationNotFoundException]。只读，无 `@Transactional`。
///
/// @author linqibin
/// @since 0.1.0
@Service
@RequiredArgsConstructor
public class PortalPublicationDetailQueryService {

  private final PublicationDetailReadPort readPort;

  /// 按 ID 查询文献详情。
  ///
  /// @param id 文献 ID
  /// @return 文献详情读模型
  /// @throws PublicationNotFoundException 文献不存在时
  public PublicationDetailReadModel getById(long id) {
    return readPort.findById(id).orElseThrow(() -> new PublicationNotFoundException(id));
  }
}
