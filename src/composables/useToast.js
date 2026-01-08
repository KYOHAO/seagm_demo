import { ref } from 'vue'

const toasts = ref([])

export function useToast() {
    const addToast = (message, type = 'info', duration = 3000) => {
        const id = Date.now()
        toasts.value.push({ id, message, type })

        if (duration > 0) {
            setTimeout(() => {
                removeToast(id)
            }, duration)
        }
    }

    const removeToast = (id) => {
        toasts.value = toasts.value.filter(t => t.id !== id)
    }

    const success = (message, duration = 3000) => addToast(message, 'success', duration)
    const error = (message, duration = 3000) => addToast(message, 'danger', duration)
    const info = (message, duration = 3000) => addToast(message, 'info', duration)
    const warning = (message, duration = 3000) => addToast(message, 'warning', duration)

    return {
        toasts,
        addToast,
        removeToast,
        success,
        error,
        info,
        warning
    }
}
