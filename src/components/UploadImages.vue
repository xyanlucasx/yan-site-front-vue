<template>
  <v-app :dark="darkMode">
    <v-container>
      <v-row justify="center">
        <v-col cols="12" sm="8" md="6">
          <v-card>
            <v-card-title>Upload de Imagens</v-card-title>
            <v-card-text>
              <v-row
                v-for="(file, index) in files"
                :key="index"
                justify="space-between"
              >
                <v-col cols="12">
                  <v-file-input
                    v-model="file.file"
                    label="Escolha uma imagem"
                    accept="image/*"
                    @change="handleFileChange(index)"
                    @click:clear="removeImage(index)"
                    density="compact"
                  ></v-file-input>
                  <v-img
                    v-if="file.preview"
                    :src="file.preview"
                    max-height="200"
                  ></v-img>
                </v-col>
                <v-col cols="6">
                  <v-text-field
                    v-model="file.versionNames"
                    label="Nome da versão"
                    placeholder="V1"
                    :disabled="auxOriginalCheckbox[index]"
                    required
                    density="compact"
                  ></v-text-field>
                </v-col>
                <v-col cols="6">
                  <v-checkbox
                    label="Original"
                    v-model="auxOriginalCheckbox[index]"
                    @update:model-value="selectCheckbox($event, index)"
                    @click:prepend="removeCheckbox()"
                    density="compact"
                  ></v-checkbox>
                </v-col>
                <v-col cols="12">
                  <v-divider></v-divider>
                </v-col>
              </v-row>
              <v-textarea
                v-model="description"
                label="Descrição"
                placeholder="Descrição (opcional)"
                density="compact"
              ></v-textarea>
            </v-card-text>
            <v-card-actions>
              <v-btn @click="uploadImages" :loading="loading" color="primary" density="compact"
                >Enviar</v-btn
              >
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
      <v-snackbar class="v-snackbar" v-model="error" color="error" top>{{
        errorMessage
      }}</v-snackbar>
    </v-container>
    <modal-image-edit
      v-model="imageModal"
      :image="uploadedImage"
      @input="imageModal = $event"
    />
  </v-app>
</template>

<script>
import ModalImageEdit from "@/components/ModalEditImage.vue";

export default {
  components: {
    ModalImageEdit,
  },
  data() {
    return {
      files: [{ file: null, versionNames: "V1", preview: null }],
      description: "",
      loading: false,
      error: false,
      errorMessage: "",
      darkMode: true,
      imageModal: false,
      uploadedImage: {},
      auxOriginalCheckbox: [false],
    };
  },
  methods: {
    async handleFileChange(index) {
      const file = this.files[index].file;
      if (!file) return;

      const reader = new FileReader();
      reader.onload = (e) => {
        this.files[index].preview = e.target.result;
      };
      reader.readAsDataURL(file);

      this.files.push({
        file: null,
        versionNames: `V${index + 2}`,
        preview: null,
      });
      this.auxOriginalCheckbox.push(false);
    },
    async openImageModal(item) {
      this.uploadedImage = item;
      this.imageModal = true;
    },
    async uploadImages() {
      this.loading = true;
      try {
        const formData = new FormData();
        this.files.forEach((file, index) => {
          formData.append(`files`, file.file);
          formData.append(`versionNames[${index}]`, file.versionNames);
        });
        formData.append("description", this.description);
        const response = await this.$api.post("images",formData);
        this.loading = false;
        this.openImageModal(response.data);
        this.resetForm();
      } catch (error) {
        console.error("Erro ao realizar o envio:", error);
        this.error = true;
        this.errorMessage = "Erro ao realizar o envio";
      } finally {
        this.loading = false;
      }
    },
    removeImage(index) {
      this.files.splice(index, 1);
      this.auxOriginalCheckbox.splice(index, 1);
    },
    resetForm() {
      (this.files = [{ file: null, versionNames: "", preview: null }]),
        (this.auxOriginalCheckbox = [false]);
      this.description = "";
      setTimeout(() => {
        this.success = false;
      }, 3000);
    },
    selectCheckbox(state, index) {
      if (state) {
        this.files[index].versionNames = "Original";

        this.auxOriginalCheckbox.forEach((item, i) => {
          if (i !== index) {
            this.auxOriginalCheckbox[i] = false;
            if (this.files[i].versionNames.toLowerCase() === 'original') {
              this.files[i].versionNames = "";
            }
          }
        });
      } else {
        this.files[index].versionNames = "";
      }
    },
  },
};
</script>

<style scoped>
.v-application {
  background-color: #f4f4f4;
}

.v-application--is-dark {
  background-color: #121212;
  color: #fff;
}
</style>
