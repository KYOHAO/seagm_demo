import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../utils/api'

const isLoggedIn = ref(!!localStorage.getItem('authToken'))
const token = ref(localStorage.getItem('authToken'))

export function useAuth() {
    const router = useRouter()

    const login = (newToken, user) => {
        localStorage.setItem('authToken', newToken)
        localStorage.setItem('userInfo', JSON.stringify(user))
        token.value = newToken
        isLoggedIn.value = true
    }

    const logout = async () => {
        try {
            const token = localStorage.getItem('authToken')
            if (token) {
                await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/logout`, {
                    method: 'POST'
                })
            }
        } catch (error) {
            console.error('Logout Error:', error)
        } finally {
            localStorage.removeItem('authToken')
            localStorage.removeItem('userInfo')
            token.value = null
            isLoggedIn.value = false
            window.location.href = '/login' // Force reload/redirect to ensure clean state
        }
    }

    return { isLoggedIn, token, login, logout }
}
