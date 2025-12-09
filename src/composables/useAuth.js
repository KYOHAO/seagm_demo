import { ref } from 'vue'
import { useRouter } from 'vue-router'

const isLoggedIn = ref(!!localStorage.getItem('authToken'))

export function useAuth() {
    const router = useRouter()

    const login = (token, user) => {
        localStorage.setItem('authToken', token)
        localStorage.setItem('userInfo', JSON.stringify(user))
        isLoggedIn.value = true
    }

    const logout = async () => {
        try {
            const token = localStorage.getItem('authToken')
            if (token) {
                await fetch(`${import.meta.env.VITE_API_BASE_URL}/logout`, {
                    method: 'POST',
                    headers: {
                        'Authorization': `Bearer ${token}`
                    }
                })
            }
        } catch (error) {
            console.error('Logout Error:', error)
        } finally {
            localStorage.removeItem('authToken')
            localStorage.removeItem('userInfo')
            isLoggedIn.value = false
            window.location.href = '/login' // Force reload/redirect to ensure clean state
        }
    }

    return { isLoggedIn, login, logout }
}
