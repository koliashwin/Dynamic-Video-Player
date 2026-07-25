import { apiRequest } from "./api";

const getVideoStructure = async (flowId) => {
    const query = flowId ? `?flow_id=${flowId}` : ''
    return apiRequest(`/videos${query}`)
}

export {
    getVideoStructure
};