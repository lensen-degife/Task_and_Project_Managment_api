import axios from 'axios'

const api = axios.create({
    baseURL: 'https://project-managment-api-7bpk.onrender.com/api',
    headers: {
        'Content-Type': 'application/json',
    },
})

api.interceptors.request.use((config) => {
    const token = sessionStorage.getItem('accessToken')

    if (token) {
        config.headers.Authorization = `Bearer ${token}`
    }

    return config;
})
 api.interceptors.response.use((response) =>response, (error)=>{
    if(error.response?.status === 401){
        sessionStorage.removeItem('accessToken')
        window.location.href = '/login'

    }
    return Promise.reject(error);

 })

export default api