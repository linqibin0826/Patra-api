package dev.linqibin.patra.catalog.infra.persistence.converter.mapper;

import static org.assertj.core.api.Assertions.assertThat;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import dev.linqibin.patra.catalog.domain.model.enums.AbstractType;
import dev.linqibin.patra.catalog.domain.model.read.portal.PublicationDetailReadModel.AbstractSectionView;
import dev.linqibin.patra.catalog.domain.model.vo.publication.PublicationAbstract;
import dev.linqibin.patra.catalog.domain.model.vo.publication.PublicationAbstractSection;
import dev.linqibin.patra.catalog.domain.model.vo.publication.PublicationAlternativeAbstract;
import dev.linqibin.patra.catalog.infra.persistence.entity.PublicationAbstractEntity;
import dev.linqibin.patra.catalog.infra.persistence.entity.PublicationAlternativeAbstractEntity;
import dev.linqibin.starter.jpa.json.Jackson3JsonFormatMapper;
import java.util.List;
import org.hibernate.type.descriptor.java.JavaType;
import org.hibernate.type.descriptor.java.spi.JavaTypeBasicAdaptor;
import org.hibernate.type.format.FormatMapper;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/// PublicationJpaMapper 摘要映射单元测试。
///
/// 覆盖摘要段落类型化（`List<PublicationAbstractSection>` 直落 jsonb）后的映射语义：
/// Entity 字段不再承载 JSON 字符串，序列化由 Hibernate 的 JsonFormatMapper 单点完成。
@DisplayName("PublicationJpaMapper 摘要映射单元测试")
class PublicationJpaMapperTest {

  private final PublicationJpaMapper mapper = new PublicationJpaMapperImpl();

  @Nested
  @DisplayName("主摘要映射")
  class AbstractMapping {

    @Test
    @DisplayName("toAbstractEntity 应将段落列表原样落到 Entity（不做 JSON 序列化）")
    void shouldKeepSectionsAsListOnEntity() {
      List<PublicationAbstractSection> sections =
          List.of(
              PublicationAbstractSection.of("BACKGROUND", "背景内容"),
              PublicationAbstractSection.of(null, "无标签段"),
              PublicationAbstractSection.of("BACKGROUND", "重复标签段"));
      PublicationAbstract pubAbstract =
          PublicationAbstract.builder()
              .plainText("背景内容 无标签段 重复标签段")
              .structuredSections(sections)
              .copyright("© 2026 Publisher")
              .abstractType(AbstractType.STRUCTURED)
              .build();

      PublicationAbstractEntity entity = mapper.toAbstractEntity(pubAbstract, 100L);

      assertThat(entity.getStructuredSections()).containsExactlyElementsOf(sections);
      assertThat(entity.getCopyright()).isEqualTo("© 2026 Publisher");
    }

    @Test
    @DisplayName("toAbstractEntity 在段落为空时应落 null（SQL NULL）")
    void shouldWriteNullWhenSectionsEmpty() {
      PublicationAbstract pubAbstract =
          PublicationAbstract.builder()
              .plainText("纯文本摘要")
              .structuredSections(List.of())
              .abstractType(AbstractType.UNSTRUCTURED)
              .build();

      PublicationAbstractEntity entity = mapper.toAbstractEntity(pubAbstract, 100L);

      assertThat(entity.getStructuredSections()).isNull();
    }

    @Test
    @DisplayName("toAbstract 应从 Entity 读回段落列表与版权信息")
    void shouldReadSectionsBackFromEntity() {
      PublicationAbstractEntity entity = new PublicationAbstractEntity();
      entity.setPublicationId(100L);
      entity.setPlainText("背景内容");
      entity.setStructuredSections(List.of(PublicationAbstractSection.of("BACKGROUND", "背景内容")));
      entity.setCopyright("© 2026 Publisher");
      entity.setAbstractType(AbstractType.STRUCTURED.name());

      PublicationAbstract pubAbstract = mapper.toAbstract(entity);

      assertThat(pubAbstract.structuredSections())
          .containsExactly(PublicationAbstractSection.of("BACKGROUND", "背景内容"));
      assertThat(pubAbstract.copyright()).isEqualTo("© 2026 Publisher");
    }

    @Test
    @DisplayName("toAbstract 在 Entity 段落为 null 时应归一化为空列表")
    void shouldNormalizeNullSectionsToEmptyList() {
      PublicationAbstractEntity entity = new PublicationAbstractEntity();
      entity.setPublicationId(100L);
      entity.setPlainText("纯文本摘要");
      entity.setStructuredSections(null);
      entity.setAbstractType(AbstractType.UNSTRUCTURED.name());

      assertThat(mapper.toAbstract(entity).structuredSections()).isEmpty();
    }
  }

  @Nested
  @DisplayName("翻译摘要映射")
  class AlternativeAbstractMapping {

