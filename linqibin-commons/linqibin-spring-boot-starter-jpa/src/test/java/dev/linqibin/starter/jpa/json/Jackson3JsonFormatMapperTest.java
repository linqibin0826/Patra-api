package dev.linqibin.starter.jpa.json;

import static org.assertj.core.api.Assertions.*;

import java.util.Map;
import org.hibernate.type.descriptor.java.StringJavaType;
import org.hibernate.type.descriptor.java.spi.UnknownBasicJavaType;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;

/// {@link Jackson3JsonFormatMapper} 单元测试。
///
/// 测试策略: 纯单元测试，验证与 Hibernate 官方 AbstractJsonFormatMapper 对齐的
/// String/Object 透传特例，以及非 String 类型的 Jackson 序列化/反序列化。
///
/// 测试覆盖:
///
/// - ✅ String 目标类型 - JSON 对象文本原样透传（JSONB → String 属性，如 recordRemarks）
/// - ✅ String 值写出 - 不做二次序列化（不会变成带引号的 JSON 字符串）
/// - ✅ 非 String 类型 - 走 Jackson 正常反序列化/序列化
/// - ✅ null 双向 - 返回 null
///
/// @author linqibin
/// @since 0.1.0
@DisplayName("Jackson3JsonFormatMapper JSON 格式映射器单元测试")
class Jackson3JsonFormatMapperTest {

  private final Jackson3JsonFormatMapper mapper = new Jackson3JsonFormatMapper();

  @Nested
  @DisplayName("String 透传测试")
  class StringPassthroughTests {

    @Test
    @DisplayName("JSON 对象文本读入 String 类型应该原样透传")
    void shouldPassThroughJsonObjectTextToString() {
      String json = "{\"migrated_from\": \"activity-svc\"}";

      String result = mapper.fromString(json, StringJavaType.INSTANCE, null);

      assertThat(result).isEqualTo(json);
    }

    @Test
    @DisplayName("String 值写出应该原样透传而非二次序列化")
    void shouldWriteStringValueAsIs() {
      String json = "{\"k\": 1}";

      String result = mapper.toString(json, StringJavaType.INSTANCE, null);

      assertThat(result).isEqualTo(json);
    }

    @Test
    @DisplayName("null 双向都应该返回 null")
    void shouldReturnNullForNull() {
      assertThat(mapper.fromString(null, StringJavaType.INSTANCE, null)).isNull();
      assertThat(mapper.toString(null, StringJavaType.INSTANCE, null)).isNull();
    }
  }

  @Nested
  @DisplayName("非 String 类型测试")
  class NonStringTests {

    @Test
    @DisplayName("Map 类型应该走 Jackson 反序列化")
    @SuppressWarnings({"unchecked", "rawtypes"})
    void shouldDeserializeMapViaJackson() {
      UnknownBasicJavaType<Map> mapType = new UnknownBasicJavaType<>(Map.class);

      Map result = mapper.fromString("{\"a\": 1}", mapType, null);

      assertThat(result).containsEntry("a", 1);
    }

    @Test
    @DisplayName("Map 值应该走 Jackson 序列化为 JSON 文本")
    @SuppressWarnings({"unchecked", "rawtypes"})
    void shouldSerializeMapViaJackson() {
      UnknownBasicJavaType<Map> mapType = new UnknownBasicJavaType<>(Map.class);

      String result = mapper.toString(Map.of("a", 1), mapType, null);

      assertThat(result).isEqualTo("{\"a\":1}");
    }
  }
}
