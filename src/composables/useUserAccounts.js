
import { ref } from 'vue'
import { useGameStores } from './useGameStores'
import { apiFetch } from '../utils/api'

export function useUserAccounts() {
    const gameAccounts = ref([])
    const bankAccounts = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    const fetchGameAccounts = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me/game-account`)
            const data = await response.json()
            if (response.ok && data.code === 0) {
                // Fetch stores to map names using composable
                const { stores, fetchGameStores } = useGameStores()
                await fetchGameStores()

                let storesMap = {}
                if (stores.value.length > 0) {
                    stores.value.forEach(s => {
                        storesMap[s.id] = s.name
                    })
                }

                gameAccounts.value = data.data.game_accounts.map(acc => ({
                    ...acc,
                    store_name: storesMap[acc.store_id] || acc.store_name || 'Unknown Store'
                }))
            } else {
                throw new Error(data.msg || 'Failed to fetch game accounts')
            }
        } catch (err) {
            console.error('Fetch Game Accounts Error:', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    const fetchBankAccounts = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/me/bank-account`)
            const data = await response.json()
            if (response.ok && data.code === 0) {
                bankAccounts.value = data.data.bank_accounts
            } else {
                throw new Error(data.msg || 'Failed to fetch bank accounts')
            }
        } catch (err) {
            console.error('Fetch Bank Accounts Error:', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    return {
        gameAccounts,
        bankAccounts,
        isLoading,
        error,
        fetchGameAccounts,
        fetchBankAccounts
    }
}
