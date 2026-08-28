package dev.linqibin.patra.catalog.domain.model.vo.publication;

import cn.hutool.core.lang.Assert;
import java.io.Serial;
import java.io.Serializable;

/// 作者-机构快照值对象——文献视角的机构原文，不做标准化。
///
/// 机构原文按文献侧给出的顺序原样保留，不解析、不匹配组织库：
/// 消歧与组织关联属于 `cat_organization` 侧职责，与导入解耦。
///
/// @param order 机构顺序（1 起连续）
/// @param affiliationString 机构原文（非空）
/// @author linqibin
/// @since 0.6.0
public record PublicationAuthorAffiliationSnapshot(int order, String affiliationString)
    implements Serializable {

  @Serial private static final long serialVersionUID = 1L;

  /// 紧凑构造器：校验顺序与机构原文。
  ///
  /// @throws IllegalArgumentException 如果顺序小于 1 或机构原文为空白
  public PublicationAuthorAffiliationSnapshot {
    Assert.isTrue(order >= 1, "机构顺序必须 >= 1");
    Assert.notBlank(affiliationString, "机构原文不能为空");
  }

  /// 创建机构快照。
  ///
  /// @param order 机构顺序（1 起连续）
  /// @param affiliationString 机构原文
  /// @return 机构快照值对象
  public static PublicationAuthorAffiliationSnapshot of(int order, String affiliationString) {
    return new PublicationAuthorAffiliationSnapshot(order, affiliationString);
  }
}
