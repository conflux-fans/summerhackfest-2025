import axios from 'axios'

export const http = axios.create({ timeout: 15000 })

http.interceptors.request.use((config) => {
  return config
})

http.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response) {
      console.error('HTTP Error', error.response.status, error.response.data)
    } else {
      console.error('HTTP Error', error.message)
    }
    return Promise.reject(error)
  }
)


