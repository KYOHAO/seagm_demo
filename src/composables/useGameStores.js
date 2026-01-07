
import { ref } from 'vue'
import { apiFetch } from '../utils/api'

export function useGameStores() {
    const stores = ref([])
    const isLoading = ref(false)
    const error = ref(null)

    const fetchGameStores = async () => {
        isLoading.value = true
        error.value = null
        try {
            const response = await apiFetch(`${import.meta.env.VITE_API_BASE_URL}/api/v1/stores`)
            const data = await response.json()

            if (response.ok && data.code === 0) {
                // Return processed stores with price placeholder for display compatibility
                stores.value = data.data.stores.map((store, index) => ({
                    id: store.id,
                    name: store.name,
                    cover_photo: store.cover_photo,
                    image: store.cover_photo, // Alias for compatibility
                    // Random price for display since API doesn't list price in store summary easily without points logic
                    price: 'TWD ' + (Math.floor(Math.random() * 500) + 50)
                }))
            } else {
                throw new Error(data.msg || 'Failed to fetch game stores')
            }
        } catch (err) {
            console.error('Fetch Game Stores Error:', err)
            error.value = err.message
        } finally {
            isLoading.value = false
        }
    }

    return {
        stores,
        isLoading,
        error,
        fetchGameStores
    }
}
