<template>
  <v-dialog
    :width="size.width"
    @keydown="handleKeyDown"
    @click:outside="closeImage"
    v-if="image.original || image.images"
  >
    <v-card
      style="overflow: visible"
      @mouseover="toggleHoverExpansionPanel"
      @mouseleave="toggleHoverExpansionPanel"
      @touchstart="toggleHoverExpansionPanel"
      @touchend="toggleHoverExpansionPanel"
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
          <v-expansion-panel class="expansion-box">
            <v-expansion-panel-title
              readonly
              hide-actions
              class="expansion-title"
              @click.stop="toggleExpansionPanel"
            >
              <v-row justify="space-between" id="rowPanelTitle">
                <v-col cols="5" style="font-size: 12px">
                  <v-row>
                    <div class="div-location-button" @click.stop="(event)=>{event.stopPropagation();console.log('veio')}" >
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
                            density="comfortable"
                            v-bind="props"
                            icon="mdi-plus"
                            @click.stop="(event)=>{event.stopPropagation();console.log('veio')}"
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
                              >{{ image.country }}{{ image.state ? ', ' + image.state : '' }}{{ image.city ? ', ' + image.city : '' }}</span
                            >
                          </div>
                          <v-list-item
                            density="compact"
                            class="location-menu"
                            :href="`https://www.google.com/maps?q=${image.metadata.latitude},${image.metadata.longitude}`"
                            target="_blank"
                            @click.stop
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
                          >
                            {{ getDateHour(image.metadata.takenAt) }}
                          </v-btn>
                          <v-btn
                            class="datetime-button"
                            size="x-small"
                            density="comfortable"
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
                <v-col cols="2" class="text-right">
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
                  <v-tab :value="1">Desc</v-tab>
                  <v-tab :value="2">Tags</v-tab>
                </v-tabs>
                <v-card-text class="text-description-tags">
                  <v-tabs-window v-model="tab">
                    <v-tabs-window-item :value="1">
                      {{ image.description }}
                    </v-tabs-window-item>
                    <v-tabs-window-item :value="2">
                      <v-chip-group selected-class="text-primary" column>
                        <v-chip v-for="tag in image.tags" :key="tag">
                          {{ tag }}
                        </v-chip>
                      </v-chip-group>
                    </v-tabs-window-item>
                  </v-tabs-window>
                </v-card-text>
              </v-card>
              <v-card class="card-configs">
                <v-container>
                  <v-row>
                    <v-col cols="1">
                      <v-icon> $custom-camera </v-icon>
                    </v-col>
                    <v-col class="text-configs">
                      {{ image.metadata.camera }}
                    </v-col>
                    <v-col cols="1">
                      <v-icon> $custom-lens </v-icon>
                    </v-col>
                    <v-col class="text-configs">
                      {{ image.metadata.lens.substring(0, 18) }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="1">
                      <v-icon>$custom-shutter-speed</v-icon>
                    </v-col>
                    <v-col cols="5" class="text-configs">
                      {{ image.metadata.shutterSpeed }}
                    </v-col>
                    <v-col cols="1">
                      <v-icon color="white" size="small"
                        >$custom-aperture</v-icon
                      >
                    </v-col>
                    <v-col cols="5" class="text-configs">
                      {{ image.metadata.aperture }}
                    </v-col>
                  </v-row>
                  <v-row>
                    <v-col cols="1">
                      <v-icon> $custom-iso </v-icon>
                    </v-col>
                    <v-col class="text-configs">
                      {{ image.metadata.iso }}
                    </v-col>
                    <v-col cols="1">
                      <v-icon> $custom-white-balance </v-icon>
                    </v-col>
                    <v-col class="text-configs">
                      {{ image.metadata.whiteBalance.substring(0, 10) }}
                    </v-col>
                  </v-row>
                </v-container>
              </v-card>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </v-carousel>
      <v-btn
        @click="previousImage"
        class="nav-button prev"
        icon
        :style="{ height: size.height, borderRadius: 0 }"
      >
        <v-icon size="20" style="transform: scaleY(10) scaleX(3)"
          >mdi-chevron-left</v-icon
        >
      </v-btn>
      <v-btn
        @click="nextImage"
        class="nav-button next"
        icon
        :style="{ height: size.height, borderRadius: 0 }"
      >
        <v-icon size="20" style="transform: scaleY(10) scaleX(3)"
          >mdi-chevron-right</v-icon
        >
      </v-btn>
    </v-card>
    <v-snackbar class="v-snackbar" v-model="toastInfo" top>{{
      toastMessage
    }}</v-snackbar>
  </v-dialog>
</template>

<script>
import { getDateHour } from "@/utils/date";
import { nextTick } from 'vue';


export default {
  props: {
    image: Object,
    width: Number,
    height: Number,
    cache: Object,
    version: String
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
    };
  },
  computed: {
    size() {
      const proportion = this.width / this.height;
      const screenWidth = window.innerWidth - 100;
      const screenHeight = window.innerHeight - 100;
      const screenProportion = screenWidth / screenHeight;

      if (proportion > screenProportion) {
        return {
          width: screenWidth + "px",
          height: screenWidth / proportion + "px",
        };
      } else {
        return {
          width: screenHeight * proportion + "px",
          height: screenHeight + "px",
        };
      }
    },
    fullLocationText() {
      return `${this.image.country}
      ${this.image.state ? `, ${this.image.state}`: ''}
      ${this.image.city ? `, ${this.image.city}`: ''}\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0`;
    },
    onlyOriginal() {
      return !this.image.images?.length && !!this.image.original;
    },
    computedActiveIndex() {
      return this.noEditedVersion || this.onlyOriginal ? 0 : this.activeIndex;
    },
  },
  methods: {
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
        this.closeImage()
      }
    },
    nextImage() {
      this.$emit("next");
    },
    previousImage() {
      this.$emit("prev");
    },
    closeImage(){
      this.noEditedVersion = this.onlyOriginal ? true : false
      this.activeIndex = 0;
      const teste = this.$emit("close");
      console.log(teste)
    },
    async copyColorCode(color) {
      await navigator.clipboard.writeText(color);

      this.toastMessage = "Código de cor copiado com sucesso: " + color;
      this.toastInfo = true;
    },
    async toggleHoverExpansionPanel(event) {
      console.log(event)
      if (
        event.type === "mouseleave" &&
        event.relatedTarget?.className === "v-overlay__scrim"
      ) {
        this.expandedPanelVisible = false;
      } else if (event.type === "mouseover") {
        this.expandedPanelVisible = true;
      } else if (event.type === "touchend" && event.target.className === 'v-img__img v-img__img--cover') {
        console.log('veio no lugar que devia ocultar')
        await nextTick();
        this.expandedPanelVisible = !this.expandedPanelVisible;
      }
    },
    toggleExpansionPanel(event) {
      event.stopPropagation();
      this.panelExpanded = this.panelExpanded === null ? 0 : null;
    }
  },
  watch: {
    onlyOriginal(newValue) {
      if (newValue) {
        this.noEditedVersion = true;
      }
    },
    activeIndex(newValue) {
      this.$emit("version", this.onlyOriginal ? 'original' : String(newValue + 1));
    },
    noEditedVersion(newValue){
      if (newValue) {
        this.$emit("version", "original");
      } else {
        this.$emit("version", String(this.activeIndex + 1));
      }
    },
    image(value){
      this.activeIndex = Number(this.version) - 1;
      this.noEditedVersion = this.version === 'original' || !value.images?.length ? true : false;
    }
  },
};
</script>

