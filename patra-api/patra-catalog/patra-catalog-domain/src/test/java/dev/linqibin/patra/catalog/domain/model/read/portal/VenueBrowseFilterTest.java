package dev.linqibin.patra.catalog.domain.model.read.portal;

import static org.assertj.core.api.Assertions.assertThat;

import java.util.ArrayList;
import java.util.List;
import org.junit.jupiter.api.Test;

class VenueBrowseFilterTest {

  @Test
  void sort_defaults_to_impact_factor_when_null() {
    var filter = VenueBrowseFilter.builder().sort(null).build();
    assertThat(filter.sort()).isEqualTo(VenueBrowseSort.IMPACT_FACTOR);
  }

  @Test
  void subjects_is_empty_list_when_null() {
    var filter = VenueBrowseFilter.builder().subjects(null).build();
    assertThat(filter.subjects()).isNotNull().isEmpty();
  }

  @Test
  void jcr_quartiles_is_empty_list_when_null() {
    var filter = VenueBrowseFilter.builder().jcrQuartiles(null).build();
    assertThat(filter.jcrQuartiles()).isNotNull().isEmpty();
  }

  @Test
  void cas_quartiles_is_empty_list_when_null() {
    var filter = VenueBrowseFilter.builder().casQuartiles(null).build();
    assertThat(filter.casQuartiles()).isNotNull().isEmpty();
  }

  @Test
  void country_codes_is_empty_list_when_null() {
    var filter = VenueBrowseFilter.builder().countryCodes(null).build();
    assertThat(filter.countryCodes()).isNotNull().isEmpty();
  }

  @Test
  void subjects_is_defensively_copied() {
    var source = new ArrayList<>(List.of("Medicine"));
    var filter = VenueBrowseFilter.builder().subjects(source).build();
    source.add("Biology");
    assertThat(filter.subjects()).containsExactly("Medicine");
  }

  @Test
  void jcr_quartiles_is_defensively_copied() {
    var source = new ArrayList<>(List.of("Q1"));
    var filter = VenueBrowseFilter.builder().jcrQuartiles(source).build();
    source.add("Q2");
    assertThat(filter.jcrQuartiles()).containsExactly("Q1");
  }

  @Test
  void cas_quartiles_is_defensively_copied() {
    var source = new ArrayList<>(List.of("Q1"));
    var filter = VenueBrowseFilter.builder().casQuartiles(source).build();
    source.add("Q3");
    assertThat(filter.casQuartiles()).containsExactly("Q1");
  }

  @Test
  void country_codes_is_defensively_copied() {
    var source = new ArrayList<>(List.of("CN"));
    var filter = VenueBrowseFilter.builder().countryCodes(source).build();
    source.add("US");
    assertThat(filter.countryCodes()).containsExactly("CN");
  }
}
