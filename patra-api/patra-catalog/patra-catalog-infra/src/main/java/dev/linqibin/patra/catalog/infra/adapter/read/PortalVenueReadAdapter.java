package dev.linqibin.patra.catalog.infra.adapter.read;

import dev.linqibin.patra.catalog.domain.model.read.portal.PortalVenueReadModel;
import dev.linqibin.patra.catalog.domain.port.read.PortalVenueReadPort;
import dev.linqibin.patra.catalog.infra.persistence.dao.VenueDao;
import java.util.List;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Repository;

/// Portal 期刊榜 CQRS 读适配器。
///
/// 单次 LATERAL JOIN（venue + 最新年有 IF 的 JCR），按影响因子降序取 Top N，无 N+1。
///
/// @author linqibin
/// @since 0.1.0
@Repository
@RequiredArgsConstructor
public class PortalVenueReadAdapter implements PortalVenueReadPort {

  private final VenueDao venueDao;

  @Override
  public List<PortalVenueReadModel> findTopByImpactFactor(int topN) {
    return venueDao.findTopVenuesByImpactFactor(topN).stream().map(this::toReadModel).toList();
  }

  private PortalVenueReadModel toReadModel(PortalVenueRow row) {
    return new PortalVenueReadModel(
        row.getId(),
        row.getName(),
        row.getAbbr(),
        row.getImpactFactor(),
        row.getQuartile(),
        row.getFoundedYear());
  }
}
