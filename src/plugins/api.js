import axios from 'axios'
const baseURL = process.env.VUE_APP_API_URL || 'http://localhost:3000/'
const RETRY = 0

const api = {
  install(app) {
    const axiosConfig = axios.create({ baseURL })

    axiosConfig.interceptors.request.use(
      (request) => {
        const token = app.config.globalProperties.$store.getters.getUser.token

        if (token) {
          request.headers.Authorization = `Bearer ${token}`
        }

        return request
      },
      (err) => Promise.reject(err)
    )

    axiosConfig.interceptors.response.use(
      (response) => response,
      (error) => interceptResponseError(error)
    )

    const interceptResponseError = async (error) => {
      if (
        error.config &&
        error.response &&
        error.response.status === 500 &&
        (RETRY && (!error.config.numRetry || error.config.numRetry < RETRY))
      ) {
        error.config.numRetry = !error.config.numRetry
          ? 1
          : ++error.config.numRetry
        return await axiosConfig.request(error.config)
      }

      return Promise.reject(error)
    }

    // Use app.config.globalProperties to define global properties
    app.config.globalProperties.$api = axiosConfig
  }
}

export default api
