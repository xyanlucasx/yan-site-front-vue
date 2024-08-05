// Styles
import '@mdi/font/css/materialdesignicons.css'
import 'vuetify/styles'

// Vuetify
import { createVuetify } from 'vuetify'

// Icons
import customDownload from '@/customIcons/customDownload.vue'
import customISO from '@/customIcons/customISO.vue'
import customAperture from '@/customIcons/customAperture.vue'
import customCamera from '@/customIcons/customCamera.vue'
import customLens from '@/customIcons/customLens.vue'
import customShutterSpeed from '@/customIcons/customShutterSpeed.vue'
import customWhiteBalance from '@/customIcons/customWhiteBalance.vue'
import customMap from '@/customIcons/customMap.vue'
import customStreetView from '@/customIcons/customStreetView.vue'
import customPhotographed from '@/customIcons/customPhotographed.vue'
import customPost from '@/customIcons/customPost.vue'
import customNoEdit from '@/customIcons/customNoEdit.vue'
import customEdit from '@/customIcons/customEdit.vue'

const customAliases = {
  'custom-download': customDownload,
  'custom-iso': customISO,
  'custom-aperture': customAperture,
  'custom-camera': customCamera,
  'custom-lens': customLens,
  'custom-shutter-speed': customShutterSpeed,
  'custom-white-balance': customWhiteBalance,
  'custom-map': customMap,
  'custom-street-view': customStreetView,
  'custom-photographed': customPhotographed,
  'custom-post': customPost,
  'custom-no-edit': customNoEdit,
  'custom-edit': customEdit
}

export default createVuetify({
  icons: {
    defaultSet: 'mdi',
    aliases: {
      ...customAliases // Adicione seus próprios aliases aqui
    }
  },
  theme: {
    defaultTheme: 'dark',
    themes: {
      light: {
        colors: {
          background: '#FFFFFF', // Branco para fundo
          surface: '#F2F2F2', // Cinza claro para superfícies
          primary: '#6200EE', // Roxo intenso para elementos primários
          secondary: '#03DAC6', // Verde-água para elementos secundários
          accent: '#FFC107', // Âmbar para destaques
          error: '#B00020', // Vermelho para erros
          info: '#2196F3', // Azul para informações
          success: '#4CAF50', // Verde para sucesso
          warning: '#FB8C00' // Laranja para avisos
        }
      },
      dark: {
        dark: true,
        colors: {
          background: '#121212', // Cinza muito escuro para fundo
          surface: '#121212', // Cinza escuro para superfícies
          primary: '#BB86FC', // Roxo claro para elementos primários
          secondary: '#03DAC6', // Verde-água mantido no modo escuro
          accent: '#FFC107', // Âmbar mantido no modo escuro
          error: '#CF6679', // Vermelho suave para erros
          info: '#2196F3', // Azul mantido no modo escuro
          success: '#4CAF50', // Verde mantido no modo escuro
          warning: '#FB8C00' // Laranja mantido no modo escuro
        }
      }
    }
  }
})
