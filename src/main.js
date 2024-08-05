import { createApp } from 'vue'
import App from './App.vue'
import vuetify from './plugins/vuetify'
import api from './plugins/api'
import store from './store'
import { loadFonts } from './plugins/webfontloader'
import router from './router'

vuetify.framework


loadFonts()

createApp(App)
  .use(router)
  .use(vuetify)
  .use(store)
  .use(api)
  .mount('#app')
