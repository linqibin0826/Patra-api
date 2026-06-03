package dev.linqibin.patra.catalog.domain.model.vo.publication;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.List;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

@DisplayName("EvidenceLevel 证据等级衍生")
class EvidenceLevelTest {

  @Test
  @DisplayName("RCT → 4 档")
  void rct() {
    assertThat(EvidenceLevel.classify(List.of("Randomized Controlled Trial")))
        .isEqualTo(EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL);
  }

  @Test
  @DisplayName("系统综述 / Meta 分析 → 5 档")
  void systematicReview() {
    assertThat(EvidenceLevel.classify(List.of("Meta-Analysis")))
        .isEqualTo(EvidenceLevel.SYSTEMATIC_REVIEW);
    assertThat(EvidenceLevel.classify(List.of("Systematic Review")))
        .isEqualTo(EvidenceLevel.SYSTEMATIC_REVIEW);
  }

  @Test
  @DisplayName("多类型取最强档：Journal Article + Meta-Analysis → 5 档")
  void takesStrongest() {
    assertThat(EvidenceLevel.classify(List.of("Journal Article", "Meta-Analysis")))
        .isEqualTo(EvidenceLevel.SYSTEMATIC_REVIEW);
  }

  @Test
  @DisplayName("病例报告 → 1 档")
  void caseReport() {
    assertThat(EvidenceLevel.classify(List.of("Case Reports")))
        .isEqualTo(EvidenceLevel.CASE_REPORT);
  }

  @Test
  @DisplayName("无法判定（仅 Journal Article / Editorial）→ UNKNOWN")
  void unknown() {
    assertThat(EvidenceLevel.classify(List.of("Journal Article", "Editorial")))
        .isEqualTo(EvidenceLevel.UNKNOWN);
  }

  @Test
  @DisplayName("空 / null → UNKNOWN")
  void emptyOrNull() {
    assertThat(EvidenceLevel.classify(List.of())).isEqualTo(EvidenceLevel.UNKNOWN);
    assertThat(EvidenceLevel.classify(null)).isEqualTo(EvidenceLevel.UNKNOWN);
  }

  @Test
  @DisplayName("大小写 / 空格不敏感")
  void caseInsensitive() {
    assertThat(EvidenceLevel.classify(List.of("  randomized controlled trial ")))
        .isEqualTo(EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL);
  }

  @Test
  @DisplayName("UNKNOWN 之外均视为已衍生（derived 标记）")
  void derivedFlag() {
    assertThat(EvidenceLevel.RANDOMIZED_CONTROLLED_TRIAL.isDerived()).isTrue();
    assertThat(EvidenceLevel.UNKNOWN.isDerived()).isFalse();
  }
}
