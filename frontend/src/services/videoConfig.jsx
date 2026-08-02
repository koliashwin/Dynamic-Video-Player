import { API_URL, apiRequest } from "./api";

// --- clips ---

export const listClips = () => apiRequest('/clips')

export const uploadClip = async (title, file) => {
    const fromData = new FormData()
    fromData.append('title', title)
    fromData.append('file', file)

    return apiRequest('/clips/upload', {
        method: 'POST',
        body: fromData
    })
}

export const deleteClip = (clipId, force = false) => 
    apiRequest(`/clips/${clipId}${force ? '?force=true' : ''}`, { method: 'DELETE'})

// --- sections ---

export const listSections = () => apiRequest('/sections')

export const createSection = (title, type) => 
    apiRequest('/sections', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({title, type})
    })

export const attachClipToSection = (sectionId, clipId, orderIndex) => 
    apiRequest(`/sections/${sectionId}/clips`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({clip_id: clipId, order_index: orderIndex ?? null})
    })

export const detachClipFromSection = (sectionId, linkId, force = false) => 
    apiRequest(`/sections/${sectionId}/clips/${linkId}${force ? '?force=true' : ''}`, { method: 'DELETE'})

export const deleteSection = (sectionId) => 
    apiRequest(`/sections/${sectionId}`, {method: 'DELETE'})

// --- flows ---

export const listFlows = () => apiRequest('/flows')

export const createFlow = (name, description) =>
    apiRequest('/flows', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json'},
        body: JSON.stringify({name, description: description || null})
    })

export const attachSectionToFlow = (flowId, sectionId, orderIndex) => 
    apiRequest(`/flows/${flowId}/sections`, {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ section_id: sectionId, order_index: orderIndex ?? null})
    })

export const detachSectionFromFlow = (flowId, linkId, force = false) => 
    apiRequest(`/flows/${flowId}/sections/${linkId}${force ? '?force=true' : ''}`, { method: 'DELETE'})

export const deleteFlow = (flowId) => 
    apiRequest(`/flows/${flowId}`, {method: 'DELETE'})