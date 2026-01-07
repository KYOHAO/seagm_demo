export async function apiFetch(url, options = {}) {
    const token = localStorage.getItem('authToken')

    const headers = {
        'Content-Type': 'application/json',
        ...options.headers
    }

    if (token) {
        headers['Authorization'] = `Bearer ${token}`
    }

    const config = {
        ...options,
        headers
    }

    try {
        const response = await fetch(url, config)

        if (response.status === 401) {
            console.warn('Session expired or unauthorized. Logging out...')
            localStorage.removeItem('authToken')
            localStorage.removeItem('userInfo')
            window.location.href = '/login'
            // Throwing error to stop downstream processing
            throw new Error('Unauthorized')
        }

        return response
    } catch (error) {
        if (error.message === 'Unauthorized') {
            // Stop propagation if we handled it? 
            // Callers might catch and log "Unauthorized", which is acceptable.
            // We return a rejected promise so await response.json() isn't reached if they did await apiFetch()
            throw error
        }
        throw error
    }
}
