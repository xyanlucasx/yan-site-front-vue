<template>
  <v-app-bar rounded height="30">
    <v-spacer></v-spacer>
    <v-switch
      v-model="isDarkTheme"
      @change="toggleTheme"
      append-icon="mdi-weather-night"
      prepend-icon="mdi-white-balance-sunny"
        class="switch-style"
    ></v-switch>
  </v-app-bar>
</template>

<script>
import { mapGetters, mapActions } from "vuex";

export default {
  name: "HeaderBar",
  computed: {
    ...mapGetters(["isDarkTheme"]),
  },
  methods: {
    ...mapActions(["toggleTheme"]),
  },
};
</script>

<style scoped>
.v-app-bar {
  background-color: transparent; /* Fundo preto da barra */
  position: relative;
  border-radius: 20px;
  overflow: hidden; /* Mantém os efeitos dentro dos limites da barra */
  margin-top: 10px;
  margin-left: 10px;
  margin-right: 10px;
}

@keyframes glow {
  0%, 100% {
    box-shadow: 0 0 10px 1px cyan;
  }
  25% {
    box-shadow: 0 0 10px 1px magenta;
  }
  50% {
    box-shadow: 0 0 10px 1px cyan;
  }
  75% {
    box-shadow: 0 0 10px 1px magenta;
  }
}

.switch-style {
  margin-top: 20px; /* Centraliza verticalmente */
}
</style>
