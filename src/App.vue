<template>
  <v-app>
    <header-bar v-if="false"></header-bar> <!-- Incluindo a Header-Bar -->
    <v-main>
      <router-view/> <!-- Aqui são renderizadas as rotas -->
    </v-main>
  </v-app>
</template>

<script>
import HeaderBar from './components/HeaderBar.vue' // Importando o componente HeaderBar
import { mapGetters } from 'vuex'
import { useTheme } from 'vuetify'


export default {
  name: 'App',
  components: {
    HeaderBar
  },
  data: () => ({
    theme: useTheme()
  }),
  computed: {
    ...mapGetters(['isDarkTheme']),
    appStyle() {
      return {
        'background': `linear-gradient(326deg, ${this.theme.global.current.colors.gradientone} 0%,
        ${this.theme.global.current.colors.gradienttwo} 52%,
        ${this.theme.global.current.colors.gradientthree} 100%)`
      }
    }
  },
  beforeMount() {
    this.theme.global.name = this.isDarkTheme ? 'dark' : 'light'
    document.title = 'Yan Lucas | Gallery'
  },
  watch: {
    isDarkTheme(value) {
      this.theme.global.name = value ? 'dark' : 'light'
    }
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  background-color: linear-gradient(to right, #2a5298, #1e3c72);
}

nav {
  padding: 30px;
}

nav a {
  font-weight: bold;
  color: #2c3e50;
}

nav a.router-link-exact-active {
  color: #42b983;
}
</style>