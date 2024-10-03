<template>
  <v-dialog
    :width="size.width"
    @keydown="handleKeyDown"
    @click:outside="closeImage"
    v-if="image.original || image.images"
  >
    <v-card
      style="overflow: visible; background-color: transparent"
      @mouseover="toggleHoverExpansionPanel"
      @mouseleave="toggleHoverExpansionPanel"
      @touchend="toggleHoverExpansionPanel"
      @touchmove="toggleHoverExpansionPanel"
      :class="{ rotated: isRotated }"
    >
      <v-carousel
        :height="size.height"
        :show-arrows="false"
        v-model="computedActiveIndex"
        hide-delimiters
        transition="expand"
      >
        <v-carousel-item
          v-for="(item, i) in onlyOriginal || noEditedVersion
            ? [image.original]
            : image.images"
          :key="i"
          :lazy-src="item?.lazyThumbnailBase64"
          cover
          :src="cache[item?._id]"
          @load="() => $emit('finishLoadgImage')"
        >
          <template v-slot:placeholder
            ><v-progress-circular
              indeterminate
              color="primary"
              size="128"
            ></v-progress-circular
          ></template>
        </v-carousel-item>
        <div
          class="no-edit-checkbox"
          v-if="expandedPanelVisible && image.original"
        >
          <v-checkbox
            false-icon="$custom-edit"
            true-icon="$custom-no-edit"
            v-model="noEditedVersion"
            :disabled="onlyOriginal"
          >
          </v-checkbox>
        </div>
        <div v-if="expandedPanelVisible && image.images.length > 1">
          <v-radio-group
            v-model="activeIndex"
            class="custom-delimiters"
            inline
            density="compact"
            @update:model-value="noEditedVersion = false"
            :style="{ left: delimiterPosition }"
          >
            <v-radio
              v-for="(item, i) in image.images"
              :key="i"
              :value="i"
              density="compact"
              :style="{ left: delimiterPosition }"
            >
            </v-radio>
          </v-radio-group>
        </div>
        <v-expansion-panels
          class="expansion-panel"
          v-model="panelExpanded"
          v-if="expandedPanelVisible"
        >
          <v-expansion-panel class="expansion-box" :style="{'max-height': heightEightyPercent}">
            <v-expansion-panel-title
              readonly
              hide-actions
              class="expansion-title"
              @click="toggleExpansionPanel"
            >
              <v-row justify="space-between">
                <v-col cols="10">
                  <v-row>
                    <div class="div-location-button">
                      <v-menu location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            class="location-button"
                            size="x-small"
                            density="comfortable"
                            v-bind="props"
                            style="max-width: 80%; overflow: hidden"
                            id="location-button"
                            ref="location-button"
                          >
                            <div class="scroll-container">
                              <div
                                class="scroll-text"
                                :data-text="fullLocationText"
                              >
                                {{ fullLocationText }}
                              </div>
                            </div>
                          </v-btn>
                          <v-btn
                            class="location-button"
                            size="x-small"
                            density="compact"
                            v-bind="props"
                            icon="mdi-plus"
                            ref="location-button-plus"
                            id="location-button-plus"
                          >
                          </v-btn>
                        </template>
                        <v-list
                          id="location-menu"
                          bg-color="rgba(0, 0, 0, 0.7)"
                        >
                          <div @click.stop class="location-full">
                            <span
                              >{{ image.country
                              }}{{ image.state ? ", " + image.state : ""
                              }}{{ image.city ? ", " + image.city : "" }}</span
                            >
                          </div>
                          <v-list-item
                            density="compact"
                            class="location-menu"
                            :href="`https://www.google.com/maps?q=${image.metadata.latitude},${image.metadata.longitude}`"
                            target="_blank"
                            v-if="(
                              image.metadata.latitude &&
                              image.metadata.longitude
                            )"
                          >
                            <v-row>
                              <v-col cols="3">
                                <v-icon>$custom-map</v-icon>
                              </v-col>
                              <v-col>
                                <v-list-item-title
                                  >Google Maps</v-list-item-title
                                >
                              </v-col>
                            </v-row>
                          </v-list-item>
                          <v-list-item
                            density="compact"
                            class="location-menu"
                            :href="`https://www.google.com/maps/@?api=1&map_action=pano&viewpoint=${image.metadata.latitude},${image.metadata.longitude}&heading=${image.metadata.cameraTrueDirection}&pitch=0&fov=90`"
                            target="_blank"
                            v-if="(
                              image.metadata.latitude &&
                              image.metadata.longitude
                            )"
                          >
                            <v-row>
                              <v-col cols="3">
                                <v-icon>$custom-street-view</v-icon>
                              </v-col>
                              <v-col>
                                <v-list-item-title
                                  >Street View</v-list-item-title
                                >
                              </v-col>
                            </v-row>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </v-row>
                  <v-row>
                    <div>
                      <v-menu location="top">
                        <template v-slot:activator="{ props }">
                          <v-btn
                            class="datetime-button datetime-photographed"
                            size="x-small"
                            density="comfortable"
                            v-bind="props"
                            id="datetime-photographed"
                            style="max-width: 82%; overflow: hidden"
                          >
                            {{ getDateHour(image.metadata.takenAt) }}
                          </v-btn>
                          <v-btn
                            class="datetime-button"
                            size="x-small"
                            density="compact"
                            v-bind="props"
                            icon="mdi-plus"
                          >
                          </v-btn>
                        </template>
                        <v-list
                          id="datetime-menu"
                          bg-color="rgba(0, 0, 0, 0.7)"
                          @click.stop
                        >
                          <v-list-item density="compact" class="datetime-menu">
                            <v-row>
                              <v-col cols="2">
                                <v-icon>$custom-photographed</v-icon>
                              </v-col>
                              <v-col>
                                <v-list-item-title>{{
                                  getDateHour(image.metadata.takenAt)
                                }}</v-list-item-title>
                              </v-col>
                            </v-row>
                          </v-list-item>
                          <v-list-item density="compact" class="datetime-menu">
                            <v-row>
                              <v-col cols="2">
                                <v-icon>$custom-post</v-icon>
                              </v-col>
                              <v-col>
                                <v-list-item-title>{{
                                  getDateHour(image.createdAt)
                                }}</v-list-item-title>
                              </v-col>
                            </v-row>
                          </v-list-item>
                        </v-list>
                      </v-menu>
                    </div>
                  </v-row>
                </v-col>
                <v-col cols="2" class="d-flex justify-end arrow-expand-panel">
                  <v-btn
                    size="small"
                    :icon="
                      panelExpanded === null
                        ? 'mdi-chevron-up'
                        : 'mdi-chevron-down'
                    "
                    density="compact"
                    class="expand-button"
                  ></v-btn>
                </v-col>
              </v-row>
            </v-expansion-panel-title>
            <v-expansion-panel-text retain-scroll>
              <v-card class="card-pallete-colors">
                <v-row justify="center" align="center">
                  <v-col cols="auto" class="align-center">
                    <div class="color-palette">
                      <div
                        v-for="(color, index) in noEditedVersion || onlyOriginal
                          ? image.original.colorPalette
                          : image.images[activeIndex].colorPalette"
                        :key="index"
                        :style="{
                          backgroundColor: `rgb(${color.red}, ${color.green}, ${color.blue})`,
                        }"
                        class="color-box"
                        @click="copyColorCode(color)"
                      ></div>
                    </div>
                  </v-col>
                </v-row>
              </v-card>
              <v-card class="card-description-tags">
                <v-tabs
                  v-model="tab"
                  align-tabs="center"
                  color="white"
                  density="compact"
                >
                  <v-row justify="center">
                    <v-col :cols="image.description ? 4 : 6">
                      <v-tab :value="1"
                        ><v-icon>mdi-cog-outline</v-icon>
                      </v-tab>
                    </v-col>
                    <v-col cols="4" v-if="image.description">
                      <v-tab :value="2"
                        ><v-icon>mdi-text-box-outline</v-icon>
                      </v-tab>
                    </v-col>
                    <v-col :cols="image.description ? 4 : 6">
                      <v-tab :value="3"
                        ><v-icon>mdi-tag-multiple</v-icon>
                      </v-tab>
                    </v-col>
                  </v-row>
                </v-tabs>
                <v-card-text :style = "{'max-height': heightThirtyPercent, 'overflow-y': 'auto'}" class="text-specs-description-tags">
                  <v-tabs-window v-model="tab">
                    <v-tabs-window-item :value="1">
                      <v-row>
                        <v-col class="d-flex justify-space-between">
                          <v-icon> $custom-camera </v-icon>
                          {{ image.metadata.camera }}
                        </v-col>
                        <v-col class="d-flex justify-space-between">
                          <v-icon> $custom-lens </v-icon>
                          {{ image.metadata.lens.substring(0, 18) }}
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="d-flex justify-space-between">
                          <v-icon>$custom-shutter-speed</v-icon>
                          {{ image.metadata.shutterSpeed }}
                        </v-col>
                        <v-col class="d-flex justify-space-between">
                          <v-icon>$custom-aperture</v-icon>
                          {{ image.metadata.aperture }}
                        </v-col>
                      </v-row>
                      <v-row>
                        <v-col class="d-flex justify-space-between">
                          <v-icon> $custom-iso </v-icon>
                          {{ image.metadata.iso }}
                        </v-col>
                        <v-col class="d-flex justify-space-between">
                          <v-icon> $custom-white-balance </v-icon>
                          {{ image.metadata.whiteBalance }}
                        </v-col>
                      </v-row>
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="2" v-if="image.description">
                      {{ image.description }}
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="3">
                      <v-chip-group column>
                        <v-chip class="non-clickable" v-for="tag in image.tags" :key="tag">
                          {{ tag }}
                        </v-chip>
                      </v-chip-group>
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-card-text>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-carousel>
    </v-card>
    <v-snackbar class="v-snackbar" v-model="toastInfo" location="top">{{
      toastMessage
    }}</v-snackbar>
  </v-dialog>
