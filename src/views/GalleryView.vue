<template>
  <v-container @keydown="closeImageModal()">
    <v-row class="filters-top">
      <v-col :cols="this.display.width.value <= 600 ? 4 : 3">
        <v-autocomplete
          v-model="selectedCountries"
          label="Country"
          :items="countries"
          item-title="name"
          item-value="code"
          multiple
          variant="solo-filled"
          density="compact"
          clearable
          autocomplete="null"
        >
          <template v-slot:selection="data">
            <v-chip
              v-if="data.index === 0"
              :key="data.item"
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              class="selected-filter-chip"
              :style="
                selectedCountries.length >= 10 && display.width.value <= 400
                  ? { padding: '0', 'font-size': '8px' }
                  : display.width.value <= 450
                  ? { padding: '0' }
                  : {}
              "
            >
              {{ selectedCountries.length }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col :cols="this.display.width.value <= 600 ? 4 : 4">
        <v-autocomplete
          label="State"
          :items="computedStates"
          v-model="selectedStates"
          item-title="name"
          item-value="code"
          multiple
          variant="solo-filled"
          density="compact"
          clearable
          autocomplete="null"
        >
          <template v-slot:selection="data">
            <v-chip
              v-if="data.index === 0"
              :key="data.item"
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              class="selected-filter-chip"
              :style="
                selectedStates.length >= 10 && display.width.value <= 400
                  ? { padding: '0', 'font-size': '8px' }
                  : display.width.value <= 450
                  ? { padding: '0' }
                  : {}
              "
            >
              {{ selectedStates.length }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col :cols="this.display.width.value <= 600 ? 4 : 3">
        <v-autocomplete
          label="City"
          :items="computedCities"
          v-model="selectedCities"
          item-title="name"
          item-value="code"
          multiple
          variant="solo-filled"
          density="compact"
          clearable
          autocomplete="null"
        >
          <template v-slot:selection="data">
            <v-chip
              v-if="data.index === 0"
              :key="data.item"
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              class="selected-filter-chip"
              :style="
                selectedCities.length >= 10 && display.width.value <= 400
                  ? { padding: '0', 'font-size': '8px' }
                  : display.width.value <= 450
                  ? { padding: '0' }
                  : {}
              "
            >
              {{ selectedCities.length }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col
        v-if="this.display.width.value > 600"
        cols="3"
        class="theme-switch-wrapper-top d-flex align-center justify-space-between"
        :style="{
          maxWidth: 100 + 'px',
          position: 'absolute',
          right: this.display.width.value >= 960 ? 0 : '10px',
          backgroundColor: theme.current.value.colors.background,
        }"
      >
        <v-icon size="15" class="switch-icons-style"
          >mdi-white-balance-sunny</v-icon
        >
        <v-switch
          :model-value="isDarkTheme"
          @update:model-value="toggleTheme"
          density="compact"
          class="switch-margin"
        ></v-switch>
        <v-icon size="15" class="switch-icons-style">mdi-weather-night</v-icon>
      </v-col>
    </v-row>
    <v-infinite-scroll
      v-if="loadedFilters"
      :items="items"
      :onLoad="loadImages"
      empty-text=""
    >
      <v-container>
        <v-row>
          <template v-for="(item, index) in items" :key="index">
            <v-col cols="4" xs="6" sm="4" md="3" lg="2" xl="1" class="img-cols">
              <v-img
                :lazy-src="
                  item.images[0]?.lazyThumbnailBase64 ||
                  item.original?.lazyThumbnailBase64
                "
                :src="
                  item.images[0]?.thumbnailUrl || item.original?.thumbnailUrl
                "
                cover
                aspect-ratio="1"
                class="mx-auto"
                rounded
                @click="openImageModal(item, index)"
              >
                <template v-slot:placeholder
                  ><v-progress-circular
                    class="load-inside-img"
                    indeterminate
                    color="primary"
                  ></v-progress-circular
                ></template>
              </v-img>
            </v-col>
          </template>
        </v-row>
      </v-container>
      <template #loading>
  <div class="bottom-space">
    <v-progress-circular
      indeterminate
      color="green"
      size="50"
    ></v-progress-circular>
  </div>
</template>
    </v-infinite-scroll>
    <v-row justify="center" class="nav-buttons" v-if="viewerModal">
      <v-btn
        @click="changeImage(-1)"
        class="nav-button prev"
        icon
        :loading="loadingModalImage"
      >
        <v-icon size="20">mdi-chevron-left</v-icon>
      </v-btn>
      <v-btn
        @click="toggleRotation"
        class="nav-button rotate"
        icon
        :loading="loadingModalImage"
      >
        <v-icon v-if="isRotated" size="20">mdi-rotate-right</v-icon>
        <v-icon v-else size="20">mdi-rotate-left</v-icon>
      </v-btn>
      <v-btn
        @click="changeImage(1)"
        class="nav-button next"
        icon
        :loading="loadingModalImage"
      >
        <v-icon size="20">mdi-chevron-right</v-icon>
      </v-btn>
    </v-row>
    <div v-if="!hasMore" class="bottom-space"></div>
    <v-row
      class="filters-bottom"
      :style="{
        left: this.display.width.value <= 500 ? '15%' : '13.5%',
        transform: 'translateX(-9%)',
      }"
    >
      <v-col :cols="this.display.width.value <= 600 ? 4 : 6">
        <v-menu
          :close-on-content-click="false"
          transition="slide-y-transition"
          class="date-picker-menu"
          location="left"
          max-width="100"
        >
          <template #activator="{ props }">
            <v-autocomplete
              v-model="dateRange"
              label="Date"
              readonly
              v-bind="props"
              @click:clear="selectedDate = []"
              variant="solo-filled"
              density="compact"
              clearable
              autocomplete="null"
            />
          </template>
          <v-date-picker
            v-model="selectedDate"
            range
            :first-day-of-week="1"
            multiple="2"
            class="custom-data-picker"
          >
            <template #header>
              <v-toolbar class="date-custom-header">
                <v-toolbar-title> {{ dateHeaderText }} </v-toolbar-title>
              </v-toolbar>
            </template>
          </v-date-picker>
        </v-menu>
      </v-col>
      <v-col :cols="this.display.width.value <= 600 ? 4 : 6">
        <v-autocomplete
          label="Tags"
          :items="tags"
          v-model="selectedTags"
          item-title="name"
          item-value="code"
          multiple
          variant="solo-filled"
          density="compact"
          clearable
          autocomplete="null"
        >
          <template v-slot:selection="data">
            <v-chip
              v-if="data.index === 0"
              :key="data.item"
              v-bind="data.attrs"
              :input-value="data.selected"
              close
              class="selected-filter-chip"
              :style="
                selectedTags.length >= 10 && display.width.value <= 400
                  ? { padding: '0', 'font-size': '8px' }
                  : display.width.value <= 450
                  ? { padding: '0' }
                  : {}
              "
            >
              {{ selectedTags.length }}
            </v-chip>
          </template>
        </v-autocomplete>
      </v-col>
      <v-col
        v-if="this.display.width.value <= 600"
        cols="4"
        class="theme-switch-wrapper d-flex align-center justify-space-between"
        :style="{
          maxWidth: maxWidthSwitch + 'px',
          backgroundColor: theme.current.value.colors.background,
        }"
      >
        <v-icon size="15" class="switch-icons-style"
          >mdi-white-balance-sunny</v-icon
        >
        <v-switch
          :model-value="isDarkTheme"
          @update:model-value="toggleTheme"
          density="compact"
          class="switch-margin"
        ></v-switch>
        <v-icon size="15" class="switch-icons-style">mdi-weather-night</v-icon>
      </v-col>
    </v-row>
  </v-container>
  <modal-viewer-image
    v-model="viewerModal"
    :display="display"
    :width="selectedImage?.metadata?.optimizedWidth"
    :height="selectedImage?.metadata?.optimizedHeight"
    :image="selectedImage"
    :cache="cache"
    :version="versionOpen"
    :is-rotated="isRotated"
    @version="(version) => (versionOpen = version)"
    @next="changeImage(1)"
    @prev="changeImage(-1)"
    @close="closeImageModal()"
    @finishLoadgImage="loadingModalImage = false"
  />
  <v-snackbar v-model="error" color="error" top>{{ errorMessage }}</v-snackbar>
