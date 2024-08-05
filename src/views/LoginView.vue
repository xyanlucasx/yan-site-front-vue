<template>
      <v-card class="mx-auto md6 xs12 pa-6" max-width="550">
        <h1>Login</h1>
          <v-text-field
            class="mt-6"
            v-model="name"
            :loading="loading"
          />
          <v-text-field
            :loading="loading"
            class="mt-6"
            label="Senha"
            v-model="password"
            :icon="showPass ? 'mdi-eye' : 'mdi-eye-off'"
            :type="showPass ? 'text' : 'password'"
            @click:append="showPass = !showPass"
          />

          <v-card-actions class="justify-center">
            <v-spacer />
            <v-btn depressed :loading="loading" color="primary" type="submit" @click="login"> Logar </v-btn>
          </v-card-actions>
      </v-card>
      <v-snackbar v-model="success" color="success" top>{{ successMessage }}</v-snackbar>
      <v-snackbar v-model="error" color="error" top>{{ errorMessage }}</v-snackbar>
  </template>

  <script>
  import { mapActions } from 'vuex'
  export default {
    data() {
      return {
        name: '',
        password: '',
        loading: false,
        showPass: false,
        success: false,
        error: false,
        successMessage: 'Logado com sucesso',
        errorMessage: 'Usuário não encontrado ou senha incorreta'
      }
    },
    methods: {
      ...mapActions(['setUser']),
      async login() {
        try {
          this.loading = true
          const { data } = await this.$api.post('authentication', {
            name: this.name,
            password: this.password
          })
          this.setUser(data)
          this.success = true
          this.$router.push('/list')
        } catch (error) {
            this.error = true
        } finally {
          this.loading = false
        }
      }
    }
  }
  </script>