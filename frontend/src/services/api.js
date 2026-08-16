import { getAuthToken } from "./Authtoken"

export const API_URL = import.meta.env.VITE_BACKEND_URL

export const apiRequest = async (endpoint_path, options = {}) => {
    const token = await getAuthToken()

    const headers = {
        ...(options.headers || {}),
        ...(token ? {Authorization: `Bearer ${token}`} : {})
    }

    const response = await fetch(`${API_URL}${endpoint_path}`, {...options, headers})

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