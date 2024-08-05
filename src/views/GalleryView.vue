<template>
  <v-container>
    <v-card class="header">
      <v-row class="pt-3 pl-3 pr-3">
        <v-col xs="6" md="4" sm="6">
          <v-autocomplete
            v-model="selectedCountries"
            label="Country"
            :items="countries"
            item-title="name"
            item-value="code"
            multiple
            variant="outlined"
            density="compact"
            clearable
            autocomplete="null"
          >
            <template v-slot:selection="data">
              <v-chip
                v-if="data.index < 1"
                :key="data.item"
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                class="truncate-chip"
              >
                <span class="truncate">{{ data.item.title }}</span>
              </v-chip>
              <span v-else-if="data.index === 1"
                >+{{ selectedCountries.length - 1 }}</span
              >
            </template>
          </v-autocomplete>
        </v-col>
        <v-col xs="6" md="4" sm="6">
          <v-autocomplete
            label="State/Province/Region"
            :items="computedStates"
            v-model="selectedStates"
            item-title="name"
            item-value="code"
            multiple
            variant="outlined"
            density="compact"
            clearable
            autocomplete="null"
          >
            <template v-slot:selection="data">
              <v-chip
                v-if="data.index < 1"
                :key="data.item"
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                class="truncate-chip"
              >
                <span class="truncate">{{ data.item.title }}</span>
              </v-chip>
              <span v-else-if="data.index === 1"
                >+{{ selectedStates.length - 1 }}</span
              >
            </template>
          </v-autocomplete>
        </v-col>
        <v-col xs="6" md="4" sm="6">
          <v-autocomplete
            label="City"
            :items="computedCities"
            v-model="selectedCities"
            item-title="name"
            item-value="code"
            multiple
            variant="outlined"
            density="compact"
            clearable
            autocomplete="null"
          >
            <template v-slot:selection="data">
              <v-chip
                v-if="data.index < 1"
                :key="data.item"
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                class="truncate-chip"
              >
                <span class="truncate">{{ data.item.title }}</span>
              </v-chip>
              <span v-else-if="data.index === 1"
                >+{{ selectedCities.length - 1 }}</span
              >
            </template>
          </v-autocomplete>
        </v-col>
        <v-col xs="6" md="4" sm="6">
          <v-autocomplete
            label="Tags"
            :items="tags"
            v-model="selectedTags"
            item-title="name"
            item-value="code"
            multiple
            variant="outlined"
            density="compact"
            clearable
            autocomplete="null"
          >
            <template v-slot:selection="data">
              <v-chip
                v-if="data.index < 1"
                :key="data.item"
                v-bind="data.attrs"
                :input-value="data.selected"
                close
                class="truncate-chip"
              >
                <span class="truncate">{{ data.item.title }}</span>
              </v-chip>
              <span v-else-if="data.index === 1"
                >+{{ selectedTags.length - 1 }}</span
              >
            </template>
          </v-autocomplete>
        </v-col>
        <v-col xs="6" md="4" sm="6">
            <v-menu
              :close-on-content-click="false"
              transition="slide-y-transition"
              class="date-picker-menu"
              location="bottom"
              max-width="100"
            >
              <template #activator="{ props }">
                <v-autocomplete
                  v-model="dateRange"
                  label="Select Date Range"
                  readonly
                  v-bind="props"
                  @click:clear="selectedDate = []"
                  variant="outlined"
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
                width="100%"
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
      </v-row>
    </v-card>
    <v-progress-circular
      v-if="loading"
      indeterminate
      color="green"
      size="128"
      width="8"
    ></v-progress-circular>
    <v-infinite-scroll
      v-if="loadedFilters"
      :items="items"
      :onLoad="loadImages"
      empty-text=""
    >
      <v-container>
        <v-row>
          <template v-for="(item, index) in items" :key="index">
            <v-col xs="6" sm="4" md="3" lg="2" xl="1">
              <v-img
                :lazy-src="
                  item.images[0]?.lazyThumbnailBase64 ||
                  item.original?.lazyThumbnailBase64
                "
                :src="
                  item.images[0]?.thumbnailUrl || item.original?.thumbnailUrl
                "
                cover
                aspect-ratio="1/1"
                width="150"
                height="150"
                class="mx-auto"
                rounded
                @click="openImageModal(item, index)"
              >
                <template v-slot:placeholder
                  ><v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular
                ></template>
              </v-img>
            </v-col>
          </template>
        </v-row>
      </v-container>
    </v-infinite-scroll>
  </v-container>
  <modal-viewer-image
    v-model="viewerModal"
    :width="selectedImage?.metadata?.optimizedWidth"
    :height="selectedImage?.metadata?.optimizedHeight"
    :image="selectedImage"
    :cache="cache"
    :version="versionOpen"
    @next="changeImage(1)"
    @prev="changeImage(-1)"
    @version="(version) => (versionOpen = version)"
    @close="
      idOpen = null;
      versionOpen = null;
    "
  />
  <v-snackbar v-model="error" color="error" top>{{ errorMessage }}</v-snackbar>
