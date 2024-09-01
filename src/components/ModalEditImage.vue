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
          <v-col cols="12">
            <v-text-field
              variant="outlined"
              density="compact"
              persistent-placeholder
              v-model="newChip"
              label="Adicionar ou remover tags"
              @keydown.enter="addChip"
              @keydown.backspace=" !newChip && removeChip(editedImage.tags.length - 1)"
            >
              <v-chip
                v-for="(chip, index) in editedImage.tags"
                :key="index + chip"
                closable
                @click:close="removeChip(index)"
              >
                {{ chip }}</v-chip
              >
            </v-text-field>
          </v-col>
        </v-row>
        <v-card-title>Versões</v-card-title>
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
          <v-col cols="6" md="6">
            <v-text-field
              variant="outlined"
              clearable
              density="compact"
              v-model="editedImage.images[lastClickedIndex].versionName"
              label="Version Name"
              :loading="highlightedField"
            ></v-text-field>
          </v-col>
          <v-col cols="12" md="6">
            <v-textarea
              variant="outlined"
              clearable
              density="compact"
              rows="1"
              v-model="editedImage.images[lastClickedIndex].lazyThumbnailBase64"
              label="Base64 lazy thumbnail"
              :loading="highlightedField"
            ></v-textarea>
          </v-col>
        </v-row>
      </v-card-text>
      <v-divider></v-divider>
      <v-card-actions class="footer-actions">
        <v-btn color="primary" @click="saveImage">Salvar</v-btn>
        <v-btn color="red darken-1" @click="closeImageModal">Fechar</v-btn>
      </v-card-actions>
    </v-card>
    <v-progress-circular v-if="loadingSave" indeterminate color="green" size="128" width="8"></v-progress-circular>
    <v-snackbar v-model="success" color="success" top>{{ successMessage }}</v-snackbar>
    <v-snackbar v-model="error" color="error" top>{{ errorMessage }}</v-snackbar>
  </v-dialog>
</template>

<script>

export default {
  props: {
    image: Object,
  },
  data() {
    return {
      editedImage: { ...this.image },
      lastClickedIndex: 0,
      highlightedField: false,
      newChip: "",
      loadingSave: false,
      success: false,
      error: false,
      successMessage: "Imagem salva com sucesso",
      errorMessage: "Erro ao salvar imagem",
    };
  },
  watch: {
    image(newImage) {
      this.editedImage = { ...newImage };
    },
  },
  methods: {
    closeImageModal() {
      this.$emit("input", false);
    },
    async saveImage() {
      try{
      this.loadingSave = true
      const updatedPayload = {
        ...this.editedImage,
        images: this.editedImage.images.filter(image=> image.versionName !== "Original"),
        original: this.editedImage.images.find(image=> image.versionName === "Original"),
      };
      await this.$api.patch(`images/${this.editedImage._id}`, updatedPayload);
      this.success = true;
    } catch (error) {
      this.error = true;
      console.error(error);
    } finally {
      this.loadingSave = false
    }
    },
    selectImage(index) {
      this.lastClickedIndex = index;
      this.highlightedField = true;
      setTimeout(() => {
        this.highlightedField = false;
      }, 1000);
    },
    addChip() {
      if (this.newChip.trim() !== "") {
        this.editedImage.tags.push(this.newChip);
        this.newChip = "";
      }
    },
    removeChip(index) {
      this.editedImage.tags.splice(index, 1);
    },
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
  background-color: white;
  padding: 8px 16px;
}
</style>
