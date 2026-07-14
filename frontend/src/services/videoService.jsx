const API_URL = "http://localhost:8000"

const getVideoStructure = async () => {
    const response = await fetch(
        `${API_URL}/videos`
    );

    if (!response.ok) {
        throw new Error("failed to load videos");
    }

    return response.json();
}

export {
    getVideoStructure
};