</template>

<script>
import { getDateHour } from "@/utils/date";
import { nextTick } from "vue";

export default {
  props: {
    image: Object,
    width: Number,
    height: Number,
    cache: Object,
    version: String,
    display: Object,
    isRotated: Boolean,
  },
  data() {
    return {
      activeIndex: 0,
      panelExpanded: null,
      expandedPanelVisible: false,
      getDateHour,
      tab: null,
      noEditedVersion: false,
      toastInfo: false,
      toastMessage: "",
      delimiterPosition: "0px",
      touchInProgress: false,
      touchStartX: null,
      touchEndX: 0,
      touchStartTime: null,
      touchEndTime: null,
      touchSwipeDuration: 300,
      threshold: 40,
      size: {
        width: "100px",
        height: "100px"
      }
    };
  },
  mounted() {
  screen.orientation.addEventListener('change', this.screenRotation);
},
 beforeUnmount() {
  screen.orientation.removeEventListener('change', this.screenRotation);
},
  computed: {
    heightEightyPercent() {
      return this.size.height.slice(0,-2) * 0.8 + "px";
    },
    heightThirtyPercent() {
      return this.size.height.slice(0,-2) * 0.3 + "px";
    },
    fullLocationText() {
      return `${this.image.country}
      ${this.image.state ? `, ${this.image.state}` : ""}
      ${
        this.image.city ? `, ${this.image.city}` : ""
      }\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`;
    },
    onlyOriginal() {
      return !this.image.images?.length && !!this.image.original;
    },
    computedActiveIndex() {
      return this.noEditedVersion || this.onlyOriginal ? 0 : this.activeIndex;
    },
  },
  methods: {
    resize() {
      let proportion = this.width / this.height;
      const isPortrait = window.matchMedia("(orientation: portrait)").matches;

    let screenWidth = window.screen.width - 100;
    let screenHeight = window.screen.height - 150;
    // Verifica se precisamos trocar os valores de largura e altura
    if ((screenWidth > screenHeight && isPortrait) || (screenWidth < screenHeight && !isPortrait)) {
      [screenWidth, screenHeight] = [screenHeight, screenWidth];
    }
      const screenProportion = screenWidth / screenHeight;

      if (this.isRotated) {
        proportion = this.height / this.width;

        if (proportion > screenProportion) {
          if (proportion < 1) {
            this.size.width = screenHeight * proportion + "px"
            this.size.height = screenWidth * proportion + "px"
          } else {
            this.size.width = (screenHeight < screenWidth ? screenHeight : screenWidth) / proportion + "px"
            this.size.height = screenWidth > screenHeight ? screenHeight : screenWidth + "px"
          }
        } else {
          if (proportion > 1) {
            this.size.width = screenHeight / proportion + "px"
            this.size.height = screenWidth / screenProportion + "px"
          } else {
            this.size.width = screenHeight + "px",
            this.size.height = (screenProportion > 1 ? screenHeight : screenWidth) * proportion + "px"
          }
        }
      } else {
      if (proportion > screenProportion) {
        this.size.width = screenWidth + "px"
        this.size.height = screenWidth / proportion + "px"
      } else {
        this.size.width = screenHeight * proportion + "px"
        this.size.height = screenHeight + "px"
      }
    }
    },
    screenRotation(){
      this.resize()
      setTimeout(()=>{
        window.scrollBy(0, 1);
        window.scrollBy(0, -1);
      },500)
    },
    handleKeyDown(event) {
      if (event.shiftKey && event.key === "ArrowLeft") {
        this.activeIndex =
          (this.activeIndex - 1 + this.image.images.length) %
          this.image.images.length;
        this.noEditedVersion = false;
      } else if (event.shiftKey && event.key === "ArrowRight") {
        this.activeIndex = (this.activeIndex + 1) % this.image.images.length;
        this.noEditedVersion = false;
      } else if (event.key === "ArrowLeft") {
        this.previousImage();
      } else if (event.key === "ArrowRight") {
        this.nextImage();
      } else if (event.key === "Escape") {
        this.closeImage();
      }
    },
    nextImage() {
      this.$emit("next");
    },
    previousImage() {
      this.$emit("prev");
    },
    closeImage() {
      this.noEditedVersion = this.onlyOriginal ? true : false;
      this.activeIndex = 0;
      this.$emit("close");
    },
    async copyColorCode(color) {
      const toHex = c => {
    const hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  };

    const hexColor =  "#" + toHex(color.red) + toHex(color.green) + toHex(color.blue);
      await navigator.clipboard.writeText(hexColor);

      this.toastMessage = "color code copied successfully: " + hexColor;
      this.toastInfo = true;
    },
    async toggleHoverExpansionPanel(event) {
      if (
        event.type === "mouseleave" &&
        event.relatedTarget?.className === "v-overlay__scrim"
      ) {
        this.expandedPanelVisible = false;
      } else if (event.type === "mouseover" && !this.touchInProgress) {
        this.expandedPanelVisible = true;
      } else if (
        event.type === "touchend" &&
        event.target.className === "v-img__img v-img__img--cover"
      ) {

        this.touchEndTime = event.timeStamp;

        if (this.touchStartX !== null && this.touchStartTime !== null) {
          const direction = this.touchStartX - this.touchEndX;
          const duration = this.touchEndTime - this.touchStartTime; // Duração em milissegundos

          if (Math.abs(direction) > this.threshold && duration < this.touchSwipeDuration) {
            if (direction > 0) {
              this.nextImage();
            } else {
              this.previousImage();
            }
          }
          this.touchStartX = null; // Reseta para a próxima interação
          this.touchStartTime = null;

          return;
        }

        this.touchInProgress = true;
        await nextTick();
        this.expandedPanelVisible = !this.expandedPanelVisible;
        setTimeout(() => {
          this.touchInProgress = false;
        }, 300);
      } else if (event.type === "touchmove" && event.touches.length === 1) {
        if (this.touchStartX === null) {
          this.touchStartX = event.touches[0].clientX;
          this.touchStartTime = event.timeStamp;

        }
        this.touchEndX = event.touches[0].clientX;
      }
    },
    toggleExpansionPanel() {
      this.panelExpanded = this.panelExpanded === null ? 0 : null;
    },
  },
  watch: {
    isRotated() {
      this.resize();
    },
    onlyOriginal(newValue) {
      if (newValue) {
        this.noEditedVersion = true;
      }
    },
    activeIndex(newValue) {
      this.$emit(
        "version",
        this.onlyOriginal ? "original" : String(newValue + 1)
      );
    },
    noEditedVersion(newValue) {
      if (newValue) {
        this.$emit("version", "original");
      } else {
        this.$emit("version", String(this.activeIndex + 1));
      }
    },
    image(value) {
      this.resize()
      this.activeIndex = Number(this.version) - 1;
      this.noEditedVersion =
        this.version === "original" || !value.images?.length ? true : false;
    },
  },
};
</script>