</template>

<script>
import _ from "lodash";
import { useDate, useDisplay, useTheme } from "vuetify";
import { ref } from "vue";
import ModalViewerImage from "@/components/ModalViewerImage.vue";
import { mapGetters, mapActions } from "vuex";

export default {
  components: {
    ModalViewerImage,
  },
  props: {
    id: {
      type: String,
      required: false,
    },
    version: {
      type: String,
      required: false,
    },
    city: {
      type: Array,
      required: false,
    },
    state: {
      type: Array,
      required: false,
    },
    country: {
      type: Array,
      required: false,
    },
    tag: {
      type: Array,
      required: false,
    },
    startDate: {
      type: String,
      required: false,
    },
    endDate: {
      type: String,
      required: false,
    },
  },
  data() {
    return {
      items: ref([]),
      loading: false,
      loadingModalImage: false,
      hasMore: true,
      totalImages: 0,
      perPage: 30,
      offset: 0,
      imageModal: false,
      selectedImage: {},
      indexToDelete: null,
      showDialog: false,
      isRotated: false,
      deletingImage: false,
      success: false,
      error: false,
      errorMessage: "",
      viewerModal: false,
      currentIndex: null,
      cache: {},
      idOpen: this.id,
      versionOpen: this.version,
      cityOpen: this.city,
      stateOpen: this.state,
      countryOpen: this.country,
      tagOpen: this.tag,
      startDateOpen: this.startDate,
      endDateOpen: this.endDate,
      countries: [],
      states: [],
      cities: [],
      tags: [],
      selectedCountries: [],
      selectedStates: [],
      selectedCities: [],
      selectedTags: [],
      loadedFilters: false,
      selectedDate: [],
      dateRange: [],
      dateVue: useDate(),
    };
  },
  setup() {
    const display = useDisplay();
    const theme = useTheme();
    return { display, theme };
  },
  computed: {
    ...mapGetters(["isDarkTheme"]),
    maxWidthSwitch() {
      return this.display.width.value / 6 + this.display.width.value / 10;
    },
    computedCities() {
      return this.cities
        .filter((city) => {
          if (this.selectedStates.length) {
            return this.selectedStates.some(
              (state) => state === city.stateParentCode
            );
          }
          return true;
        })
        .filter((city) => {
          if (this.selectedCountries.length) {
            return this.selectedCountries.some(
              (country) => country === city.countryParentCode
            );
          }
          return true;
        });
    },
    computedStates() {
      return this.states.filter((state) => {
        if (this.selectedCountries.length) {
          return this.selectedCountries.some(
            (country) => country === state.countryParentCode
          );
        }
        return true;
      });
    },
    dateHeaderText() {
      if (this.selectedDate.length === 0) {
        return `Select start date`;
      } else if (this.selectedDate.length === 1) {
        return `Select end date`;
      } else {
        return `Selected date range`;
      }
    },
  },
  async beforeMount() {
    await this.loadCountries();
    await this.loadStates();
    await this.loadCities();
    await this.loadTags();
    if (this.cityOpen?.length) {
      this.selectedCities = this.cities
        .filter((city) => this.cityOpen.includes(city.name))
        .map((city) => city.code);
    }

    if (this.stateOpen?.length) {
      this.selectedStates = this.states
        .filter((state) => this.stateOpen.includes(state.name))
        .map((state) => state.code);
    }

    if (this.countryOpen?.length) {
      this.selectedCountries = this.countries
        .filter((country) => this.countryOpen.includes(country.name))
        .map((country) => country.code);
    }

    if (this.tagOpen?.length) {
      this.selectedTags = this.tags
        .filter((tag) => this.tagOpen.includes(tag.name))
        .map((tag) => tag.code);
    }

    if (this.startDateOpen && !this.endDateOpen) {
      this.selectedDate = [
        this.dateVue.parseISO(this.startDateOpen.split("T")[0]),
      ];
    }

    if (this.startDateOpen && this.endDateOpen) {
      this.selectedDate = [
        this.dateVue.parseISO(this.startDateOpen.split("T")[0]),
        this.dateVue.parseISO(this.endDateOpen.split("T")[0]),
      ];
    }

    if (this.endDateOpen && !this.startDateOpen) {
      this.endDateOpen = null;
      this.updateRoute();
    }

    this.loadedFilters = true;
  },
  methods: {
    ...mapActions(["toggleTheme"]),
    handleKeyDown(event) {
      if (event.key === "Escape") {
        this.closeImage();
      }
    },
    async loadImages({ done }, preloadNextPage) {
      if (this.hasMore) {
        this.loading = true;
        try {
          const response = await this.$api.get("images", {
            params: {
              sort: "metadata.takenAt",
              order: "desc",
              offset: this.offset,
              limit: this.perPage,
              ...(!preloadNextPage && { id: this.idOpen }),
              city: this.cityOpen,
              state: this.stateOpen,
              country: this.countryOpen,
              takenAtFrom: this.startDateOpen,
              takenAtTo: this.endDateOpen,
              tags: this.tagOpen,
            },
          });
          const { images, total } = response.data;
          this.items.push(...images);
          this.totalImages = total;
          this.hasMore = this.items.length < total;
          this.offset = this.items.length;
          if (this.idOpen) {
            this.openImageModal(
              this.items.find((item) => item._id === this.idOpen),
              this.items.findIndex((item) => item._id === this.idOpen),
              this.versionOpen
            );
          }
          if (done) done("ok");
        } catch (error) {
          this.error = true;
          this.errorMessage = "Image not found";
          console.error("Image not found:", error);
          window.location.assign('/gallery');
        } finally {
          this.loading = false;
        }
      } else {
        if (done) done("empty");
      }
    },
    debounceLoadImages: _.debounce(function (params) {
      this.loadImages(params);
    }, 300),
    async loadCountries() {
      try {
        const response = await this.$api.get("countries");
        this.countries = response.data;
      } catch (error) {
        console.error("Erro ao carregar países:", error);
      }
    },
    async loadStates() {
      try {
        const response = await this.$api.get("states");
        this.states = response.data;
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    },
    async loadCities() {
      try {
        const response = await this.$api.get("cities");
        this.cities = response.data;
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      }
    },
    async loadTags() {
      try {
        const response = await this.$api.get("tags");
        this.tags = response.data;
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
      }
    },
    toggleRotation() {
      this.isRotated = !this.isRotated;
    },
    openImageModal(item, index, version) {
      this.loadingModalImage = true;
      this.selectedImage = item;
      this.currentIndex = index;
      this.viewerModal = true;
      this.idOpen = item._id;
      this.versionOpen = item.images?.length
        ? version?.toString() || "1"
        : "original";
    },
    changeImage(direction) {
      if (this.loadingModalImage) return;
      const nextIndex = this.currentIndex + direction;
      if (
        nextIndex >= 0 &&
        nextIndex >= this.items.length - 3 &&
        nextIndex < this.items.length
      ) {
        this.loadingModalImage = true;
        this.loadImages({}, true);
        this.selectedImage = this.items[nextIndex];
        this.currentIndex = nextIndex;
        this.idOpen = this.selectedImage._id;
        this.versionOpen = this.selectedImage.images?.length ? "1" : "original";
      } else if (nextIndex >= 0 && nextIndex < this.items.length) {
        this.loadingModalImage = true;
        this.selectedImage = this.items[nextIndex];
        this.currentIndex = nextIndex;
        this.idOpen = this.selectedImage._id;
        this.versionOpen = this.selectedImage.images?.length ? "1" : "original";
      }
    },
    closeImageModal() {
      this.idOpen = null;
      this.versionOpen = null;
      this.loadingModalImage = false;
    },
    async populateCache({ id, url }) {
      try {
        if (this.cache[id]) return;
        const response = await fetch(url);
        const blob = await response.blob();
        const base64 = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result);
          reader.onerror = reject;
          reader.readAsDataURL(blob);
        });

        this.cache[id] = base64;
      } catch (e) {
        console.error("Erro ao carregar imagem:", e);
        this.error = true;
        this.errorMessage = "Loading error, try again";
        this.viewerModal = false;
        this.selectedImage = {};
      }
    },
    updateRoute() {
      this.$router.push({
        name: "gallery",
        query: {
          ...(this.idOpen && { id: this.idOpen }),
          ...(this.idOpen && this.versionOpen && { version: this.versionOpen }),
          ...(this.selectedCities.length && {
            city: this.selectedCities.map(
              (city) => this.cities.find((c) => c.code === city).name
            ),
          }),
          ...(this.selectedStates.length && {
            state: this.selectedStates.map(
              (state) => this.states.find((s) => s.code === state).name
            ),
          }),
          ...(this.selectedCountries.length && {
            country: this.selectedCountries.map(
              (country) => this.countries.find((c) => c.code === country).name
            ),
          }),
          ...(this.selectedTags.length && {
            tag: this.selectedTags.map(
              (tag) => this.tags.find((t) => t.code === tag).name
            ),
          }),
          ...(this.startDateOpen && { startDate: this.startDateOpen }),
          ...(this.endDateOpen && { endDate: this.endDateOpen }),
        },
      });
    },
    resetImages() {
      this.loading = true;
      this.hasMore = true;
      this.items = [];
      this.offset = 0;
    },
  },
  watch: {
    selectedImage(value) {
      if (value.images || value.original) {
        for (const image of [...value.images, value.original]) {
          if (image) {
            this.populateCache({
              id: image._id,
              url: image.optimizedUrl,
              lazy: image.lazyThumbnailUrl,
            });
          }
        }
      }
    },
    selectedCountries(newValue, oldValue) {
      const dontChangeCountries =
        oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeCountries) return;

      this.selectedStates = this.selectedStates.filter((state) => {
        const completeState = this.states.find((s) => s.code === state);
        return newValue.some(
          (country) => country === completeState.countryParentCode
        );
      });

      if (!this.selectedStates.length) {
        this.selectedCities = this.selectedCities.filter((city) => {
          const completeCity = this.cities.find((c) => c.code === city);
          return newValue.some(
            (country) => country === completeCity.countryParentCode
          );
        });
      }

      const oldCountryOpen = this.countryOpen ? [...this.countryOpen] : [];

      this.countryOpen = this.selectedCountries.map(
        (countryCode) => this.countries.find((c) => c.code === countryCode).name
      );

      const dontChangeCountryOpen =
        oldCountryOpen.slice().sort().join(",") ===
        this.countryOpen.slice().sort().join(",");

      if (dontChangeCountryOpen) return;

      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    selectedStates(newValue, oldValue) {
      const dontChangeStates =
        oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeStates) return;

      this.selectedCities = this.selectedCities.filter((city) => {
        const completeCity = this.cities.find((c) => c.code === city);
        return newValue.some((state) => state === completeCity.stateParentCode);
      });

      const oldStateOpen = this.stateOpen ? [...this.stateOpen] : [];

      this.stateOpen = this.selectedStates.map(
        (stateCode) => this.states.find((s) => s.code === stateCode).name
      );

      const dontChangeStateOpen =
        oldStateOpen.slice().sort().join(",") ===
        this.stateOpen.slice().sort().join(",");

      if (dontChangeStateOpen) return;

      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    selectedCities(newValue, oldValue) {
      const dontChangeSelectedCities =
        oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeSelectedCities) return;

      const oldCityOpen = this.cityOpen ? [...this.cityOpen] : [];

      this.cityOpen = this.selectedCities.map(
        (cityCode) => this.cities.find((c) => c.code === cityCode).name
      );

      const dontChangeCityOpen =
        oldCityOpen.slice().sort().join(",") ===
        this.cityOpen.slice().sort().join(",");

      if (dontChangeCityOpen) return;

      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    selectedDate(newValue, oldValue) {
      const dontChangeSelectedDates =
        oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeSelectedDates) return;

      const [startDate, endDate] = newValue.sort(
        (a, b) => a.getTime() - b.getTime()
      );

      const oldStartDateOpen = this.startDateOpen;
      const oldendDateOpen = this.endDateOpen;

      if (newValue.length === 1) {
        const startDayAndMonth = this.dateVue.format(startDate, "shortDate");
        const startyear = this.dateVue.format(startDate, "year");
        this.dateRange = `${startDayAndMonth} ${startyear}`;
        this.startDateOpen = this.dateVue.toISO(startDate) + "T00:00:00.000";
        this.endDateOpen = null;
        if (!oldValue.length && oldStartDateOpen === this.startDateOpen) return;
      } else if (newValue.length === 2) {
        const startDayAndMonth = this.dateVue.format(startDate, "shortDate");
        const startyear = this.dateVue.format(startDate, "year");
        const endDayAndMonth = this.dateVue.format(endDate, "shortDate");
        const endyear = this.dateVue.format(endDate, "year");
        this.dateRange = `${startDayAndMonth} ${startyear} - ${endDayAndMonth} ${endyear}`;
        this.startDateOpen = this.dateVue.toISO(startDate) + "T00:00:00.000";
        this.endDateOpen = this.dateVue.toISO(endDate) + "T00:00:00.000";
        if (
          oldStartDateOpen === this.startDateOpen &&
          oldendDateOpen === this.endDateOpen
        )
          return;
      } else {
        this.dateRange = "";
        this.startDateOpen = null;
        this.endDateOpen = null;
      }

      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    selectedTags(newValue, oldValue) {
      const dontChangeTags =
        oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeTags) return;

      const oldTagsOpen = this.tagOpen ? [...this.tagOpen] : [];

      this.tagOpen = this.selectedTags.map(
        (tagCode) => this.tags.find((t) => t.code === tagCode).name
      );

      const dontChangeTagOpen =
        oldTagsOpen.slice().sort().join(",") ===
        this.tagOpen.slice().sort().join(",");

      if (dontChangeTagOpen) return;

      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    idOpen: "updateRoute",
    versionOpen: "updateRoute",
  },
};
</script>
<style scoped>
.bottom-space {
  margin-top: 20px;
  height: 150px;
}
.load-inside-img {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.v-infinite-scroll {
  overflow: hidden;
}

:deep(.v-picker-title) {
  display: none;
}

.selected-filter-chip {
  top: -8px;
}

.date-custom-header {
  background-color: var(--v-theme-background);
}

.custom-data-picker {
  margin-top: -22px;
}

:deep(.v-autocomplete .v-label) {
  font-size: 12px;
  transform: translateY(-11px);
}

:deep(.v-autocomplete__menu-icon) {
  display: none;
}

:deep(.v-field) {
  border-radius: 100px !important;
}

.filters-top {
  position: sticky;
  top: 0;
  z-index: 10;
}

.filters-bottom {
  position: fixed;
  bottom: -5px;
  z-index: 100;
  width: 90vw;
}

.nav-buttons::after {
  content: "";
  display: table;
  clear: both;
}

.nav-buttons {
  position: fixed;
  left: 50%;
  transform: translateX(-43%);
  bottom: 30px;
  width: auto; /* ou uma largura específica se necessário */
  z-index: 9999;
}

.v-img {
  box-shadow: 4px 10px 5px rgba(0, 0, 0, 0.4); /* Sombra leve para um look suave */
  border-radius: 8px; /* Bordas arredondadas */
  transition: transform 0.3s ease-in-out;
}

.v-img:hover {
  transform: scale(1.05); /* Aumenta levemente a imagem */
  filter: brightness(var(--v-theme-darken-hover));
}

.v-img:hover::before {
  content: "";
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(
    255,
    255,
    255,
    0.1
  ); /* Overlay claro para modo escuro */
}

.v-container {
  padding: 10px;
}

.img-cols {
  padding: 8px;
}

.switch-margin {
  margin-top: 21px; /* Centraliza verticalmente */
}

.switch-icons-style {
  margin-top: 0px; /* Centraliza verticalmente */
}

.theme-switch-wrapper {
  border-radius: 100px; /* Bordas arredondadas para imitar campos de entrada */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Sombra opcional para profundidade */
  height: 40px; /* Altura específica para alinhar com v-autocomplete */
  display: flex;
  margin-top: 11px;
  padding: 5px;
  margin-left: 10px;
}

.theme-switch-wrapper-top {
  border-radius: 100px; /* Bordas arredondadas para imitar campos de entrada */
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1); /* Sombra opcional para profundidade */
  height: 40px; /* Altura específica para alinhar com v-autocomplete */
  display: flex;
  margin-top: 13px;
  padding: 5px;
  margin-left: 10px;
}
</style>
