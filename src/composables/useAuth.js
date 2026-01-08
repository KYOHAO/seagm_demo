import { ref } from 'vue'
import router from '../router'
import { apiFetch } from '../utils/api'

console.log('useAuth: Router imported:', router)


// const router = useRouter() - Don't use composable at top level
const isLoggedIn = ref(!!localStorage.getItem('authToken'))
const token = ref(localStorage.getItem('authToken'))

export function useAuth() {
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
            if (router && router.push) {
                router.push('/login')
            } else {
                window.location.href = '/login'
            }
        }
    }

    return { isLoggedIn, token, login, logout }
}
