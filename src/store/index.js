import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  state() {
    return {
      user: {}
    }
  },

  mutations: {
    setUser(state, user) {
      state.user = user
    }
  },

  actions: {
    setUser({ commit }, user) {
      commit('setUser', { ...user })
    }
  },

  getters: {
    getUser(state) {
      return state.user
    }
  },

  plugins: [createPersistedState()]
})
