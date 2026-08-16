import React, { useEffect } from 'react'
import AppRouter from './routes/AppRouter'
import { ClerkLoaded, ClerkLoading, useAuth } from '@clerk/clerk-react'
import { registerTokenGetter } from './services/Authtoken'
import { Box, CircularProgress } from '@mui/material'
import { palette } from './theme'

const AuthenticatedApp = () => {
    const { getToken } = useAuth()

    useEffect(() => {
        registerTokenGetter(getToken)
    }, [getToken])

    return (
        <AppRouter />
    )
}

const App = () => {
    return (
        <>
            <ClerkLoading>
                <Box
                    sx={{
                        minHeight: '100vh',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center'
                    }}
                >
                    <CircularProgress sx={{ color: palette.filmAmber }} />
                </Box>
            </ClerkLoading>
            <ClerkLoaded>
                <AuthenticatedApp />
            </ClerkLoaded>
        </>
    )
}

export default App
