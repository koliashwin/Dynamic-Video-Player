let getTokenFn = null
let resolveReady
const readyPromise = new Promise((resolve) => {resolveReady = resolve})

export const registerTokenGetter = (fn) => {
    getTokenFn = fn
    resolveReady()
}

export const getAuthToken = async () => {
    await readyPromise
    if (!getTokenFn) return null
    try {
        return await getTokenFn()
    } catch {
        return null
    }
}