<style scoped>
:deep(.v-overlay__content) {
  pointer-events: none;
}

:deep(.v-overlay__content > .v-card) {
  pointer-events: auto; /* Aplica a propriedade a todos os elementos dentro de .v-card */
}

:deep(.v-overlay__content > #location-menu) {
  pointer-events: auto !important;
}

:deep(.v-overlay__content > #datetime-menu) {
  pointer-events: auto !important;
}

.rotated {
  transform: rotate(90deg);
  transform-origin: center center; /* Garante que a rotação ocorra em torno do centro */
  height: 100%;
  width: 100%;
}

.prev {
  left: -45px;
  color: white;
  transition: background-color 0.3s ease;
}

.next {
  right: -45px;
  color: white;
  transition: background-color 0.3s ease;
}

.expansion-panel {
  position: absolute;
  bottom: 0;
  left: 0;
  width: 100%;
}

.card-pallete-colors {
  background-color: transparent;
  display: flex;
  justify-content: center;
  align-items: center;
}

.color-palette {
  display: flex;
  margin: 0px;
}

.color-box {
  width: 25px;
  height: 25px;
  border: none;
  cursor: pointer;
}

.no-edit-checkbox {
  position: absolute;
  top: 0;
  right: 0;
}

.expansion-box {
  background-color: rgba(0, 0, 0, 0.5);
  color: #c5c5c5;
}

