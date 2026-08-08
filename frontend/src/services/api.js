export const API_URL = import.meta.env.VITE_BACKEND_URL

export const apiRequest = async (endpoint_path, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint_path}`, options)

    if (!response.ok){
        let detail = response.statusText
        try {
            const body = await response.json()
            detail = body.detail || detail
        } catch {
            // fall back to statusText
        }
        const error = new Error(detail)
        error.status = response.status
        throw error
    }

    if (response.status === 204) return null

    return response.json()
}