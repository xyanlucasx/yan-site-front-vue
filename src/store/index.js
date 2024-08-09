import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  state() {
    return {
      user: {},
      darkTheme: true
    }
  },

  mutations: {
    setUser(state, user) {
      state.user = user
    },
    toggleTheme(state) {
      state.darkTheme = !state.darkTheme;
    }
  },

  actions: {
    setUser({ commit }, user) {
      commit('setUser', { ...user })
    },
    toggleTheme(context) {
      context.commit('toggleTheme');
    }
  },

  getters: {
    getUser(state) {
      return state.user
    },
    isDarkTheme: state => state.darkTheme
  },

  plugins: [createPersistedState()]
})
