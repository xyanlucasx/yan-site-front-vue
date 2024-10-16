<template>
  <v-dialog max-width="900">
    <v-card :disabled="loadingSave">
      <v-card-title>Editar Imagem</v-card-title>
      <v-card-text>
        <v-row>
          <v-col cols="6" md="2">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.country"
              label="País"
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.state"
              label="Estado"
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="2">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.city"
              label="Cidade"
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="6">
            <v-textarea
              variant="outlined"
              clearable
              density="compact"
              rows="1"
              v-model="editedImage.description"
              label="Descrição"
              placeholder="Descrição"
            ></v-textarea>
          </v-col>
        </v-row>
        <v-spacer></v-spacer>
        <v-row>
          <v-col cols="8">
            <v-select
              label="Adicionar Tag"
              :items="tags"
              v-model="editedImage.tags"
              item-title="name"
              item-value="name"
              multiple
              variant="outlined"
              density="compact"
              clearable
            >
              <template v-slot:selection="data">
                <v-chip
                  :key="data.item"
                  v-bind="data.attrs"
                  :input-value="data.selected"
                  closable
                  @click:close="removeChip(data.index)"
                >
                  {{ data.item.value }}
                </v-chip>
              </template>
            </v-select>
          </v-col>
          <v-col cols="4">
            <v-text-field
              v-model="editedImage.metadata.takenAt"
              variant="outlined"
              density="compact"
              persistent-placeholder
              label="Fotografada em:"
            >
            </v-text-field>
          </v-col>
        </v-row>
        <v-card-title class="justify-center text-center">Versões <v-btn icon="mdi-eye-outline" @click="viewImageModal = true"></v-btn></v-card-title>
        <v-row justify="center">
          <v-col
            v-for="(image, index) in editedImage.images"
            :key="index"
            cols="3"
            :class="{
              'clickable-col': true,
              'd-flex': true,
              'align-center': true,
              active: lastClickedIndex === index,
            }"
            @click="selectImage(index)"
          >
            <v-img
              :lazy-src="image.lazyThumbnailBase64"
              :src="image.thumbnailUrl"
              width="100"
              height="100"
            >
              <template v-slot:placeholder>
                <v-progress-circular
                  indeterminate
                  color="primary"
                ></v-progress-circular>
              </template>
            </v-img>
          </v-col>
        </v-row>
        <v-row justify="center">
          <v-col cols="6" md="4">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.images[lastClickedIndex].thumbnailUrl"
              label="Thumbnail URL"
              :loading="highlightedField"
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="4">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.images[lastClickedIndex].optimizedUrl"
              label="Optimized URL"
              :loading="highlightedField"
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="4">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.images[lastClickedIndex].fullSizeUrl"
              label="Full Size URL"
              :loading="highlightedField"
            ></v-text-field>
          </v-col>
          <v-col cols="6" md="4">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.images[lastClickedIndex].versionName"
              label="Version Name"
              :loading="highlightedField"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="8">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              rows="1"
              v-model="editedImage.images[lastClickedIndex].lazyThumbnailBase64"
              label="Base64 lazy thumbnail"
              :loading="highlightedField"
            ></v-text-field>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="footer-actions">
        <v-btn color="primary" @click="saveImage">Salvar</v-btn>
        <v-btn color="green darken-1" @click="resetToLastSaved">Desfazer</v-btn>
        <v-btn color="red darken-1" @click="closeImageModal">Fechar</v-btn>
      </v-card-actions>
    </v-card>
    <v-progress-circular
      v-if="loadingSave"
      indeterminate
      color="green"
      size="128"
      width="8"
    ></v-progress-circular>
    <v-snackbar v-model="success" color="success" top>{{
      successMessage
    }}</v-snackbar>
    <v-snackbar v-model="info" color="info" top>{{ infoMessage }}</v-snackbar>
    <v-snackbar v-model="error" color="error" top>{{
      errorMessage
    }}</v-snackbar>
    <modal-viewer-image
    v-model="viewImageModal"
    :width="editedImage.metadata.optimizedWidth"
    :height="editedImage.metadata.optimizedHeight"
    :image="editedImage"
  />
  </v-dialog>
</template>

<script>
import { toRaw } from "vue";
import ModalViewerImage from "@/components/ModalViewerImage.vue";


export default {
  props: {
    image: Object,
    tags: Array,
  },
  components: {
    ModalViewerImage,
  },
  data() {
    return {
      editedImage: structuredClone(toRaw(this.image)),
      lastSavedImage: structuredClone(toRaw(this.image)),
      viewImageModal: false,
      lastClickedIndex: 0,
      highlightedField: false,
      loadingSave: false,
      success: false,
      info: false,
      error: false,
      successMessage: "Imagem salva com sucesso",
      infoMessage: "Imagem restaurada para o último estado salvo",
      errorMessage: "Erro ao salvar imagem",
    };
  },
  watch: {
    image(newImage) {
      this.success = false;
      this.info = false;
      this.error = false;
      this.editedImage = structuredClone(toRaw(newImage));
      this.lastSavedImage = structuredClone(toRaw(newImage));
    },
  },
  methods: {
    closeImageModal() {
      this.$emit("close-modal", false);
    },
    async saveImage() {
      try {
        this.loadingSave = true;
        const updatedPayload = {
          ...this.editedImage,
          images: this.editedImage.images.filter(
            (image) => image.versionName !== "Original"
          ),
          original: this.editedImage.images.find(
            (image) => image.versionName === "Original"
          ),
        };
        const updatedImage = await this.$api.patch(
          `images/${this.editedImage._id}`,
          updatedPayload
        );
        this.lastSavedImage = structuredClone(toRaw(updatedImage.data));
        this.success = true;
        this.$emit("modify-image", updatedImage.data);
      } catch (error) {
        this.error = true;
        console.error(error);
      } finally {
        this.loadingSave = false;
      }
    },
    selectImage(index) {
      this.lastClickedIndex = index;
      this.highlightedField = true;
      setTimeout(() => {
        this.highlightedField = false;
      }, 1000);
    },
    removeChip(index) {
      this.editedImage.tags.splice(index, 1);
    },
    resetToLastSaved() {
      this.editedImage = structuredClone(toRaw(this.lastSavedImage));
      this.info = true;
    },
    openImageViewer() {

    }
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

.clickable-col {
  cursor: pointer;
}

.clickable-col:hover {
  background-color: rgba(0, 0, 0, 0.1);
}

.clickable-col:active {
  transform: scale(0.95);
}

.active {
  background-color: rgba(0, 0, 0, 0.1);
}

.footer-actions {
  position: sticky;
  bottom: 0;
  padding: 8px 16px;
}
</style>