    @Test
    @DisplayName("toAlternativeAbstractEntity 应映射段落列表与版权信息")
    void shouldMapSectionsAndCopyright() {
      List<PublicationAbstractSection> sections =
          List.of(PublicationAbstractSection.of("目的", "探讨疗效"));
      PublicationAlternativeAbstract altAbstract =
          PublicationAlternativeAbstract.builder()
              .languageCode("zh")
              .sourceType("publisher")
              .plainText("探讨疗效")
              .structuredSections(sections)
              .copyright("© 2026 出版商")
              .build();

      PublicationAlternativeAbstractEntity entity =
          mapper.toAlternativeAbstractEntity(altAbstract, 100L);

      assertThat(entity.getStructuredSections()).containsExactlyElementsOf(sections);
      assertThat(entity.getCopyright()).isEqualTo("© 2026 出版商");
    }

    @Test
    @DisplayName("toAlternativeAbstract 在 Entity 段落为 null 时应归一化为空列表")
    void shouldNormalizeNullSectionsToEmptyList() {
      PublicationAlternativeAbstractEntity entity = new PublicationAlternativeAbstractEntity();
      entity.setPublicationId(100L);
      entity.setLanguageCode("zh");
      entity.setSourceType("publisher");
      entity.setStructuredSections(null);

      assertThat(mapper.toAlternativeAbstract(entity).structuredSections()).isEmpty();
    }

    @Test
    @DisplayName("toAlternativeAbstract 应读回段落列表与版权信息")
    void shouldReadSectionsAndCopyrightBack() {
      PublicationAlternativeAbstractEntity entity = new PublicationAlternativeAbstractEntity();
      entity.setPublicationId(100L);
      entity.setLanguageCode("zh");
      entity.setSourceType("publisher");
      entity.setStructuredSections(List.of(PublicationAbstractSection.of("目的", "探讨疗效")));
      entity.setCopyright("© 2026 出版商");

      PublicationAlternativeAbstract altAbstract = mapper.toAlternativeAbstract(entity);

      assertThat(altAbstract.structuredSections())
          .containsExactly(PublicationAbstractSection.of("目的", "探讨疗效"));
      assertThat(altAbstract.copyright()).isEqualTo("© 2026 出版商");
    }

    @Test
    @DisplayName("toAlternativeAbstractEntity 在段落为空时应落 null（SQL NULL）")
    void shouldWriteNullWhenSectionsEmpty() {
      PublicationAlternativeAbstract altAbstract =
          PublicationAlternativeAbstract.builder()
              .languageCode("zh")
              .sourceType("publisher")
              .plainText("纯文本翻译摘要")
              .build();

      PublicationAlternativeAbstractEntity entity =
          mapper.toAlternativeAbstractEntity(altAbstract, 100L);

      assertThat(entity.getStructuredSections()).isNull();
    }
  }

  @Nested
  @DisplayName("jsonb wire format 回归锚")
  class WireFormat {

    /// 生产同款：`JpaAutoConfiguration` 把该实例注册为 Hibernate 的 `JSON_FORMAT_MAPPER`。
    private final FormatMapper formatMapper = new Jackson3JsonFormatMapper();

    /// `toString` 仅用 javaType 判定 String/Object 透传特例，段落列表走正常 Jackson 序列化。
    private final JavaType<List> listJavaType = new JavaTypeBasicAdaptor<>(List.class);

    @SuppressWarnings("unchecked")
    private String serialize(List<PublicationAbstractSection> sections) {
      return formatMapper.toString(sections, listJavaType, null);
    }

    @Test
    @DisplayName("段落序列化后的 key 集合恰为 label/text，不含派生属性")
    void shouldWriteExactlyLabelAndTextKeys() {
      String json =
          serialize(
              List.of(
                  PublicationAbstractSection.of("BACKGROUND", "bg"),
                  PublicationAbstractSection.of(null, "tail")));

      // 钉死 wire format：任何新增的 bean getter（如曾经的 isLabeled() → "labeled"）都会打破此断言，
      // 并进而击穿读端 PublicationDetailReadAdapter 的严格反序列化。
      assertThat(json)
          .isEqualTo(
              "[{\"label\":\"BACKGROUND\",\"text\":\"bg\"},{\"label\":null,\"text\":\"tail\"}]");
    }

    @Test
    @DisplayName("序列化产物应能被读端严格反序列化（未知属性即失败）")
    void shouldBeStrictlyDeserializableByReadSide() throws Exception {
      String json = serialize(List.of(PublicationAbstractSection.of("METHODS", "m")));

      ObjectMapper strictReader =
          new ObjectMapper().configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, true);

      List<AbstractSectionView> views =
          strictReader.readValue(json, new TypeReference<List<AbstractSectionView>>() {});

      assertThat(views).containsExactly(AbstractSectionView.of("METHODS", "m"));
    }
  }
}
