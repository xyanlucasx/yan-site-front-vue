<template>
  <v-container>
    <v-infinite-scroll
      :items="items"
      :onLoad="loadImages"
      class="scrollable-list"
    >
      <template v-for="(item, index) in items" :key="item._id">
        <v-container class="clickable-row" @click="openImageModal(item)">
          <v-row no-gutters justify="center">
            <v-col cols="2" class="align-center d-flex">
              <v-img
                :lazy-src="item.images.length ? item.images[0].lazyThumbnailBase64 : item.original.lazyThumbnailBase64"
                :src="item.images.length ? item.images[0].thumbnailUrl : item.original.thumbnailUrl"
                cover
                aspect-ratio="1/1"
                :min-height="100"
                :min-width="100"
                :max-height="100"
                :max-width="100"
                class="mx-auto"
              >
                <template v-slot:placeholder>
                  <v-progress-circular
                    indeterminate
                    color="primary"
                  ></v-progress-circular>
                </template>
              </v-img>
            </v-col>
            <v-col cols="3" sm="3">
              <div class="vertical-align-middle">
                {{ item.country }}, {{ item.state }}, {{ item.city }}
              </div>
            </v-col>
            <v-col cols="3" sm="3">
              <div class="vertical-align-middle">
                {{ item.metadata.takenAt }}
              </div>
            </v-col>
            <v-col cols="3" sm="3">
              <div class="vertical-align-middle">
                {{ item.createdAt }}
              </div>
            </v-col>
            <v-col
              @click.stop="
                showDialog = true;
                indexToDelete = index;
              "
              cols="1"
              sm="1"
            >
              <div class="vertical-align-middle">
                <v-icon class="clickable-delete">mdi-delete</v-icon>
              </div>
            </v-col>
          </v-row>
        </v-container>
        <v-divider></v-divider>
      </template>
    </v-infinite-scroll>
  </v-container>
  <modal-image-edit
    v-model="imageModal"
    :image="selectedImage"
    @input="imageModal = $event"
  />
  <v-dialog v-model="showDialog" max-width="500" persistent>
    <v-card>
      <v-card-title>Confirmação de Exclusão</v-card-title>
      <v-card-text> Tem certeza de que deseja excluir? </v-card-text>
      <v-card-actions>
        <v-btn color="error" @click="deleteImage()">Excluir</v-btn>
        <v-btn text @click="showDialog = false">Cancelar</v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>
  <div v-if="deletingImage" class="dialog-overlay"></div>
  <v-progress-circular
    class="v-progress-circular"
    v-if="deletingImage"
    indeterminate
    color="primary"
  ></v-progress-circular>
  <v-snackbar v-model="success" color="success" top>{{
    successMessage
  }}</v-snackbar>
  <v-snackbar v-model="error" color="error" top>{{ errorMessage }}</v-snackbar>
</template>

<script>
import { ref } from "vue";
import ModalImageEdit from "@/components/ModalEditImage.vue";

export default {
  components: {
    ModalImageEdit,
  },
  data() {
    return {
      searchTags: "",
      dateRange: null,
      menu: false,
      headers: [
        { text: "Country", value: "country" },
        { text: "State", value: "state" },
        { text: "City", value: "city" },
        { text: "Created At", value: "createdAt" },
        { text: "Taken At", value: "metadata.takenAt" },
      ],
      items: ref([]),
      loading: false,
      hasMore: true,
      totalImages: 0,
      perPage: 10,
      offset: 0,
      imageModal: false,
      selectedImage: {},
      indexToDelete: null,
      showDialog: false,
      deletingImage: false,
      success: false,
      successMessage: "",
      error: false,
      errorMessage: "",
    };
  },
  methods: {
    async loadImages({ done }) {
      if (!this.loading && this.hasMore) {
        this.loading = true;
        try {
          const response = await this.$api.get(
            "images",
            {
              params: {
                sort: "createdAt",
                order: "desc",
                tags: this.searchTags,
                takenAtFrom: this.dateRange ? this.dateRange.start : undefined,
                takenAtTo: this.dateRange ? this.dateRange.end : undefined,
                offset: this.offset,
                limit: this.perPage,
              },
            }
          );
          const { images, total } = response.data;
          this.items.push(...images);
          this.totalImages = total;
          this.hasMore = this.offset + this.perPage < total;
          this.offset += this.perPage;
          if (done) done("ok");
        } catch (error) {
          console.error("Erro ao carregar imagens:", error);
        } finally {
          this.loading = false;
        }
      } else {
        if (done) done("empty");
      }
    },
    async openImageModal(item) {
      this.selectedImage = item;
      if (item.original && !item.images.some((image)=> image.versionName === "Original")) {
        this.selectedImage.images.push(item.original);
      }
      this.imageModal = true;
    },
    async deleteImage() {
      try {
        this.deletingImage = true;
        await this.$api.delete(`images/${this.items[this.indexToDelete]._id}`);
        this.items.splice(this.indexToDelete, 1);
        this.success = true;
        this.successMessage = "Imagem excluída com sucesso";
      } catch (error) {
        if (error.code === "ECONNABORTED") {
          alert(
            'Isso está demorando mais do que o esperado. Clique em "OK" e verifique se sua imagem foi deletada após atualizarmos a pagina'
          );
          window.location.reload();
        }
        this.error = true;
        this.errorMessage = "Erro ao excluir imagem";
        console.error("Erro ao excluir imagem:", error);
      } finally {
        this.deletingImage = false;
        this.showDialog = false;
      }
    },
  },
  watch: {
    searchTags() {
      this.offset = 0;
      this.loadImages({});
    },
    dateRange() {
      this.offset = 0;
      this.loadImages();
    },
  }
};
</script>
<style scoped>
.v-progress-circular {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.clickable-row {
  cursor: pointer;
}

.clickable-row:hover {
  background-color: rgba(
    0,
    0,
    0,
    0.1
  ); /* Mudar a cor de fundo ao passar o mouse */
}

.clickable-row:active {
  transform: scale(0.95);
}

.clickable-delete:hover {
  transform: scale(1.5);
}

.clickable-delete:active {
  transform: scale(0.92);
}

.vertical-align-middle {
  display: flex;
  align-items: center;
  height: 100%;
  justify-content: center;
}

.header {
  position: sticky;
  top: 0;
  padding: 8px 16px;
  background-color: white;
  z-index: 2;
}

.dialog-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  backdrop-filter: blur(2px); /* Aplicar efeito de desfoque */
  z-index: 99998; /* Z-index menor que o indicador de progresso */
  border-radius: 3px;
}

.v-progress-circular {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
}
</style>