</template>

<script>
import _ from "lodash";
import { useDate } from 'vuetify'
import { ref } from "vue";
import ModalViewerImage from "@/components/ModalViewerImage.vue";

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
      hasMore: true,
      totalImages: 0,
      perPage: 30,
      offset: 0,
      imageModal: false,
      selectedImage: {},
      indexToDelete: null,
      showDialog: false,
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
      dateVue: useDate()

    };
  },
  computed: {
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
    }
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
        this.selectedDate = [this.dateVue.parseISO(this.startDateOpen.split('T')[0])];
      }

    if (this.startDateOpen && this.endDateOpen) {
      this.selectedDate = [
        this.dateVue.parseISO(this.startDateOpen.split('T')[0]),
        this.dateVue.parseISO(this.endDateOpen.split('T')[0]),
      ];
    }

    if (this.endDateOpen && !this.startDateOpen) {
      this.endDateOpen = null;
      this.updateRoute()
    }

      this.loadedFilters = true;
  },
  methods: {
    async loadImages({ done }) {
      //console.log(done)
      console.log("loadImages");
      console.log("hasMore", this.hasMore);
      if (this.hasMore) {
        this.loading = true;
        try {
          const response = await this.$api.get(
            "images",
            {
              params: {
                sort: "createdAt",
                order: "desc",
                offset: this.offset,
                limit: this.perPage,
                id: this.idOpen,
                city: this.cityOpen,
                state: this.stateOpen,
                country: this.countryOpen,
                takenAtFrom: this.startDateOpen,
                takenAtTo: this.endDateOpen,
                tags: this.tagOpen,
                // Adicione outros parâmetros de filtro e ordenação conforme necessário
              },
            }
          );
          const { images, total } = response.data;
          this.items.push(...images);
          this.totalImages = total;
          this.hasMore = this.offset + this.perPage < total;
          this.offset += this.perPage;
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
          (this.errorMessage = "Image not found"),
            console.error("Image not found:", error);
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
        const response = await this.$api.get('states');
        this.states = response.data;
      } catch (error) {
        console.error("Erro ao carregar estados:", error);
      }
    },
    async loadCities() {
      try {
        const response = await this.$api.get('cities');
        this.cities = response.data;
      } catch (error) {
        console.error("Erro ao carregar cidades:", error);
      }
    },
    async loadTags() {
      try {
        console.log('antes de chamar a tag')
        const response = await this.$api.get("tags");
        console.log('respondeTags', response)
        this.tags = response.data;
      } catch (error) {
        console.error("Erro ao carregar tags:", error);
      }
    },
    openImageModal(item, index, version) {
      console.log(version);
      this.selectedImage = item;
      this.currentIndex = index;
      this.viewerModal = true;
      this.idOpen = item._id;
      this.versionOpen = item.images?.length
        ? version?.toString() || "1"
        : "original";
    },
    changeImage(direction) {
      console.log("changeImage");
      const nextIndex = this.currentIndex + direction;
      if (nextIndex >= 0 && nextIndex < this.items.length) {
        this.selectedImage = this.items[nextIndex];
        this.currentIndex = nextIndex;
        this.idOpen = this.selectedImage._id;
        this.versionOpen = this.selectedImage.images?.length ? "1" : "original";
      } else if (nextIndex >= 0 && nextIndex >= this.items.length) {
        this.loadImages({
          done: (status) => {
            if (status === "empty") return false;
            this.selectedImage = this.items[nextIndex];
            this.currentIndex = nextIndex;
            this.idOpen = this.selectedImage._id;
            this.versionOpen = this.selectedImage.images?.length
              ? "1"
              : "original";
          },
        });
      }
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
      console.log("ue");
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
      console.log("resetou imagens");
      this.loading = true;
      this.hasMore = true;
      this.items = [];
      this.offset = 0;
    },
  },
  watch: {
    selectedImage(value) {
      console.log("recebeu update no selectImage");
      console.log(value);
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
      console.log("states");

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

      console.log("states passou da validação");

      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    selectedCities(newValue, oldValue) {
      console.log("cities");
      console.log(newValue);
      console.log(oldValue);

      const dontChangeSelectedCities =
        oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");
      console.log(dontChangeSelectedCities);

      if (dontChangeSelectedCities) return;

      const oldCityOpen = this.cityOpen ? [...this.cityOpen] : [];

      this.cityOpen = this.selectedCities.map(
        (cityCode) => this.cities.find((c) => c.code === cityCode).name
      );

      const dontChangeCityOpen =
        oldCityOpen.slice().sort().join(",") ===
        this.cityOpen.slice().sort().join(",");

      console.log("cityOpen", this.cityOpen);
      console.log("oldCityOpen", oldCityOpen);
      console.log(dontChangeCityOpen);

      if (dontChangeCityOpen) return;

      console.log("passou validações city");

      //console.log(this.cityOpen)
      this.updateRoute();
      this.resetImages();
      console.log("antes do load no city");
      this.debounceLoadImages({});
    },
    selectedDate(newValue, oldValue) {
      console.log('newValue', newValue[0])
      console.log('oldValue', oldValue)
      console.log(this.endDateOpen)

      const dontChangeSelectedDates = oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeSelectedDates) return;

      const [startDate, endDate] = newValue.sort((a, b) => a.getTime() - b.getTime());

      const oldStartDateOpen = this.startDateOpen
      const oldendDateOpen = this.endDateOpen

      if (newValue.length === 1) {
        const startDayAndMonth = this.dateVue.format(startDate, 'shortDate');
        const startyear = this.dateVue.format(startDate, 'year');
        this.dateRange = `${startDayAndMonth} ${startyear}`;
        this.startDateOpen = this.dateVue.toISO(startDate) + 'T00:00:00.000';
        this.endDateOpen = null;
        if (!oldValue.length && oldStartDateOpen === this.startDateOpen) return;
      } else if (newValue.length === 2) {
        const startDayAndMonth = this.dateVue.format(startDate, 'shortDate');
        const startyear = this.dateVue.format(startDate, 'year');
        const endDayAndMonth = this.dateVue.format(endDate, 'shortDate');
        const endyear = this.dateVue.format(endDate, 'year');
        this.dateRange = `${startDayAndMonth} ${startyear} - ${endDayAndMonth} ${endyear}`;
        this.startDateOpen = this.dateVue.toISO(startDate) + 'T00:00:00.000';
        this.endDateOpen = this.dateVue.toISO(endDate) + 'T00:00:00.000';
        if (oldStartDateOpen === this.startDateOpen && oldendDateOpen === this.endDateOpen) return;
      } else {
        this.dateRange = '';
        this.startDateOpen = null;
        this.endDateOpen = null;
      }

      console.log('vai chamar as coisas do date')
      this.updateRoute();
      this.resetImages();
      this.debounceLoadImages({});
    },
    selectedTags(newValue, oldValue) {
      console.log('tagsOld', oldValue)
      console.log('tagsNew', newValue)
      const dontChangeTags = oldValue.slice().sort().join(",") === newValue.slice().sort().join(",");

      if (dontChangeTags) return;

      const oldTagsOpen = this.tagOpen ? [...this.tagOpen] : [];

      this.tagOpen = this.selectedTags.map(
        (tagCode) => this.tags.find((t) => t.code === tagCode).name
      );

      const dontChangeTagOpen = oldTagsOpen.slice().sort().join(",") === this.tagOpen.slice().sort().join(",");

      if (dontChangeTagOpen) return;
      console.log('passou da validação de tagas')

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
.v-progress-circular {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.truncate-chip .truncate {
  display: block;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 100%;
}
.v-infinite-scroll {
  overflow: hidden;
}

::deep .v-picker-title {
  display: none;
}

.date-custom-header {
  background-color: var(--v-theme-background);
}

.custom-data-picker {
  margin-top: -22px;
}
</style>