<style scoped>
.nav-button {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
}

.prev {
  left: -45px;
  background-color: transparent;
  color: white;
  transition: background-color 0.3s ease;
}

.next {
  right: -45px;
  background-color: transparent;
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
  margin: 10px;
}

.color-box {
  width: 30px;
  height: 30px;
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

.custom-delimiters {
  position: absolute;
  top: 7px;
  left: 0;
  margin: 4px;
  color: rgba(255, 255, 255, 0.3);
}

.card-configs {
  background-color: rgba(0, 0, 0, 0.7);
}

.text-configs {
  color: #c5c5c5;
}

.card-description-tags {
  background-color: rgba(0, 0, 0, 0.7);
  color: #c5c5c5;
}

.text-description-tags {
  max-height: 200px;
  overflow-y: auto;
}

.text-description-tags::-webkit-scrollbar {
  width: 12px;
  /* Largura da barra de rolagem */
}

/* Estilo para a alça da barra de rolagem */
.text-description-tags::-webkit-scrollbar-thumb {
  background-color: rgba(0, 0, 0, 0.9);
  /* Cor da alça */
  border-radius: 6px;
  /* Raio da borda da alça */
}

/* Estilo para a pista da barra de rolagem */
.text-description-tags::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.1);
  /* Cor de fundo da pista */
}

/* Estilo para o canto da barra de rolagem */
.text-description-tags::-webkit-scrollbar-corner {
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
  text-overflow: ellipsis;
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
  margin-left: 20px;
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