.expansion-title {
  max-height: 30px;
}

.arrow-expand-panel {
  padding-left: 0px;
  padding-right: 0px;
}

.non-clickable {
  pointer-events: none;
}

.v-tab.v-tab.v-btn {
  min-width: 50px;
}

:deep(.v-slide-group__container) {
  display: ruby;
  text-align: center;
}

.v-expansion-panel--active
  > .v-expansion-panel-title:not(.v-expansion-panel-title--static) {
  min-height: 40px;
}

:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
  overflow-y: auto; /* Assegura rolagem vertical */
}

.custom-delimiters {
  position: absolute;
  top: 7px;
  left: 0;
  margin: 4px;
  color: rgba(255, 255, 255, 0.3);
}

.text-configs {
  color: #c5c5c5;
}

.card-description-tags {
  background-color: rgba(0, 0, 0, 0.7);
  color: #c5c5c5;
}

.text-specs-description-tags::-webkit-scrollbar {
  width: 12px;
  /* Largura da barra de rolagem */
}

/* Estilo para a alça da barra de rolagem */
.text-specs-description-tags::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.9);
  /* Cor da alça */
  border-radius: 6px;
  /* Raio da borda da alça */
}

/* Estilo para a pista da barra de rolagem */
.text-specs-description-tags::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.1);
  /* Cor de fundo da pista */
}

/* Estilo para o canto da barra de rolagem */
.text-specs-description-tags::-webkit-scrollbar-corner {
  background-color: transparent;
  /* Cor de fundo do canto */
}

.expand-button {
  color: white;
  background-color: black;
}

.location-button,
.datetime-button {
  color: white;
  background-color: rgba(0, 0, 0, 0.4);
  overflow: hidden;
}

.location-menu,
.datetime-menu {
  color: #c5c5c5;
}

.location-full {
  font-size: 14px;
  color: #c5c5c5;
  font-weight: bold;
  text-align: center;
}

.datetime-photographed {
  margin-left: 0px;
}

.div-location-button {
  max-width: 100%;
}

.scroll-container {
  overflow: hidden;
  white-space: nowrap;
  width: 100%;
  display: inline-block;
  position: relative;
}

.scroll-text {
  display: inline-block;
  white-space: nowrap;
  animation: scroll 10s linear infinite;
}

.scroll-text::after {
  content: attr(data-text);
  position: absolute;
  top: 0;
  left: 100%;
  white-space: nowrap;
}

.v-progress-circular {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

@keyframes scroll {
  0% {
    transform: translateX(0%);
  }

  100% {
    transform: translateX(-100%);
  }
}
</style>
