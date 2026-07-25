export const API_URL = "http://localhost:8000"

export const apiRequest = async (endpoint_path, options = {}) => {
    const response = await fetch(`${API_URL}${endpoint_path}`, options)

    if (!response.ok){
        let detail = response.statusText
        try {
            const body = await response.json()
        } catch {
            // fall back to statusText
        }
        throw new Error(detail)
    }

    if (response.status === 204) return null

    return response.json()
}