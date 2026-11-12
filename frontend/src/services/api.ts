import axios from 'axios'

const api = axios.create({
  baseURL: 'https://project-managment-api-7bpk.onrender.com/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

export default api